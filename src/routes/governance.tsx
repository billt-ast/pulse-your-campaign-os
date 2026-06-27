import { createFileRoute } from "@tanstack/react-router";
import { GovernanceSection, PulseShell } from "./index";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance Transition — Pulse" },
      { name: "description", content: "The campaign doesn't end on election day. Pulse preserves institutional knowledge and relationships into governance delivery." },
      { property: "og:title", content: "Governance Transition — Pulse" },
      { property: "og:description", content: "From campaign workspace to governance delivery — same data, new lens." },
    ],
  }),
  component: GovernancePage,
});

function GovernancePage() {
  return (
    <PulseShell>
      <GovernanceSection />
    </PulseShell>
  );
}
