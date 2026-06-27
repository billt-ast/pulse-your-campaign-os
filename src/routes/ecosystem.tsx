import { createFileRoute } from "@tanstack/react-router";
import { EcosystemSection, PulseShell } from "./index";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: "Ecosystem — Pulse" },
      { name: "description", content: "One core. Twenty-three modules. An ecosystem of connected workspaces that share data, permissions and operating language." },
      { property: "og:title", content: "Ecosystem — Pulse" },
      { property: "og:description", content: "An ecosystem of workspaces sharing one core." },
    ],
  }),
  component: EcosystemPage,
});

function EcosystemPage() {
  return (
    <PulseShell>
      <EcosystemSection />
    </PulseShell>
  );
}
