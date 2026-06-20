import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get Gemini client lazily
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Neither GOOGLE_API_KEY nor GEMINI_API_KEY is configured. Please add your key in Settings > Secrets in the AI Studio UI.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// REST Api endpoint to parse and summarize conversation
app.post("/api/summarize", async (req, res) => {
  try {
    const { channelName, scenarioName, messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No messages to summarize" });
    }

    const ai = getGeminiClient();

    const formattedMessagesText = messages.map(msg => {
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
      model: "gemini-3.5-flash",
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
    return res.json(digest);

  } catch (error: any) {
    console.error("Gemini digestion failure:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during summarization.",
      hasApiKey: !!process.env.GOOGLE_API_KEY || !!process.env.GEMINI_API_KEY
    });
  }
});

// REST Api endpoint to parse and summarize multiple channels
app.post("/api/summarize-multiple", async (req, res) => {
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
      model: "gemini-3.5-flash",
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
    return res.json(digest);

  } catch (error: any) {
    console.error("Gemini multi-digestion failure:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during cross-channel summarization.",
      hasApiKey: !!process.env.GOOGLE_API_KEY || !!process.env.GEMINI_API_KEY
    });
  }
});

// Configure Vite or Static asset rendering
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and listening on http://localhost:${PORT}`);
  });
}

startServer();
