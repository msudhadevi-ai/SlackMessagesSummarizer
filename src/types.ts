export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ThreadReply {
  id: string;
  user: string;
  avatar: string;
  role: string;
  content: string;
  timestamp: string;
  reactions?: Reaction[];
}

export interface Message {
  id: string;
  user: string;
  avatar: string;
  role: string;
  content: string;
  timestamp: string; // e.g., "10:14 AM"
  reactions?: Reaction[];
  replies?: ThreadReply[];
}

export interface Channel {
  id: string;
  name: string; // e.g., "engineering"
  description: string;
  category: 'core' | 'external' | 'strategic';
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon identifier
  difficulty: "normal" | "major" | "critical";
  channels: {
    [channelId: string]: Message[];
  };
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface SentimentDataPoint {
  time: string;
  score: number; // 0 to 10
}

export interface SentimentMetrics {
  score: number; // 1-10 scale
  label: string; // e.g., "Constructive", "Stressed / High Pressure", "Collaborative"
  color: string; // e.g., "emerald", "amber", "rose"
  summary: string;
  trend: SentimentDataPoint[];
}

export interface DigestReport {
  executiveSummary: string;
  keyDecisions: string[];
  risksBlockers: string[];
  actionItems: ActionItem[];
  sentiment: SentimentMetrics;
}
