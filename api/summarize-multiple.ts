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
    const { scenarioName, channelsData } = req.body;

    if (!channelsData || !Array.isArray(channelsData) || channelsData.length === 0) {
      return res.status(400).json({ error: "No channels data to summarize" });
    }

    // Filter channels with nonempty messages
    const validChannels = channelsData.filter(c => c.messages && c.messages.length > 0);
    if (validChannels.length === 0) {
      return res.status(400).json({ error: "None of the selected channels contain messages to summarize." });
    }

    const ai = getGeminiClient();

    const formattedChannelsText = validChannels.map(c => {
      const channelMessagesText = c.messages.map((msg: any) => {
        let text = `[${msg.timestamp}] ${msg.user} (${msg.role}): ${msg.content}`;
        if (msg.replies && msg.replies.length > 0) {
          text += "\n  Threads/Replies:\n" + msg.replies.map((reply: any) => `  - [${reply.timestamp}] ${reply.user} (${reply.role}): ${reply.content}`).join("\n");
        }
        return text;
      }).join("\n\n");
      return `### CHANNEL: #${c.channelName}\n${channelMessagesText}`;
    }).join("\n\n=======================\n\n");

    const systemInstruction = `You are an elite VP of Operations and Agile Lead analyzing a major incident or event.
Your task is to analyze logs across MULTIPLE corporate Slack channels simultaneously and synthesize a cohesive Cross-Channel Executive Digest.
The active incident scenario is: "${scenarioName}".

You are analyzing the following feeds: ${validChannels.map(c => `#${c.channelName}`).join(", ")}.

You must follow the schema strictly and extract:
1. Executive Summary: Provide an integrated, overall operational overview (3-4 sentences) showing how events in different channels (e.g., customer complaints in support versus hotfixes in engineering, alignment in leadership) are connected and their collective business impact.
2. Key Decisions: List the major strategic decision points, alignments, and action directions across all analyzed channels. Mention which channel or context the decision refers to if relevant.
3. Risks & Blockers: List critical blockages, cross-team alignment gaps, technical risks, or SLA stress situations occurring across teams.
4. Action Items: List essential multi-team actionable items. Ensure to include clear Owner names (from the logs, or guess Ryan Mercer, Alex Rivera, Sarah Lin, James Davis, Marcus Kim, Chloe Kim logically) and realistic timelines. Keep status as "pending". Give each one a unique string id (like "multi-task-1").
5. Sentiment Analysis: Determine a unified sentiment rating (0 to 10) representing the aggregated organizational health across active channels, select an expressive professional label (e.g., "Siloed Friction", "Cross-Team Synergy", "High Pressure Orchestration"), pick a Tailwind color theme ("emerald" for optimal/constructive, "amber" for high stress/adaptive, "rose" for fragmented/severe blockages), supply an aggregated paragraph on team dynamics, and supply a timeline trend array of global team sentiment during the incident.

Do not hypothesize or create tasks out of thin air. Ground your synthesis in the provided channels text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Perform cross-channel operational incident synthesis and return the finalized object structure:\n\n${formattedChannelsText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "High-level professional overview of the aggregated channel feeds."
            },
            keyDecisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of cross-channel alignments or critical target conclusions reached."
            },
            risksBlockers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of cross-team dependencies, active risks, or unresolved blockages."
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique string ID for the task (e.g. multi-task-1)." },
                  task: { type: Type.STRING, description: "Description of the cross-channel task." },
                  owner: { type: Type.STRING, description: "Full name of the designated owner." },
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
                score: { type: Type.INTEGER, description: "Overall cross-channel score (0 to 10)." },
                label: { type: Type.STRING, description: "Summary cross-channel sentiment label." },
                color: { type: Type.STRING, description: "emerald, amber, or rose." },
                summary: { type: Type.STRING, description: "Summary of aggregated team dynamics and cross-channel sync levels." },
                trend: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "The time label (e.g. 11:00 AM)." },
                      score: { type: Type.INTEGER, description: "Sentiment score at that timestamp (0 to 10)." }
                    },
                    required: ["time", "score"]
                  },
                  description: "Chronological trend of aggregate employee sentiment."
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
    console.error("Gemini multi-digestion failure in serverless function:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during cross-channel summarization.",
      hasApiKey: isValidApiKey(process.env.GOOGLE_API_KEY) || isValidApiKey(process.env.GEMINI_API_KEY)
    });
  }
}
