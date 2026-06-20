import { GoogleGenAI, Type } from "@google/genai";

function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const clean = key.trim().replace(/['"']/g, "");
  if (!clean) return false;
  if (
    clean === "MY_GEMINI_API_KEY" ||
    clean === "MY_GOOGLE_API_KEY" ||
    clean.startsWith("MY_") ||
    clean.includes("PLACEHOLDER") ||
    clean.includes("YOUR_")
  ) {
    return false;
  }
  return true;
}

function getKeysDiagnostic(): string {
  const diagnosticCount: string[] = [];
  const keysToInspect = [
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "VITE_GEMINI_API_KEY",
    "VITE_GOOGLE_API_KEY"
  ];
  for (const name of keysToInspect) {
    const val = process.env[name];
    if (val === undefined) {
      diagnosticCount.push(`${name}: [undefined]`);
    } else {
      const clean = val.trim().replace(/['"']/g, "");
      const len = clean.length;
      if (len === 0) {
        diagnosticCount.push(`${name}: [empty]`);
      } else {
        const masked = clean.length > 8 
          ? (clean.slice(0, 4) + "..." + clean.slice(-4)) 
          : "present-but-short";
        diagnosticCount.push(`${name}: [len=${len}, mask=${masked}]`);
      }
    }
  }
  return diagnosticCount.join(" | ");
}

function getGeminiClient() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY
  ];
  
  const apiKey = keys.find(isValidApiKey);

  if (!apiKey) {
    const diag = getKeysDiagnostic();
    throw new Error(`Neither GEMINI_API_KEY nor GOOGLE_API_KEY is configured with a valid active value. Environment state: ${diag}. Please adjust this under settings / deployment environment variables.`);
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim().replace(/['"']/g, ""),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export default async function handler(req: any, res: any) {
  // Allow OPTIONS pre-flight check or handle routing
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Must be a POST request." });
  }

  try {
    const { channelName, scenarioName, messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No messages to summarize" });
    }

    const ai = getGeminiClient();

    const formattedMessagesText = messages.map((msg: any) => {
      let text = `[${msg.timestamp}] ${msg.user} (${msg.role}): ${msg.content}`;
      if (msg.replies && msg.replies.length > 0) {
        text += "\n  Threads/Replies:\n" + msg.replies.map((reply: any) => `  - [${reply.timestamp}] ${reply.user} (${reply.role}): ${reply.content}`).join("\n");
      }
      return text;
    }).join("\n\n");

    const systemInstruction = `You are an elite, highly experienced Scrum Master, Agile Coach, and VP of Operations.
Your task is to analyze Slack messages of a specific company channel and generate an extremely professional, insightful executive manager digest.
The channel is "${channelName}" and the scenario is "${scenarioName}".

You must follow the schema strictly and extract:
1. Executive Summary: A detailed, strategic 2-to-3 sentence overview of what transpired. Explain the context, issue, and status.
2. Key Decisions: List the clear, explicit decisions or alignments reached.
3. Risks & Blockers: List any unresolved issues, active bottlenecks, risks, or SLA concerns.
4. Action Items: List complete action/follow-up items. Be sure to extract the specific Owner's full name (or guess logically if implied, e.g., Ryan Mercer, Alex Rivera, Sarah Chen, Chloe Kim) and an actionable Due Date (like "Today 1:00 PM EST", "By 5:00 PM today", "Tuesday Board Meeting", etc.). Keep the status as "pending". Give each one a unique string id (like "task-1").
5. Sentiment Analysis: Determine a sentiment score (0 to 10), select an appropriate professional label (e.g., "Highly Tense / Under Pressure", "Adaptive Pivot", "Collaborative Aligning", "Productive Sync"), pick a Tailwind-friendly indicator color ("emerald" for highly productive/cooperative, "amber" for warned/stressed/shifting, "rose" for critical crisis/blocker), write a concise overview of the team's dynamics, and provide a timeline trend array of sentiment progress (each containing a "time" timestamp like "09:15 AM" and "score" numerical rating representing the mood at that point in communication).

Do not formulate any empty arrays or make up unrelated tasks. Base everything entirely on the Slack transcript.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Perform the operational Scrum analysis and return a styled JSON. Here are the Slack logs:\n\n${formattedMessagesText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "High-level professional overview of the conversation sequence."
            },
            keyDecisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of distinct commitments, agreements or conclusions confirmed."
            },
            risksBlockers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of critical risks, code dependencies, or outstanding blocking factors."
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique string ID for the task (e.g. task-1, task-2)." },
                  task: { type: Type.STRING, description: "Description of the required action." },
                  owner: { type: Type.STRING, description: "Full name of the designated owner (e.g. Alex Rivera, Ryan Mercer)." },
                  dueDate: { type: Type.STRING, description: "Clear explicit time or milestone context." },
                  status: { type: Type.STRING, enum: ["pending", "completed"], description: "Default to pending value." }
                },
                required: ["id", "task", "owner", "dueDate", "status"]
              },
              description: "Checklist of operations to perform."
            },
            sentiment: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Overall conversation average score (0 to 10)." },
                label: { type: Type.STRING, description: "High-level summary sentiment label." },
                color: { type: Type.STRING, description: "emerald for positive/calm, amber for tense/warning, rose for critical." },
                summary: { type: Type.STRING, description: "Paragraph summarization of the team dynamics." },
                trend: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "The time label (e.g. 10:30 AM)." },
                      score: { type: Type.INTEGER, description: "Sentiment score at that timestamp (0 to 10)." }
                    },
                    required: ["time", "score"]
                  },
                  description: "Chronological trend of the team's sentiment."
                }
              },
              required: ["score", "label", "color", "summary", "trend"]
            }
          },
          required: ["executiveSummary", "keyDecisions", "risksBlockers", "actionItems", "sentiment"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const digest = JSON.parse(text);
    return res.status(200).json(digest);

  } catch (error: any) {
    console.error("Gemini digestion failure in serverless function:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during summarization.",
      hasApiKey: isValidApiKey(process.env.GOOGLE_API_KEY) || isValidApiKey(process.env.GEMINI_API_KEY)
    });
  }
}
