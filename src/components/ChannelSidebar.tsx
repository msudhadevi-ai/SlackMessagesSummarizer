import React from "react";
import { Channel, Scenario } from "../types";
import { 
  Hash, 
  Rocket, 
  ShieldAlert, 
  GitPullRequest, 
  ChevronDown, 
  Activity, 
  Layers, 
  Building,
  Sparkles,
  Award
} from "lucide-react";

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  isMultiChannelMode: boolean;
  onToggleMultiChannelMode: () => void;
  selectedChannelIds: Record<string, boolean>;
  onToggleChannelSelect: (id: string) => void;
}

export default function ChannelSidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  isMultiChannelMode,
  onToggleMultiChannelMode,
  selectedChannelIds,
  onToggleChannelSelect,
}: ChannelSidebarProps) {
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Helper to render responsive icon
  const renderScenarioIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case "Rocket":
        return <Rocket className={`w-4 h-4 ${colorClass}`} />;
      case "ShieldAlert":
        return <ShieldAlert className={`w-4 h-4 ${colorClass}`} />;
      case "GitPullRequest":
        return <GitPullRequest className={`w-4 h-4 ${colorClass}`} />;
      default:
        return <Activity className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  // Group channels by category
  const coreChannels = channels.filter(c => c.category === "core");
  const externalChannels = channels.filter(c => c.category === "external");
  const strategicChannels = channels.filter(c => c.category === "strategic");

  return (
    <aside className="w-80 flex-shrink-0 bg-[#4A154B] text-gray-100 flex flex-col h-full border-r border-[#ffffff1a] select-none">
      {/* Workspace Header */}
      <div className="p-6 border-b border-[#ffffff1a] flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2 text-white">
            <div className="w-3 h-3 bg-[#36C5F0] rounded-full"></div>
            Digest Pro
          </h1>
          <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest font-mono">Slack Manager Dashboard</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#ffffff15] flex items-center justify-center text-white text-xs font-bold font-mono">
          MD
        </div>
      </div>

      {/* Scenario Context Simulator (Top) */}
      <div className="p-4 bg-[#00000020] border-b border-[#ffffff1a] flex flex-col gap-2">
        <label className="text-[11px] font-semibold tracking-wider text-[#ffffff80] uppercase flex items-center justify-between">
          <span>Active Simulation Incident</span>
          <span className="py-0.5 px-2 bg-white/10 rounded-full text-[10px] text-white/90 border border-white/15">
            Presets
          </span>
        </label>
        
        <div className="relative mt-1">
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-[#ffffff10] border border-white/20 rounded-lg text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-450 cursor-pointer appearance-none transition-all duration-200"
          >
            {scenarios.map((scen) => (
              <option key={scen.id} value={scen.id} className="bg-[#4A154B] text-white">
                {scen.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-white/60 pointer-events-none" />
        </div>

        {/* Selected Scenario Mini-Detail card */}
        <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs mt-1">
          <p className="text-purple-100 line-clamp-3 font-normal leading-relaxed">
            {activeScenario.description}
          </p>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
            <span className="text-[10px] uppercase font-semibold text-[#ffffff60] tracking-wider">Tension level</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              activeScenario.difficulty === "critical" 
                ? "bg-red-950/80 text-red-300 border border-red-800"
                : activeScenario.difficulty === "major"
                ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
            }`}>
              {activeScenario.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Channel Compiler Toggle */}
      <div className="p-3 bg-[#00000015] border-b border-[#ffffff1a] flex flex-col gap-2">
        <button
          onClick={onToggleMultiChannelMode}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer ${
            isMultiChannelMode
              ? "bg-[#36C5F0] text-slate-900 font-extrabold"
              : "bg-white/10 hover:bg-white/15 text-white"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Channel Digest Mode</span>
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
            isMultiChannelMode ? "bg-slate-900 text-white" : "bg-white/25 text-white"
          }`}>
            {isMultiChannelMode ? "ACTIVE" : "OFF"}
          </span>
        </button>
      </div>

      {/* Navigable Channel List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        {/* Core Collaboration Channels */}
        <div>
          <h2 className="px-3 text-[11px] font-semibold tracking-wider text-[#ffffff80] uppercase flex items-center justify-between mb-1">
            <span>Core Workspace Feed</span>
            <Layers className="w-3.5 h-3.5 text-white/50" />
          </h2>
          <div className="space-y-0.5 font-sans">
            {coreChannels.map((chan) => {
              const isSelected = !!selectedChannelIds[chan.id];
              const isCurrent = activeChannelId === chan.id && !isMultiChannelMode;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    if (isMultiChannelMode) {
                      onToggleChannelSelect(chan.id);
                    } else {
                      onSelectChannel(chan.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isCurrent 
                      ? "bg-[#ffffff15] text-white" 
                      : isMultiChannelMode && isSelected
                      ? "bg-white/15 text-[#36C5F0]"
                      : "text-purple-100 hover:bg-[#ffffff0a] opacity-85 hover:opacity-100"
                  }`}
                >
                  <span className="flex items-center gap-2 text-left truncate">
                    {isMultiChannelMode ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by onClick on button
                        className="w-3.5 h-3.5 rounded border-white/30 text-[#4A154B] focus:ring-0 mr-1 cursor-pointer accent-[#36C5F0]"
                      />
                    ) : (
                      <Hash className={`w-4 h-4 ${isCurrent ? "text-white" : "text-[#ffffff60]"}`} />
                    )}
                    <span className="truncate">{chan.name}</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-80"></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Signals & Escalations (Support) */}
        <div>
          <h2 className="px-3 text-[11px] font-semibold tracking-wider text-[#ffffff80] uppercase flex items-center justify-between mb-1">
            <span>External Signals</span>
            <Activity className="w-3.5 h-3.5 text-white/50" />
          </h2>
          <div className="space-y-0.5">
            {externalChannels.map((chan) => {
              const isSelected = !!selectedChannelIds[chan.id];
              const isCurrent = activeChannelId === chan.id && !isMultiChannelMode;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    if (isMultiChannelMode) {
                      onToggleChannelSelect(chan.id);
                    } else {
                      onSelectChannel(chan.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isCurrent 
                      ? "bg-[#ffffff15] text-white" 
                      : isMultiChannelMode && isSelected
                      ? "bg-white/15 text-[#36C5F0]"
                      : "text-purple-100 hover:bg-[#ffffff0a] opacity-85 hover:opacity-100"
                  }`}
                >
                  <span className="flex items-center gap-2 text-left truncate">
                    {isMultiChannelMode ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by onClick on button
                        className="w-3.5 h-3.5 rounded border-white/30 text-[#4A154B] focus:ring-0 mr-1 cursor-pointer accent-[#36C5F0]"
                      />
                    ) : (
                      <Hash className={`w-4 h-4 ${isCurrent ? "text-white" : "text-[#ffffff60]"}`} />
                    )}
                    <span className="truncate">{chan.name}</span>
                  </span>
                  <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 scale-90">
                    +1
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategy & Alignment (Leadership) */}
        <div>
          <h2 className="px-3 text-[11px] font-semibold tracking-wider text-[#ffffff80] uppercase flex items-center justify-between mb-1">
            <span>Strategic alignment</span>
            <Award className="w-3.5 h-3.5 text-white/50" />
          </h2>
          <div className="space-y-0.5">
            {strategicChannels.map((chan) => {
              const isSelected = !!selectedChannelIds[chan.id];
              const isCurrent = activeChannelId === chan.id && !isMultiChannelMode;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    if (isMultiChannelMode) {
                      onToggleChannelSelect(chan.id);
                    } else {
                      onSelectChannel(chan.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isCurrent 
                      ? "bg-[#ffffff15] text-white" 
                      : isMultiChannelMode && isSelected
                      ? "bg-white/15 text-[#36C5F0]"
                      : "text-purple-100 hover:bg-[#ffffff0a] opacity-85 hover:opacity-100"
                  }`}
                >
                  <span className="flex items-center gap-2 text-left truncate">
                    {isMultiChannelMode ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by onClick on button
                        className="w-3.5 h-3.5 rounded border-white/30 text-[#4A154B] focus:ring-0 mr-1 cursor-pointer accent-[#36C5F0]"
                      />
                    ) : (
                      <Hash className={`w-4 h-4 ${isCurrent ? "text-white" : "text-[#ffffff60]"}`} />
                    )}
                    <span className="truncate">{chan.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tooltip Info Footer */}
      <div className="p-4 bg-[#00000020] border-t border-[#ffffff1a] text-[12px] opacity-70">
        Connected to: Acme Corp Workspace
      </div>
    </aside>
  );
}
