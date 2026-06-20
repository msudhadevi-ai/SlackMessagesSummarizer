import React, { useState } from "react";
import { Message, ThreadReply } from "../types";
import { 
  Users, 
  Send, 
  Smile, 
  MessageSquare,
  HelpCircle,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface SlackMessageFeedProps {
  channelName: string;
  channelDescription: string;
  messages: Message[];
  onSendMessage: (senderName: string, role: string, avatar: string, content: string, threadParentId?: string) => void;
}

// Preset personas to simulate
const PERSONAS = [
  { name: "Alex Rivera", role: "Engineering Lead", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
  { name: "Sarah Chen", role: "VP Product", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80" },
  { name: "Ryan Mercer", role: "Site Reliability Eng", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
  { name: "Chloe Kim", role: "QA Specialist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
  { name: "Marcus Thompson", role: "Support Director", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80" }
];

export default function SlackMessageFeed({
  channelName,
  channelDescription,
  messages,
  onSendMessage,
}: SlackMessageFeedProps) {
  const [inputText, setInputText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // Toggle thread view
  const toggleThread = (messageId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleSendMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(selectedPersona.name, selectedPersona.role, selectedPersona.avatar, inputText);
    setInputText("");
  };

  const handleSendReply = (messageId: string) => {
    const text = replyInputs[messageId];
    if (!text || !text.trim()) return;
    onSendMessage(selectedPersona.name, selectedPersona.role, selectedPersona.avatar, text, messageId);
    setReplyInputs(prev => ({ ...prev, [messageId]: "" }));
    // Ensure thread stays expanded
    setExpandedThreads(prev => ({ ...prev, [messageId]: true }));
  };

  // Helper to parse simple code block or bold elements for realistic rendering
  const formatSlackMessage = (content: string) => {
    if (!content) return "";
    
    // Split by lines
    return content.split("\n").map((line, idx) => {
      let elements: React.ReactNode = line;

      // Simple parsing of links like [Notion Doc] or [V2 Changelog Public Draft]
      const linkRegex = /\[([^\]]+)\]/g;
      if (linkRegex.test(line)) {
        const matches = line.matchAll(linkRegex);
        let lastIndex = 0;
        const textParts: React.ReactNode[] = [];
        let key = 0;

        for (const match of matches) {
          const matchIndex = match.index;
          if (matchIndex !== undefined) {
            textParts.push(line.slice(lastIndex, matchIndex));
            textParts.push(
              <span key={key++} className="text-blue-600 hover:underline cursor-pointer font-medium bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                {match[1]}
              </span>
            );
            lastIndex = matchIndex + match[0].length;
          }
        }
        textParts.push(line.slice(lastIndex));
        elements = <>{textParts}</>;
      }

      // Simple highlight for highlights or tags like @Sarah Chen
      if (typeof elements === "string" && elements.includes("@")) {
        const words = elements.split(" ");
        elements = (
          <>
            {words.map((word, wIdx) => {
              if (word.startsWith("@")) {
                return (
                  <span key={wIdx} className="bg-purple-100 text-purple-800 font-semibold px-1 py-0.5 rounded text-xs mr-1 select-none">
                    {word}
                  </span>
                );
              }
              return word + " ";
            })}
          </>
        );
      }

      return <p key={idx} className="min-h-5 leading-relaxed text-gray-800 break-words">{elements}</p>;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFD] h-full relative">
      {/* Feed Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Hash className="w-5 h-5 text-gray-500 font-bold" />
            <h2 className="text-lg font-semibold text-slate-900">{channelName} <span className="text-slate-400 font-normal ml-1">| Simulated Feed</span></h2>
          </div>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wide">Live Sync</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded">
            <Users className="w-3.5 h-3.5" />
            5 participants
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        {messages.map((msg) => {
          const isThreadOpen = !!expandedThreads[msg.id];
          const hasReplies = msg.replies && msg.replies.length > 0;

          return (
            <div key={msg.id} className="group flex flex-col gap-1.5 hover:bg-gray-100/40 -mx-6 px-6 py-2.5 transition-colors">
              {/* Outer Message Item */}
              <div className="flex items-start gap-3">
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className="w-8 h-8 rounded bg-orange-400 flex items-center justify-center text-white text-[10px] font-bold object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${msg.user}`;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">{msg.user}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.5 rounded font-mono border border-slate-200">
                      {msg.role}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="mt-1.5 space-y-1 text-sm text-gray-800">
                    {formatSlackMessage(msg.content)}
                  </div>

                  {/* Slack Style Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.reactions.map((react, rIdx) => (
                        <button
                          key={rIdx}
                          className="flex items-center gap-1.5 bg-gray-105 hover:bg-gray-200 px-2.5 py-1 rounded-full text-xs text-gray-600 transition-all border border-gray-250"
                          title={react.users.join(", ")}
                        >
                          <span>{react.emoji === "scream" ? "😱" : react.emoji}</span>
                          <span className="font-semibold text-gray-500">{react.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Thread Toggle Bar */}
                  {hasReplies && (
                    <div className="mt-3 flex items-center">
                      <button
                        onClick={() => toggleThread(msg.id)}
                        className="flex items-center gap-1.5 text-xs text-[#4A154B] font-semibold hover:underline bg-purple-50 hover:bg-purple-100 border border-purple-100 px-2.5 py-1 rounded-lg"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#4A154B]" />
                        <span>
                          {msg.replies?.length} {msg.replies?.length === 1 ? "reply" : "replies"}
                        </span>
                        {isThreadOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Nested Collapsable Thread Replies */}
              {isThreadOpen && hasReplies && (
                <div className="mt-2 ml-10 pl-6 border-l-2 border-slate-100 space-y-4 py-2">
                  {msg.replies?.map((rep) => (
                    <div key={rep.id} className="flex items-start gap-3">
                      <img
                        src={rep.avatar}
                        alt={rep.user}
                        className="w-6 h-6 rounded object-cover bg-gray-100 flex-shrink-0 border border-gray-100"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${rep.user}`;
                        }}
                      />
                      <div className="flex-1 text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-gray-900 text-xs">{rep.user}</span>
                          <span className="text-[9px] bg-slate-50 text-slate-500 font-mono px-1 py-0.2 rounded border border-slate-150">
                            {rep.role}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{rep.timestamp}</span>
                        </div>
                        <div className="mt-1 text-gray-750">
                          {formatSlackMessage(rep.content)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Thread Quick Reply Box */}
                  <div className="flex items-center gap-2 mt-2 pt-1">
                    <input
                      type="text"
                      value={replyInputs[msg.id] || ""}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [msg.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply(msg.id)}
                      placeholder="Reply to thread..."
                      className="flex-1 bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSendReply(msg.id)}
                      className="bg-[#4A154B] hover:bg-[#3d113e] text-white rounded-lg p-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Simulator Control & Posting Panel */}
      <div className="p-4 border-t border-gray-200 bg-slate-50 flex flex-col gap-3 shrink-0">
        {/* Step 1: Speak As Persona Selector */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="font-semibold flex items-center gap-1.5 text-gray-700">
            <Sparkles className="w-3.5 h-3.5 text-[#4A154B]" />
            Speak As Persona:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[450px] p-0.5 no-scrollbar">
            {PERSONAS.map((p) => {
              const isSelected = selectedPersona.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPersona(p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#4A154B] text-white border-transparent shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-4 h-4 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`;
                    }}
                  />
                  <span>{p.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Main Message Textbox */}
        <form onSubmit={handleSendMain} className="flex gap-2 relative bg-white border border-gray-300 rounded-lg p-1 focus-within:ring-2 focus-within:ring-purple-500 shadow-sm">
          <div className="flex items-center pl-2 text-gray-400">
            <Smile className="w-5 h-5 cursor-pointer hover:text-gray-500" />
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${channelName} as ${selectedPersona.name}...`}
            className="flex-1 px-2 py-2 text-sm text-gray-900 border-none outline-none focus:ring-0 bg-transparent"
          />
          <button
            type="submit"
            className="bg-[#4A154B] hover:bg-[#3d113e] text-white px-4 py-2 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>

        {/* Tactical Simulator Tips */}
        <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
          <HelpCircle className="w-3 h-3 text-[#4A154B]" />
          <span>Switch personas to post conflicting details or release updates, then click Refresh AI Insight!</span>
        </div>
      </div>
    </div>
  );
}
