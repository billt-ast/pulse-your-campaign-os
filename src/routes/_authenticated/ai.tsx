import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/ai")({
  head: () => ({ meta: [{ title: "Pulse AI — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Intelligence" title="Pulse AI">
      <ComingSoon
        title="Context-aware AI copilots"
        description="Agents, briefings and prompts grounded in the organization's own operational context. Powered by Lovable AI Gateway."
        bullets={["Briefing generator", "Field agent copilot", "Prompt library", "Retrieval-augmented context"]}
      />
    </AppShell>
  ),
});
