import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { 
  Sparkles, 
  Lock, 
  Mail, 
  Database, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  Network
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (userEmail: string, authType: "supabase" | "demo") => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"supabase" | "demo">(isSupabaseConfigured ? "supabase" : "demo");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-fill demo credentials
  const handleAutoFillDemo = () => {
    setEmail("admin@acme.corp");
    setPassword("password123");
    setAuthMode("demo");
    setFeedbackMsg({
      text: "Demo credentials pre-filled. Click 'Begin Demo Session' to enter.",
      type: "info"
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedbackMsg({ text: "Please enter both email and password.", type: "error" });
      return;
    }

    setIsLoading(true);
    setFeedbackMsg(null);

    // 1. SUPABASE MODE
    if (authMode === "supabase") {
      if (!isSupabaseConfigured || !supabase) {
        setFeedbackMsg({
          text: "Supabase parameters are not defined in your environment settings.",
          type: "error"
        });
        setIsLoading(false);
        return;
      }

      try {
        if (isRegistering) {
          // Register User
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (data?.user?.identities?.length === 0) {
            setFeedbackMsg({
              text: "This email is already registered! Attempting to sign in instead...",
              type: "info"
            });
            // Fallback sign in
            const { error: signInErr } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInErr) throw signInErr;
            onLoginSuccess(email, "supabase");
          } else {
            setFeedbackMsg({
              text: "Success! Registration completed. Welcome to Workspace Pro.",
              type: "success"
            });
            setTimeout(() => {
              onLoginSuccess(email, "supabase");
            }, 1000);
          }
        } else {
          // Normal Sign In
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data?.user) {
            setFeedbackMsg({ text: "Authenticated! Redirecting to Slack Workspace...", type: "success" });
            setTimeout(() => {
              onLoginSuccess(email, "supabase");
            }, 800);
          }
        }
      } catch (err: any) {
        console.error("Supabase action error:", err);
        setFeedbackMsg({
          text: err.message || "Authentication failed. Double check your credentials.",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }

    } else {
      // 2. DEMO LOCAL BYPASS MODE
      setTimeout(() => {
        setIsLoading(false);
        if (isRegistering) {
          setFeedbackMsg({
            text: `Mock demo account created successfully for ${email}! Redirecting...`,
            type: "success"
          });
          setTimeout(() => {
            onLoginSuccess(email, "demo");
          }, 800);
        } else {
          // Check static bypass
          if (email === "admin@acme.corp" && password === "password123") {
            setFeedbackMsg({ text: "Demo authentication successful! Loading workspace...", type: "success" });
            setTimeout(() => {
              onLoginSuccess(email, "demo");
            }, 800);
          } else {
            // we will let any valid format pass for simple prototyping representation
            setFeedbackMsg({
              text: "Demo Mode accepts any credentials! Logging into representative session...",
              type: "success"
            });
            setTimeout(() => {
              onLoginSuccess(email, "demo");
            }, 1000);
          }
        }
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F6] flex flex-col items-center justify-center font-sans p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        
        {/* Brand Banner Header */}
        <div className="bg-[#4A154B] p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#36C5F0]/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-5 h-5 bg-[#36C5F0] rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Acme Digest Pro</h1>
          </div>
          <p className="text-purple-100 text-xs">
            Slack Manager Incident Command Dashboard & Analysis Suite
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">

          {/* Connection Status Indicator Badge */}
          <div className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 ${
            isSupabaseConfigured
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-amber-50 border-amber-100 text-amber-800"
          }`}>
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
              {isSupabaseConfigured ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Live Supabase Integrator Ready</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Missing Supabase Env Variables</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed font-normal">
              {isSupabaseConfigured 
                ? "Your workspace is securely bound to a live Supabase authentication endpoint. Enter your credentials or quick register below."
                : "Variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not present in your secrets. You can play, register accounts, and run fully-featured analysis using the preloaded sandbox demo login."
              }
            </p>
          </div>

          {/* Selection of live vs demo tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                if (!isSupabaseConfigured) {
                  setFeedbackMsg({
                    text: "You can configure Supabase variables in the Settings menu to test live cloud authorization.",
                    type: "info"
                  });
                }
                setAuthMode("supabase");
              }}
              className={`py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "supabase"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Live Supabase
            </button>
            <button
              onClick={() => setAuthMode("demo")}
              className={`py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "demo"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Interactive Demo Tab
            </button>
          </div>

          {/* Interactive Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret passcode"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Error / Success Alerts */}
            {feedbackMsg && (
              <div className={`p-3.5 rounded-xl text-xs space-y-1 border ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : feedbackMsg.type === "error"
                  ? "bg-rose-50 border-rose-100 text-rose-800"
                  : "bg-indigo-50 border-indigo-100 text-[#4A154B]"
              }`}>
                <p className="font-semibold leading-normal">
                  {feedbackMsg.text}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4A154B] hover:bg-[#39103a] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer select-none active:scale-98"
              >
                {isLoading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                ) : (
                  <>
                    <span>
                      {authMode === "supabase" 
                        ? (isRegistering ? "Register Supabase Account" : "Access via Live Supabase")
                        : (isRegistering ? "Generate Mock Account" : "Begin Demo Session")
                      }
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Toggle registering button */}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-slate-500 hover:text-[#4A154B] text-[11px] font-semibold tracking-wider text-center pt-1"
              >
                {isRegistering 
                  ? "Already have an account? Log in"
                  : "Need a new account? Register here"
                }
              </button>
            </div>

          </form>

          {/* Quick Demo Bypass Assistant */}
          <div className="border-t border-slate-100 pt-5 text-center space-y-3.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Quick Sandbox Assistance
            </span>

            <button
              onClick={handleAutoFillDemo}
              className="w-full bg-[#F8F9FA] hover:bg-[#eaecee] border border-slate-200 hover:border-slate-350 p-4 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#4A154B] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">One-Click Demo Override</p>
                <p className="text-[10px] text-slate-400 truncate leading-snug">
                  Fill credentials (<span className="font-mono">admin@acme.corp</span>)
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#4A154B] shrink-0" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
