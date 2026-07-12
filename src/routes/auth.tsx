import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Pulse" },
      { name: "description", content: "Access Mission Control for Pulse." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const goHome = () => {
    const safe = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
    navigate({ to: safe, replace: true });
  };

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        goHome();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
        goHome();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
      goHome();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Brand pane */}
        <div className="relative hidden overflow-hidden border-r border-hairline bg-ink text-paper lg:block">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, oklch(0.62 0.16 150 / 0.4), transparent 60%), radial-gradient(circle at 70% 70%, oklch(0.42 0.08 265 / 0.5), transparent 60%)",
          }} />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-paper text-ink">
                <span className="h-2 w-2 rounded-full bg-civic" />
              </span>
              <span className="font-display text-2xl">Pulse</span>
            </Link>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-paper/60">Mission Control</p>
              <h2 className="mt-3 font-display text-4xl leading-tight">
                The operating system for modern campaigns and governance.
              </h2>
              <p className="mt-4 max-w-md text-sm text-paper/70">
                Strategy, operations, intelligence and execution in one cinematic workspace.
              </p>
            </div>
            <p className="text-xs text-paper/50">© {new Date().getFullYear()} Pulse. All rights reserved.</p>
          </div>
        </div>

        {/* Auth pane */}
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-graphite">
              {mode === "sign-in" ? "Welcome back" : "Create an account"}
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              {mode === "sign-in" ? "Sign in to Pulse" : "Join Pulse"}
            </h1>

            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-hairline bg-paper px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-secondary disabled:opacity-50"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-graphite">
              <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-graphite" htmlFor="email">Work email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-graphite" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-navy"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-navy disabled:opacity-50"
              >
                {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-xs text-graphite">
              {mode === "sign-in" ? "New to Pulse?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
                className="font-medium text-ink underline underline-offset-2"
              >
                {mode === "sign-in" ? "Create an account" : "Sign in"}
              </button>
            </p>

            <p className="mt-8 text-xs text-graphite">
              <Link to="/" className="underline underline-offset-2">← Back to the landing experience</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.65 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.15.8 3.87 1.49L18.6 4.9C16.99 3.4 14.72 2.5 12 2.5 6.9 2.5 2.75 6.65 2.75 11.75S6.9 21 12 21c6.93 0 9.25-4.86 9.25-9.14 0-.62-.07-1.09-.16-1.56H12z"/>
    </svg>
  );
}
