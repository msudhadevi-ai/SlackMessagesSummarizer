import React, { useState } from "react";
import { DigestReport, ActionItem } from "../types";
import { 
  Sparkles, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Bookmark, 
  Activity, 
  User, 
  HelpCircle,
  Play,
  RotateCw
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface DigestPanelProps {
  digest: DigestReport | null;
  isLoading: boolean;
  onGenerateDigest: () => void;
  onToggleActionStatus: (taskId: string) => void;
  errorMsg: string | null;
  channelName: string;
  scenarioName: string;
}

export default function DigestPanel({
  digest,
  isLoading,
  onGenerateDigest,
  onToggleActionStatus,
  errorMsg,
  channelName,
  scenarioName,
}: DigestPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "actions" | "sentiment">("summary");

  // Calculate task completions
  const actionItems = digest?.actionItems || [];
  const completedTasks = actionItems.filter(item => item.status === 'completed').length;
  const totalTasks = actionItems.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render initials badge for owners
  const getInitialsBadge = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  // Assign background coloring to sentiment levels
  const getSentimentStyles = (color: string) => {
    switch (color) {
      case "emerald":
        return { bg: "bg-emerald-50 text-emerald-800 border-emerald-250", badge: "bg-emerald-500", text: "text-emerald-700" };
      case "amber":
        return { bg: "bg-amber-50 text-amber-850 border-amber-250", badge: "bg-amber-500", text: "text-amber-700" };
      case "rose":
      default:
        return { bg: "bg-rose-50 text-rose-800 border-rose-250", badge: "bg-rose-500", text: "text-rose-700" };
    }
  };

  const sentimentStyle = getSentimentStyles(digest?.sentiment.color || "amber");

  // Loading indicator states list (simulates active analysis stages)
  const LoadingStates = [
    "Compiling Slack conversation sequence logs...",
    "Instantiating Gemini operational analysis context...",
    "Analyzing chronological team sentiment gradients...",
    "Extracting key decisions & critical action ownerships...",
    "Structuring compliance task list matrix...",
  ];
  
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);

  // Stagger loading texts
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingTextIdx(0);
      interval = setInterval(() => {
        setLoadingTextIdx((prev) => (prev + 1) % LoadingStates.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="w-[420px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden select-none">
      {/* Panel Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#4A154B]" />
          <h2 className="font-bold text-slate-800 text-sm">Manager Operational Digest</h2>
        </div>
        <span className="text-[10px] bg-purple-50 text-[#4A154B] font-bold px-2 py-0.5 rounded-full uppercase border border-purple-100 font-mono">
          Gemini 3.5 AI
        </span>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Dynamic State Selection */}
        {isLoading ? (
          /* LOADING PRESETS */
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-[#4A154B] animate-spin"></div>
              <Sparkles className="w-6 h-6 text-[#4A154B] absolute animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 text-sm">Reviewing Channel Records...</h3>
              <p className="text-xs text-gray-500 font-mono transition-all max-w-[250px] mx-auto min-h-[32px] leading-relaxed">
                "{LoadingStates[loadingTextIdx]}"
              </p>
            </div>
            <div className="w-48 bg-gray-200 h-1 rounded-full overflow-hidden mx-auto">
              <div 
                className="bg-[#4A154B] h-full transition-all duration-1000 ease-out" 
                style={{ width: `${((loadingTextIdx + 1) / LoadingStates.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : digest ? (
          /* AI REPORT LOADED DISPLAY */
          <div className="p-5 space-y-5 flex-1 flex flex-col">
            
            {/* Quick Context Summary Banner */}
            <div className="bg-[#F8F9FA] border border-gray-150 p-4 rounded-xl shrink-0">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Digest Focus</p>
              <h4 className="font-semibold text-slate-900 text-sm mt-0.5">#{channelName} — {scenarioName}</h4>
            </div>

            {/* Overall Score Metrics Row */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {/* Score A: Sentiment Gauge */}
              <div className={`border p-4 rounded-xl flex flex-col justify-between ${sentimentStyle.bg}`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Team Sentiment</span>
                  <p className="text-xl font-bold mt-2 flex items-baseline gap-1">
                    {digest.sentiment.score}
                    <span className="text-xs font-normal opacity-85">/ 10</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold mt-2 truncate flex items-center gap-1.5 leading-none">
                  <span className={`w-2 h-2 rounded-full ${sentimentStyle.badge}`} />
                  {digest.sentiment.label}
                </span>
              </div>

              {/* Score B: Task Checkboard Complete Rate */}
              <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Task Execution</span>
                  <p className="text-xl font-bold text-gray-900 mt-2 flex items-baseline gap-1">
                    {completedTasks}
                    <span className="text-xs font-normal text-slate-400">/ {totalTasks} Done</span>
                  </p>
                </div>
                {/* Visual completion progress */}
                <div className="mt-2 text-[10px] font-bold text-gray-600">
                  <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden mb-1 border border-slate-100">
                    <div className="bg-[#4A154B] h-full transition-all" style={{ width: `${completionPercentage}%` }}></div>
                  </div>
                  <span className="text-gray-400 text-[9px]">{completionPercentage}% complete</span>
                </div>
              </div>
            </div>

            {/* Custom Tab list selectors */}
            <div className="flex border-b border-gray-200 shrink-0">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "summary"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Executive Note
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "actions"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Owner Tasks
                {totalTasks > 0 && (
                  <span className="bg-slate-100 text-gray-600 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {actionItems.filter(t => t.status === "pending").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("sentiment")}
                className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "sentiment"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Sentiment Trend
              </button>
            </div>

            {/* Tab Sub-contents */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {activeTab === "summary" && (
                <div className="space-y-4">
                  {/* Executive Description Card */}
                  <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-2">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Bookmark className="w-3.5 h-3.5 text-[#4A154B]" />
                      Executive Summary
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {digest.executiveSummary}
                    </p>
                  </div>

                  {/* Key Decisions Block */}
                  <div className="bg-[#F8F9FB] p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Decisions</h4>
                    {digest.keyDecisions.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No explicit alignments concluded yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {digest.keyDecisions.map((decision, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-800 leading-relaxed">
                            <div className="mt-1.5 w-1 h-1 bg-slate-800 rounded-full shrink-0"></div>
                            <span>{decision}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Risks & Blockers Block */}
                  <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">Risks & Blockers</h4>
                    {digest.risksBlockers.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No unresolved blockages logged.</p>
                    ) : (
                      <ul className="space-y-3">
                        {digest.risksBlockers.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 leading-relaxed">
                            <div className="mt-1.5 w-1 h-1 bg-rose-500 rounded-full shrink-0"></div>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "actions" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Interactive Task Matrix
                    </span>
                    <span className="text-[10px] text-gray-400 italic">Tick box once complete</span>
                  </div>

                  {actionItems.length === 0 ? (
                    <div className="bg-[#F8F9FB] p-6 rounded-xl border border-slate-100 text-center text-xs text-gray-500">
                      No specific operational actions found.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {actionItems.map((item) => {
                        const isCompleted = item.status === "completed";
                        return (
                          <div 
                            key={item.id} 
                            className={`bg-white border p-3.5 rounded-xl shadow-xs flex items-start gap-2.5 transition-all ${
                              isCompleted 
                                ? "opacity-60 bg-gray-50 border-gray-100 line-through text-gray-405" 
                                : "border-slate-105 text-slate-800"
                            }`}
                          >
                            {/* Checked Controller */}
                            <input 
                              type="checkbox" 
                              checked={isCompleted}
                              onChange={() => onToggleActionStatus(item.id)}
                              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B] cursor-pointer"
                            />
                            
                            <div className="flex-1 space-y-1.5">
                              <p className="text-xs font-semibold leading-relaxed">
                                {item.task}
                              </p>
                              
                              {/* Metadata */}
                              <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-wrap pt-0.5">
                                {/* Designated Owner initials & tag */}
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">
                                  {item.owner}
                                </span>

                                {/* Due Date Indicator */}
                                <span className="flex items-center gap-1 font-mono text-slate-400">
                                  <Clock className="w-3 h-3 text-slate-300" />
                                  {item.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "sentiment" && (
                <div className="space-y-3.5">
                  {/* Sentiment Interpretation Text */}
                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Operational Sentiment Summary</span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {digest.sentiment.summary}
                    </p>
                  </div>

                  {/* Line Chart showing Sentiment Timeline fluctuation */}
                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-3">
                      <TrendingUp className="w-3.5 h-3.5 text-[#4A154B]" />
                      Chronological Sentiment Wave
                    </span>

                    {/* Recharts Container */}
                    <div className="w-full h-36 mt-1 flex items-center justify-center">
                      {digest.sentiment.trend && digest.sentiment.trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={digest.sentiment.trend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 9, fill: "#94a3b8" }} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <YAxis 
                              domain={[0, 10]} 
                              tick={{ fontSize: 9, fill: "#94a3b8" }} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              contentStyle={{ background: "#4A154B", color: "#fff", borderRadius: "8px", border: "none", fontSize: "10px" }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#4A154B" 
                              strokeWidth={3} 
                              dot={{ r: 4, strokeWidth: 1 }} 
                              activeDot={{ r: 6 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No sentiment timeline logs parsed yet.</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1.5 border-t border-slate-105 font-mono">
                      <span>Low (Tense/Crisis)</span>
                      <span>High (Calm/Productive)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Run Again / Sync Button */}
            <div className="space-y-3 shrink-0 pt-2 border-t border-gray-100">
              <button
                onClick={onGenerateDigest}
                className="w-full bg-[#4A154B] hover:bg-[#3d113e] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Refresh AI Insight
              </button>

              <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-between border border-dashed border-slate-200">
                <span className="text-xs text-slate-400">AI Accuracy Confidence: <span className="text-slate-800 font-bold">94%</span></span>
                <button className="text-xs text-[#4A154B] font-bold hover:underline cursor-pointer">Give Feedback</button>
              </div>
            </div>
          </div>
        ) : (
          /* EMPTY STATE - NO DIGEST RUN YET */
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
              <Sparkles className="w-8 h-8 text-[#4A154B]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 text-sm">Retrieve Slack Insights</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                No recent summary has been run for #{channelName}. Trigger the Gemini operational engine below to extract structured decisions, owner requirements, and team sentiment.
              </p>
            </div>

            {/* Manual Run button */}
            <button
              onClick={onGenerateDigest}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#4A154B] hover:bg-[#3d113e] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Generate #{channelName} Review
            </button>
          </div>
        )}
      </div>

      {/* Secret panel warning info */}
      {errorMsg && (
        <div className="m-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            LLM Digestion Issue
          </p>
          <p className="leading-relaxed">
            {errorMsg}
          </p>
          <p className="text-[10px] text-rose-600 pt-1 font-semibold leading-relaxed">
            💡 Make sure you configure your **GEMINI_API_KEY** under **Settings &gt; Secrets** in the AI Studio sidebar, or confirm the server is responsive.
          </p>
        </div>
      )}
    </div>
  );
}
