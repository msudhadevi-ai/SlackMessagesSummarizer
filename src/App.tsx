import React, { useState } from "react";
import ChannelSidebar from "./components/ChannelSidebar";
import SlackMessageFeed from "./components/SlackMessageFeed";
import DigestPanel from "./components/DigestPanel";
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

export default function App() {
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

  // Locate references
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const activeMessages = activeScenario.channels[activeChannelId] || [];

  const activeCacheKey = `${activeScenarioId}_${activeChannelId}`;
  const activeDigest = digestsCache[activeCacheKey] || null;
  const isCurrentlyLoading = !!loadingChannels[activeCacheKey];
  const currentError = errorChannels[activeCacheKey] || null;

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

  // Toggles task checkbox status in specific digest report
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

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans select-none">
      {/* Simulation Ribbon Note info */}
      <header className="bg-slate-900 text-white py-2.5 px-6 flex items-center justify-between text-xs border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="bg-[#36C5F0] text-slate-955 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
            Interactive Play Mode
          </span>
          <span className="text-slate-300">
            Simulate realistic group chat logs about corporate releases and incidents.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 max-w-[280px] truncate">
            Active System: <strong className="text-slate-200">Gemini 3.5 Operational Analyst</strong>
          </span>
        </div>
      </header>

      {/* Main Sandbox Panel Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <ChannelSidebar
          channels={CHANNELS}
          activeChannelId={activeChannelId}
          onSelectChannel={(id) => setActiveChannelId(id)}
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={(id) => {
            setActiveScenarioId(id);
            // Auto select engineering when switching scenario contexts
            setActiveChannelId("engineering");
          }}
        />

        {/* Workspace Slack Messages Board */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <SlackMessageFeed
            channelName={activeChannel.name}
            channelDescription={activeChannel.description}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Manager AI Digest Side-Report */}
        <DigestPanel
          digest={activeDigest}
          isLoading={isCurrentlyLoading}
          onGenerateDigest={handleGenerateDigest}
          onToggleActionStatus={handleToggleActionStatus}
          errorMsg={currentError}
          channelName={activeChannel.name}
          scenarioName={activeScenario.name}
        />
      </div>
    </div>
  );
}
