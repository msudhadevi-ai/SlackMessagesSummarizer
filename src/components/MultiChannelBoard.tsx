import React from "react";
import { Channel, Scenario, Message } from "../types";
import { 
  Layers, 
  Hash, 
  CheckCircle2, 
  Users, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Network
} from "lucide-react";

interface MultiChannelBoardProps {
  channels: Channel[];
  selectedChannelIds: Record<string, boolean>;
  onToggleChannelSelect: (id: string) => void;
  scenario: Scenario;
  isGenerating: boolean;
  onGenerateDigest: () => void;
}

export default function MultiChannelBoard({
  channels,
  selectedChannelIds,
  onToggleChannelSelect,
  scenario,
  isGenerating,
  onGenerateDigest
}: MultiChannelBoardProps) {
  const selectedChannelsList = channels.filter(c => !!selectedChannelIds[c.id]);
  
  // Total message count to show volume
  const totalAggregatedMessages = selectedChannelsList.reduce((acc, c) => {
    const messages = scenario.channels[c.id] || [];
    return acc + messages.length;
  }, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-8 custom-scrollbar">
      
      {/* Board Header Section */}
      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        {/* Title row */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#4A154B] font-extrabold uppercase text-xs tracking-widest leading-none mb-1">
              <Network className="w-4 h-4 text-[#36C5F0]" />
              <span>VP Command Center</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cross-Channel Incident Coordinator</h2>
            <p className="text-sm text-slate-500 mt-1">
              Aggregate operational channels simultaneously. Gemini automatically synthesizes cross-functional communication, maps inter-team dependencies, and writes a unified manager summary.
            </p>
          </div>
        </div>

        {/* Bento Board: Select Channels & Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box 1: Channel Multiplex Selection */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4A154B]" />
                Select Feeds to Aggregate
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedChannelsList.length} of {channels.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {channels.map((chan) => {
                const messagesInChannel = scenario.channels[chan.id] || [];
                const isChecked = !!selectedChannelIds[chan.id];
                return (
                  <label
                    key={chan.id}
                    onClick={() => onToggleChannelSelect(chan.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all select-none hover:border-gray-300 ${
                      isChecked
                        ? "bg-purple-50/40 border-[#4A154B] shadow-xs"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by click container
                      className="mt-0.5 w-4 h-4 text-[#4A154B] border-slate-300 rounded focus:ring-0 cursor-pointer accent-[#4A154B]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 truncate">#{chan.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">
                          {messagesInChannel.length} logs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 truncate leading-normal">
                        {chan.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Box 2: Compilation Quick Facts Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3a103c]" />
                Simulated Data Size
              </h3>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-500">Active Scenario</span>
                  <span className="text-xs font-bold text-slate-800">{scenario.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-500">Cross-Team Channels</span>
                  <span className="text-xs font-bold text-[#4A154B] font-mono">{selectedChannelsList.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-500">Compiled Activity Logs</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{totalAggregatedMessages} messages</span>
                </div>
              </div>
            </div>

            {/* Quick Warning tip */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-dotted border-slate-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-normal">
                Make sure you have played out relevant discussions in the Slack simulator first to capture their live timeline trends in the digest.
              </p>
            </div>
          </div>

        </div>

        {/* Primary AI Synthesis Command Pitch */}
        <div className="bg-gradient-to-br from-[#4A154B] to-[#310c32] rounded-2xl text-white p-7 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Absolute Background Accent Mesh */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-2 flex-1 relative z-10">
            <span className="bg-[#36C5F0] text-slate-900 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-mono">
              Incubated Gemini Analytical Engine
            </span>
            <h3 className="text-lg font-bold">Draft Multi-Channel Synergy Audit</h3>
            <p className="text-xs text-purple-100/90 leading-relaxed max-w-lg">
              Combines and parses {selectedChannelsList.length} active workspace streams to synthesize decisions, flag overall SLA threats, and chart a Chronological Sentiment Wave across your organization.
            </p>
          </div>

          <button
            onClick={onGenerateDigest}
            disabled={isGenerating || selectedChannelsList.length === 0}
            className={`px-6 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg select-none cursor-pointer transition-all ${
              selectedChannelsList.length === 0
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : isGenerating
                ? "bg-purple-100/20 text-white animate-pulse"
                : "bg-[#36C5F0] hover:bg-[#2cb2db] text-slate-900 duration-150 transform active:scale-95"
            }`}
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            {isGenerating ? "Compiling Aggregate..." : "Synthesize Multi-Channel Audit"}
          </button>
        </div>

        {/* Live Aggregated Feed Preview */}
        {selectedChannelsList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#4A154B]/80 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Combined Source Feed Specimen
            </h3>

            <div className="border border-gray-150 rounded-2xl bg-white divide-y divide-gray-100 overflow-hidden shadow-xs">
              {selectedChannelsList.map(chan => {
                const feeds = scenario.channels[chan.id] || [];
                const sampleMessage = feeds[feeds.length - 1]; // get latest
                
                if (!sampleMessage) {
                  return (
                    <div key={chan.id} className="p-4 flex items-center justify-between text-xs text-slate-400 bg-slate-50/50">
                      <span>#{chan.name} is currently quiet</span>
                      <span className="italic">No messages present</span>
                    </div>
                  );
                }

                return (
                  <div key={chan.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/40 transition-colors">
                    <span className="shrink-0 text-xs font-extrabold text-[#4A154B] bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md font-mono mt-0.5">
                      #{chan.name}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-700">{sampleMessage.user}</span>
                        <span className="text-[10px] text-slate-400">{sampleMessage.role}</span>
                        <span className="text-[10px] text-slate-300 font-mono ml-auto">{sampleMessage.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">
                        "{sampleMessage.content}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
