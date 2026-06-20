import { Channel, Scenario } from "./types";

export const CHANNELS: Channel[] = [
  {
    id: "engineering",
    name: "engineering",
    description: "Technical build discussions, releases, pull requests, and architecture.",
    category: "core",
  },
  {
    id: "product",
    name: "product",
    description: "Product roadmap, user feedback curation, specifications, and scope design.",
    category: "core",
  },
  {
    id: "support",
    name: "support",
    description: "Customer incident tickets, customer feedback, bugs, and SLA warnings.",
    category: "external",
  },
  {
    id: "leadership",
    name: "leadership",
    description: "Strategic planning, high-level budgets, policy alignment, and crisis comms.",
    category: "strategic",
  },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "v2-launch-day",
    name: "v2.0 Core Platform Release",
    description: "A major update is due today. QA introduces a critical memory leak late in the day. Product and Engineering must decide whether to defer or patch on the fly.",
    icon: "Rocket",
    difficulty: "major",
    channels: {
      engineering: [
        {
          id: "eng-1",
          user: "Alex Rivera",
          role: "Engineering Lead",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Status report for v2.0 deployment: All services compiled successfully in staging. Migrations are dry-runned. We are ready to initiate the release pipeline whenever @Sarah Chen gives the green light. 🚀",
          timestamp: "09:15 AM",
          reactions: [
            { emoji: "👍", count: 6, users: ["Sarah Chen", "Elena Rostova", "Chloe Kim", "Ryan Mercer"] },
            { emoji: "🚀", count: 4, users: ["Ryan Mercer", "Elena Rostova"] }
          ],
          replies: [
            {
              id: "eng-1-r1",
              user: "Ryan Mercer",
              role: "Site Reliability Engineer",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Pre-flight checks are looking pristine. CPU utilization is stable at 14% on the new auto-scaling node pools.",
              timestamp: "09:18 AM"
            }
          ]
        },
        {
          id: "eng-2",
          user: "Chloe Kim",
          role: "QA Specialist",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          content: "⚠️ HOLD ON. I just completed a run of the endurance suite on staging suite. When simulated concurrent traffic hits 5,000 users, the workspace socket service starts leaking memory rapidly. Containers are crashing after 8 minutes of steady load.",
          timestamp: "10:30 AM",
          reactions: [
            { emoji: "👀", count: 5, users: ["Alex Rivera", "Ryan Mercer", "Sarah Chen"] },
            { emoji: "scream", count: 2, users: ["Ryan Mercer", "Alex Rivera"] }
          ],
          replies: [
            {
              id: "eng-2-r1",
              user: "Alex Rivera",
              role: "Engineering Lead",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Dang it. Is it related to the new Redis cluster synchronization or the WebSocket keep-alive packets?",
              timestamp: "10:32 AM"
            },
            {
              id: "eng-2-r2",
              user: "Chloe Kim",
              role: "QA Specialist",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
              content: "It seems to be the keep-alive connections. It's not releasing the memory blocks once sockets disconnect. I've uploaded the heap snapshot logs.",
              timestamp: "10:36 AM"
            }
          ]
        },
        {
          id: "eng-3",
          user: "Ryan Mercer",
          role: "Site Reliability Engineer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          content: "I investigated the snapshots Chloe posted. Yes, it's the `socket-io-redis` adapter adapter. It fails to trigger garbage collection for disconnected sockets under heavy node shifts. I can write a quick patch to override the idle listener, but it'll need about 2 hours to write and verify.",
          timestamp: "10:55 AM",
          reactions: [{ emoji: "🙏", count: 3, users: ["Alex Rivera", "Chloe Kim"] }]
        },
        {
          id: "eng-4",
          user: "Alex Rivera",
          role: "Engineering Lead",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Okay, let's agree on the plan: Ryan is coding the patch right now. Target completion: 1:00 PM. Chloe will run a high-intensity 30-minute validation cycle immediately after. If it holds, we deploy by 2:00 PM. If it doesn't, we will have to delay of launch to tomorrow. @Sarah Chen, let's sync in #product on customer commitments.",
          timestamp: "11:10 AM",
          reactions: [
            { emoji: "🎯", count: 4, users: ["Ryan Mercer", "Chloe Kim", "Sarah Chen"] },
            { emoji: "👍", count: 3, users: ["Elena Rostova", "Ryan Mercer"] }
          ]
        }
      ],
      product: [
        {
          id: "prod-1",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Just saw the engineering status regarding the memory leak blocker in staging. I am currently in a pre-launch briefing with Enterprise Customer Success managers. They are expecting the feature at 3:00 PM EST because we have three major clients (including Cisco and Salesforce) holding their team onboarding events based on v2.0 tomorrow morning.",
          timestamp: "10:45 AM",
          reactions: [
            { emoji: "😰", count: 3, users: ["Alex Rivera", "Marcus Thompson"] }
          ]
        },
        {
          id: "prod-2",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "@Alex Rivera - can we temporarily disable the live typing indicators and keep-alive polls to bypass the leak? That way we can release the main text features on schedule and patch the background socket engine in a v2.0.1 hotfix tonight?",
          timestamp: "11:02 AM",
          replies: [
            {
              id: "prod-2-r1",
              user: "Alex Rivera",
              role: "Engineering Lead",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Unfortunately no, the socket-io framework governs the primary thread connection itself, so disabling the sub-features won't stop the leak when clients disconnect. We must fix the listener cleanup.",
              timestamp: "11:05 AM"
            }
          ]
        },
        {
          id: "prod-3",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Understood. Thanks for explaining, Alex. I will communicate the tentative delay to Enterprise Success. We will plan for a 2:00 PM EST Go/No-Go decision point based on QA's validation of Ryan's patch. If the patch holds, we roll ahead for 3:00 PM. If not, we officially tell clients we are delaying 18 hours until tomorrow 9:00 AM EST.",
          timestamp: "11:20 AM",
          reactions: [
            { emoji: "👍", count: 5, users: ["Alex Rivera", "Elena Rostova", "Marcus Thompson"] }
          ]
        }
      ],
      support: [
        {
          id: "supp-1",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Hey folks, we're already seeing customers in the beta list asking if they are getting v2.0 today. Some admins are asking for release notes to train their sales teams. Do we have a finalized public changelog we can share with the primary helpdesk reps?",
          timestamp: "09:30 AM",
          replies: [
            {
              id: "supp-1-r1",
              user: "Sarah Chen",
              role: "VP Product",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Yes, Marcus! Here is the external Notion doc: [V2 Changelog Public Draft]. Let's keep it under wraps until we run our 2:00 PM Go/No-Go sync though, just in case we slide to tomorrow morning.",
              timestamp: "09:44 AM"
            }
          ]
        },
        {
          id: "supp-2",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Got it, holding off on sharing yet. If we slide tomorrow, I'll need a prepared macro response from the marketing/product team for customers who complain about shifting schedules. We promised early Wednesday.",
          timestamp: "11:35 AM",
          reactions: [
            { emoji: "💯", count: 2, users: ["Sarah Chen", "Elena Rostova"] }
          ]
        }
      ],
      leadership: [
        {
          id: "lead-1",
          user: "Elena Rostova",
          role: "Chief Technology Officer",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Checking in on the v2.0 platform release. Since this replaces the legacy core message queue, this is our biggest technical milestone this year. @Alex Rivera @Sarah Chen - what is our baseline confidence level right now with the socket leak?",
          timestamp: "11:45 AM"
        },
        {
          id: "lead-2",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Elena, we are currently at a 2:00 PM Go/No-Go decision. Ryan has coded a corrective garbage collection patch on staging. If QA passes it in the 1:00 PM window, we are ready to deploy. If any instability is detected, we will officially postpone to tomorrow to preserve SLAs.",
          timestamp: "11:50 AM",
          reactions: [
            { emoji: "👍", count: 3, users: ["Elena Rostova", "David Vance"] }
          ]
        },
        {
          id: "lead-3",
          user: "David Vance",
          role: "Chief Executive Officer",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Supporting this decision. Stability over shipping speed. Cisco has been burned by memory bottlenecks in v1.4, so we cannot afford an incident within 24 hours of onboarding them. @Elena Rostova make sure SRE team stands ready for an evening roll out if patch succeeds.",
          timestamp: "11:58 AM",
          reactions: [
            { emoji: "🎯", count: 4, users: ["Elena Rostova", "Sarah Chen", "Alex Rivera", "Ryan Mercer"] }
          ]
        }
      ]
    }
  },
  {
    id: "prod-outage",
    name: "Severity 1: Production DB Outage",
    description: "Our primary database cluster experiences locks due to an un-indexed analytics query. API response latencies surge, causing support tickets to spike and customer angst to rise.",
    icon: "ShieldAlert",
    difficulty: "critical",
    channels: {
      engineering: [
        {
          id: "out-eng-1",
          user: "Ryan Mercer",
          role: "Site Reliability Engineer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          content: "🚨 CRITICAL: Main DB cluster graph-db-p1 is showing 100% CPU lock. Write operations are timing out, causing API gateways to throw 504 Gateway Timeouts across the app. Declaring Severity-1 Incident.",
          timestamp: "02:14 PM",
          reactions: [
            { emoji: "😰", count: 4, users: ["Alex Rivera", "Chloe Kim", "Sarah Chen"] },
            { emoji: "🚨", count: 3, users: ["Elena Rostova", "Marcus Thompson"] }
          ],
          replies: [
            {
              id: "out-eng-1-r1",
              user: "Alex Rivera",
              role: "Engineering Lead",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              content: "I am diving in. Let's spin up the incident Zoom immediately. Have we checked active connection strings? Any rogue migrations?",
              timestamp: "02:16 PM"
            },
            {
              id: "out-eng-1-r2",
              user: "Ryan Mercer",
              role: "Site Reliability Engineer",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
              content: "No migrations active. It seems to be a massive spike in read queries locking the shared `user_activities` table. I am extracting pg_stat_activity logs right now.",
              timestamp: "02:18 PM"
            }
          ]
        },
        {
          id: "out-eng-2",
          user: "Ryan Mercer",
          role: "Site Reliability Engineer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Found it: `SELECT COUNT(*) FROM user_activities WHERE organization_id = $1 AND category = $2` is missing an index on the `category` column. That query was called from a new marketing analytics dashboard launched 30 minutes ago, spinning up a sequential scan on 43 million rows.",
          timestamp: "02:25 PM",
          reactions: [
            { emoji: "🤦", count: 4, users: ["Alex Rivera", "Elena Rostova", "Chloe Kim"] }
          ]
        },
        {
          id: "out-eng-3",
          user: "Alex Rivera",
          role: "Engineering Lead",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Action Plan: \n1. @Ryan Mercer - Kill that sequential scanning proc immediately to release CPU locks.\n2. I will write a migration to create a concurrent composite index on `(organization_id, category)` in the background.\n3. @Sarah Chen - We need to temporarily disable the marketing dashboard endpoint in Cloudflare until this index builds.\nIndex build should take ~20 minutes once initiated.",
          timestamp: "02:32 PM",
          reactions: [
            { emoji: "👍", count: 4, users: ["Ryan Mercer", "Sarah Chen", "Elena Rostova"] }
          ],
          replies: [
            {
              id: "out-eng-3-r1",
              user: "Ryan Mercer",
              role: "Site Reliability Engineer",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Sequential proc is KILLED. DB CPU has dropped back to 34%. API Gateway is recovering slowly, but some user sessions are still showing stale cache. Let's clear CDN edge next.",
              timestamp: "02:35 PM"
            }
          ]
        }
      ],
      product: [
        {
          id: "out-prod-1",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Notified about the Sev-1. Yes, the marketing dashboards are loaded by heavy workspace administrators. I did not realize that dashboard hit historical user activities with unstructured filter parameters. My apology for approving that release package without load validation.",
          timestamp: "02:22 PM",
          reactions: [
            { emoji: "🤝", count: 2, users: ["Alex Rivera", "Elena Rostova"] }
          ]
        },
        {
          id: "out-prod-2",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "I have triggered the emergency block on Route 53 and Cloudflare to bypass `/api/v1/analytics/dashboard` for now. Standard users can now access their workspaces without seeing the heavy dashboard request lock.",
          timestamp: "02:38 PM",
          reactions: [
            { emoji: "🎉", count: 3, users: ["Alex Rivera", "Ryan Mercer"] }
          ]
        },
        {
          id: "out-prod-3",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "We need an post-mortem action item: we must mandate query execution plans (EXPLAIN scans) for any features hitting legacy transaction partitions.",
          timestamp: "02:50 PM",
          reactions: [
            { emoji: "💯", count: 4, users: ["Elena Rostova", "Alex Rivera", "Ryan Mercer"] }
          ]
        }
      ],
      support: [
        {
          id: "out-supp-1",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "⚠️ We are getting FLOODED. 87 tickets opened in the last 15 minutes. Customers are seeing infinite loaders and blank screens. Our frontline chat agents are running out of system capacities. I need a clear status update to put on the public status page.",
          timestamp: "02:18 PM",
          replies: [
            {
              id: "out-supp-1-r1",
              user: "Marcus Thompson",
              role: "Support Director",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Especially Cisco admins. They are threatening SLA penalties if this isn't resolved inside of 30 minutes.",
              timestamp: "02:21 PM"
            }
          ]
        },
        {
          id: "out-supp-2",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Posting update to statuspage: 'Investigating database performance lockouts. System services may be sluggish. Team is active.' Will update once Alex confirms index migration is done.",
          timestamp: "02:35 PM"
        },
        {
          id: "out-supp-3",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Update: Ticket incoming rate has slowed since Sarah disabled the analytics query. Some clients are reporting workspaces are loading again. @Alex Rivera, can I officially mark the issue as 'Resolved' on our StatusPage?",
          timestamp: "02:55 PM",
          replies: [
            {
              id: "out-supp-3-r1",
              user: "Alex Rivera",
              role: "Engineering Lead",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Yes, index is created successfully and queries are running in sub-millisecond range now. Post-mortem is marked. Let's declare resolved.",
              timestamp: "02:58 PM"
            }
          ]
        }
      ],
      leadership: [
        {
          id: "out-lead-1",
          user: "Elena Rostova",
          role: "Chief Technology Officer",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Monitoring the database lockout closely. @Alex Rivera @Ryan Mercer - Excellent work locating that lock so fast. When the index query is run, please verify we aren't introducing disk I/O thresholds.",
          timestamp: "02:40 PM"
        },
        {
          id: "out-lead-2",
          user: "David Vance",
          role: "Chief Executive Officer",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Elena, I will handle executive outreach to Cisco's team. They were impacted for 24 minutes, but since we avoided long-term corruptions, I can smooth this over. I'll need the verified Root Cause Summary (RCA) by 5:00 PM today.",
          timestamp: "02:48 PM",
          reactions: [
            { emoji: "👍", count: 3, users: ["Elena Rostova", "Sarah Chen", "Alex Rivera"] }
          ]
        },
        {
          id: "out-lead-3",
          user: "Elena Rostova",
          role: "Chief Technology Officer",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Will do, David. Alex and Ryan will draft the technical RCA draft by 4:00 PM, and I will review and send it over to you. Good lessons here on database safeguards during analytics releases.",
          timestamp: "02:59 PM",
          reactions: [
            { emoji: "🤝", count: 4, users: ["David Vance", "Alex Rivera", "Ryan Mercer", "Sarah Chen"] }
          ]
        }
      ]
    }
  },
  {
    id: "roadmap-pivot",
    name: "Mid-Quarter Agile Roadmap Pivot",
    description: "Competitor moves force product management to reprioritize generative AI integrations instantly. This means stopping current workflow automations and shifting the engineering team's focus.",
    icon: "GitPullRequest",
    difficulty: "normal",
    channels: {
      engineering: [
        {
          id: "piv-eng-1",
          user: "Alex Rivera",
          role: "Engineering Lead",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Team, we just finished a strategic sync. We are pausing our work on 'Custom SMTP triggers' effective immediately. We are pivoting to 'AI Context Contextual Summaries' to launch by end of sprint.",
          timestamp: "10:15 AM",
          reactions: [
            { emoji: "😮", count: 4, users: ["Ryan Mercer", "Chloe Kim", "Sarah Chen"] },
            { emoji: "🧠", count: 2, users: ["Ryan Mercer", "Chloe Kim"] }
          ],
          replies: [
            {
              id: "piv-eng-1-r1",
              user: "Ryan Mercer",
              role: "Site Reliability Engineer",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Wait, SMTP triggers are 90% completed! We already passed schema migration reviews. Is it safe to just abandon this branch?",
              timestamp: "10:18 AM"
            },
            {
              id: "piv-eng-1-r2",
              user: "Alex Rivera",
              role: "Engineering Lead",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              content: "We aren't deleting it. We will stash it in a feature branch. But competitive dynamics require us to integrate the AI models immediately. Sarah will explain in #product.",
              timestamp: "10:22 AM"
            }
          ]
        },
        {
          id: "piv-eng-2",
          user: "Chloe Kim",
          role: "QA Specialist",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Testing AI completions is a whole different beast. We need test frameworks for LLM evaluation, prompt injections, and token overflow. Do we have access to the model SDK credentials yet?",
          timestamp: "10:35 AM",
          reactions: [
            { emoji: "☝️", count: 2, users: ["Alex Rivera", "Ryan Mercer"] }
          ],
          replies: [
            {
              id: "piv-eng-2-r1",
              user: "Elena Rostova",
              role: "Chief Technology Officer",
              avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Yes, I am setting up the enterprise credentials for Gemini in our sandbox environment. Secrets will be deployed to SRE vault by 1:00 PM.",
              timestamp: "10:40 AM"
            }
          ]
        },
        {
          id: "piv-eng-3",
          user: "Alex Rivera",
          role: "Engineering Lead",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Let's organize a tech-arch spike at 1:30 PM. We need to design the server-side API endpoints proxying to Gemini so credentials stay safe, and model responses can be cached to prevent token burns.",
          timestamp: "11:00 AM",
          reactions: [
            { emoji: "🚀", count: 3, users: ["Ryan Mercer", "Chloe Kim", "Elena Rostova"] }
          ]
        }
      ],
      product: [
        {
          id: "piv-prod-1",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Hey team, sharing context on the pivot. Slack and Microsoft Teams just announced native thread summaries in their core tiers last week, and our prospective enterprise accounts are asking why we don't support AI digests yet. To preserve our pipeline, we MUST close this gap this quarter.",
          timestamp: "10:25 AM",
          reactions: [
            { emoji: "⚡", count: 4, users: ["Alex Rivera", "Elena Rostova", "Marcus Thompson", "Chloe Kim"] }
          ]
        },
        {
          id: "piv-prod-2",
          user: "Sarah Chen",
          role: "VP Product",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
          content: "I have updated the Figma mockup with our proposed 'AI Summary Ribbon' layout. Since we already have thread data structured, the main challenge is the API performance. @Alex is the 1:30 PM spike open for me to align on UX constraints?",
          timestamp: "10:55 AM",
          replies: [
            {
              id: "piv-prod-2-r1",
              user: "Alex Rivera",
              role: "Engineering Lead",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Absolutely! Please join. We need your UX constraints, especially on handling loading/streaming states so the user doesn't feel like the app is hung.",
              timestamp: "10:59 AM"
            }
          ]
        }
      ],
      support: [
        {
          id: "piv-supp-1",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "This pivot makes perfect sense from where I sit. Our support reps have been asked 30+ times about 'Auto-summarization features'. This will save high quantities of handle time. Will we have an early beta for the helpdesk to test?",
          timestamp: "10:30 AM",
          reactions: [
            { emoji: "🔥", count: 3, users: ["Sarah Chen", "Alex Rivera", "Elena Rostova"] }
          ]
        },
        {
          id: "piv-supp-2",
          user: "Marcus Thompson",
          role: "Support Director",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          content: "By the way, what about the SMTP trigger beta? We had configured 5 customers who were active on the waiting list. How should I message them?",
          timestamp: "11:15 AM",
          replies: [
            {
              id: "piv-supp-2-r1",
              user: "Sarah Chen",
              role: "VP Product",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
              content: "Tell them SMTP triggers are delayed into Q4 while we security-audited the mail transport gateways, but we want them to join our exclusive early AI summary beta in 2 weeks instead. That usually excites them even more!",
              timestamp: "11:22 AM"
            }
          ]
        }
      ],
      leadership: [
        {
          id: "piv-lead-1",
          user: "David Vance",
          role: "Chief Executive Officer",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Appreciate the swift action on this pivot. I've assured our lead VC partner we are moving fast on the LLM roadmap. @Elena @Sarah, can we commit to a fully working demo for our board meeting on Tuesday next week?",
          timestamp: "11:30 AM"
        },
        {
          id: "piv-lead-2",
          user: "Elena Rostova",
          role: "Chief Technology Officer",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          content: "Yes, David. Our engineering spike is starting in 2 hours. Since we are using standard Gemini endpoints, we don't have model training overheads. We will have a robust proof-of-concept running on staging for Monday QA reviews, fully ready for the board on Tuesday.",
          timestamp: "11:35 AM",
          reactions: [
            { emoji: "📈", count: 4, users: ["David Vance", "Sarah Chen", "Alex Rivera", "Ryan Mercer"] }
          ]
        }
      ]
    }
  }
];
