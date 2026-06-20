import React, { useState } from "react";
import ChannelSidebar from "./components/ChannelSidebar";
import SlackMessageFeed from "./components/SlackMessageFeed";
import DigestPanel from "./components/DigestPanel";
import MultiChannelBoard from "./components/MultiChannelBoard";
import { CHANNELS, SCENARIOS } from "./mockData";
import { Scenario, Message, DigestReport, ActionItem } from "./types";
import { 
  Sparkles, 
  HelpCircle, 
  Info,
  Layers, 
  CheckCircle2, 
  Settings,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import LoginScreen from "./components/LoginScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authType, setAuthType] = useState<"supabase" | "demo" | null>(null);

  // Store scenarios in deep state so user messages can update local history
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    // Return a deep-copy clone of the preset scenarios
    return JSON.parse(JSON.stringify(SCENARIOS));
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string>("v2-launch-day");
  const [activeChannelId, setActiveChannelId] = useState<string>("engineering");

  // Keep a map of generated digests so managers don't lose progress when switching channels
  // Key format: `{scenarioId}_{channelId}`
  const [digestsCache, setDigestsCache] = useState<Record<string, DigestReport>>({});
  const [loadingChannels, setLoadingChannels] = useState<Record<string, boolean>>({});
  const [errorChannels, setErrorChannels] = useState<Record<string, string | null>>({});

  // Multi-Channel states
  const [isMultiChannelMode, setIsMultiChannelMode] = useState<boolean>(false);
  const [selectedChannelIds, setSelectedChannelIds] = useState<Record<string, boolean>>({
    engineering: true,
    support: true,
    leadership: false,
  });
  
  // Track cross-channel digests keyed by activeScenarioId
  const [multiDigestsCache, setMultiDigestsCache] = useState<Record<string, DigestReport>>({});
  const [loadingMultiDigests, setLoadingMultiDigests] = useState<Record<string, boolean>>({});
  const [errorMultiDigests, setErrorMultiDigests] = useState<Record<string, string | null>>({});

  const activeMultiDigest = multiDigestsCache[activeScenarioId] || null;
  const isMultiLoading = !!loadingMultiDigests[activeScenarioId];
  const activeMultiError = errorMultiDigests[activeScenarioId] || null;

  // Locate references
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const activeMessages = activeScenario.channels[activeChannelId] || [];

  const activeCacheKey = `${activeScenarioId}_${activeChannelId}`;
  const activeDigest = digestsCache[activeCacheKey] || null;
  const isCurrentlyLoading = !!loadingChannels[activeCacheKey];
  const currentError = errorChannels[activeCacheKey] || null;

  // Toggle check/uncheck for channel in multi-select mode
  const handleToggleChannelSelect = (channelId: string) => {
    setSelectedChannelIds((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  // Handler to add a message or thread reply to active channel state
  const handleSendMessage = (
    senderName: string,
    role: string,
    avatar: string,
    content: string,
    threadParentId?: string
  ) => {
    // Generate simulated timestamp
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setScenarios((prevScenarios) => {
      return prevScenarios.map((scen) => {
        if (scen.id !== activeScenarioId) return scen;

        const currentChanMessages = scen.channels[activeChannelId] || [];
        let updatedMessages: Message[] = [];

        if (threadParentId) {
          // Add as thread reply
          updatedMessages = currentChanMessages.map((msg) => {
            if (msg.id !== threadParentId) return msg;
            const replies = msg.replies ? [...msg.replies] : [];
            const newReply = {
              id: `reply-${Date.now()}`,
              user: senderName,
              role,
              avatar,
              content,
              timestamp,
            };
            return {
              ...msg,
              replies: [...replies, newReply],
            };
          });
        } else {
          // Add as main message
          const newMsg: Message = {
            id: `msg-${Date.now()}`,
            user: senderName,
            role,
            avatar,
            content,
            timestamp,
            reactions: [],
            replies: [],
          };
          updatedMessages = [...currentChanMessages, newMsg];
        }

        return {
          ...scen,
          channels: {
            ...scen.channels,
            [activeChannelId]: updatedMessages,
          },
        };
      });
    });
  };

  // Handler to trigger the server-side Gemini operational digest
  const handleGenerateDigest = async () => {
    setLoadingChannels((prev) => ({ ...prev, [activeCacheKey]: true }));
    setErrorChannels((prev) => ({ ...prev, [activeCacheKey]: null }));

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: activeChannel.name,
          scenarioName: activeScenario.name,
          messages: activeMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse conversation logs.");
      }

      setDigestsCache((prev) => ({
        ...prev,
        [activeCacheKey]: data,
      }));
    } catch (err: any) {
      console.error("Digest generation error:", err);
      setErrorChannels((prev) => ({
        ...prev,
        [activeCacheKey]: err.message || "An unexpected error occurred during summarization.",
      }));
    } finally {
      setLoadingChannels((prev) => ({ ...prev, [activeCacheKey]: false }));
    }
  };

  // Handler to trigger multi-channel aggregation
  const handleGenerateMultiDigest = async () => {
    setLoadingMultiDigests((prev) => ({ ...prev, [activeScenarioId]: true }));
    setErrorMultiDigests((prev) => ({ ...prev, [activeScenarioId]: null }));

    try {
      // Build channelsData array
      const channelsData = CHANNELS.filter(c => !!selectedChannelIds[c.id]).map(c => {
        return {
          channelName: c.name,
          messages: activeScenario.channels[c.id] || [],
        };
      });

      const response = await fetch("/api/summarize-multiple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioName: activeScenario.name,
          channelsData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse cross-channel conversation logs.");
      }

      setMultiDigestsCache((prev) => ({
        ...prev,
        [activeScenarioId]: data,
      }));
    } catch (err: any) {
      console.error("Multi-digest generation error:", err);
      setErrorMultiDigests((prev) => ({
        ...prev,
        [activeScenarioId]: err.message || "An unexpected error occurred during cross-channel summarization.",
      }));
    } finally {
      setLoadingMultiDigests((prev) => ({ ...prev, [activeScenarioId]: false }));
    }
  };

  // Toggles task checkbox status in specific single-channel digest report
  const handleToggleActionStatus = (taskId: string) => {
    setDigestsCache((prev) => {
      const currentDigest = prev[activeCacheKey];
      if (!currentDigest) return prev;

      const updatedActionItems = currentDigest.actionItems.map((item) => {
        if (item.id !== taskId) return item;
        return {
          ...item,
          status: item.status === "completed" ? "pending" : "completed",
        } as ActionItem;
      });

      return {
        ...prev,
        [activeCacheKey]: {
          ...currentDigest,
          actionItems: updatedActionItems,
        },
      };
    });
  };

  // Toggles task checkbox status in specific multi-channel digest report
  const handleToggleMultiActionStatus = (taskId: string) => {
    setMultiDigestsCache((prev) => {
      const currentDigest = prev[activeScenarioId];
      if (!currentDigest) return prev;

      const updatedActionItems = currentDigest.actionItems.map((item) => {
        if (item.id !== taskId) return item;
        return {
          ...item,
          status: item.status === "completed" ? "pending" : "completed",
        } as ActionItem;
      });

      return {
        ...prev,
        [activeScenarioId]: {
          ...currentDigest,
          actionItems: updatedActionItems,
        },
      };
    });
  };

  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={(email, type) => {
          setCurrentUser(email);
          setAuthType(type);
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans select-none">
      {/* Simulation Ribbon Note info */}
      <header className="bg-slate-900 text-white py-2.5 px-6 flex items-center justify-between text-xs border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="bg-[#36C5F0] text-slate-900 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-sans">
            Interactive Play Mode
          </span>
          <span className="text-slate-300">
            Simulate realistic group chat logs about corporate releases and incidents.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-medium font-sans">
            <span className={`w-1.5 h-1.5 rounded-full ${authType === "supabase" ? "bg-emerald-400" : "bg-purple-400 animate-pulse"}`}></span>
            <span className="text-slate-405">
              {authType === "supabase" ? "Supabase" : "Demo"}: <strong className="text-slate-100 font-semibold">{currentUser}</strong>
            </span>
          </div>
          <button 
            onClick={() => {
              setCurrentUser(null);
              setAuthType(null);
            }}
            className="text-[10px] uppercase font-bold text-slate-400 hover:text-white border border-slate-700 px-2 rounded cursor-pointer hover:bg-slate-800 py-1 transition-colors font-mono"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Sandbox Panel Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <ChannelSidebar
          channels={CHANNELS}
          activeChannelId={activeChannelId}
          onSelectChannel={(id) => {
            setIsMultiChannelMode(false); // return to message feed mode
            setActiveChannelId(id);
          }}
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={(id) => {
            setActiveScenarioId(id);
            // Auto select engineering when switching scenario contexts
            setActiveChannelId("engineering");
          }}
          isMultiChannelMode={isMultiChannelMode}
          onToggleMultiChannelMode={() => setIsMultiChannelMode(!isMultiChannelMode)}
          selectedChannelIds={selectedChannelIds}
          onToggleChannelSelect={handleToggleChannelSelect}
        />

        {/* Workspace Slack Messages Board */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {isMultiChannelMode ? (
            <MultiChannelBoard
              channels={CHANNELS}
              selectedChannelIds={selectedChannelIds}
              onToggleChannelSelect={handleToggleChannelSelect}
              scenario={activeScenario}
              isGenerating={isMultiLoading}
              onGenerateDigest={handleGenerateMultiDigest}
            />
          ) : (
            <SlackMessageFeed
              channelName={activeChannel.name}
              channelDescription={activeChannel.description}
              messages={activeMessages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>

        {/* Manager AI Digest Side-Report */}
        <DigestPanel
          digest={isMultiChannelMode ? activeMultiDigest : activeDigest}
          isLoading={isMultiChannelMode ? isMultiLoading : isCurrentlyLoading}
          onGenerateDigest={isMultiChannelMode ? handleGenerateMultiDigest : handleGenerateDigest}
          onToggleActionStatus={isMultiChannelMode ? handleToggleMultiActionStatus : handleToggleActionStatus}
          errorMsg={isMultiChannelMode ? activeMultiError : currentError}
          channelName={isMultiChannelMode ? "Cross-Channel Compilation" : activeChannel.name}
          scenarioName={activeScenario.name}
        />
      </div>
    </div>
  );
}
