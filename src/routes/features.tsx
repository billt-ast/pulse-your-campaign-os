import { createFileRoute } from "@tanstack/react-router";
import { InteractiveFeatures, PulseShell } from "./index";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Pulse" },
      { name: "description", content: "Explore eight signature workspaces — campaign management, community, manifesto, polls, projects, issues, mapping and QR distribution." },
      { property: "og:title", content: "Features — Pulse" },
      { property: "og:description", content: "Eight signature workspaces. Pick one." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <PulseShell>
      <InteractiveFeatures />
    </PulseShell>
  );
}
