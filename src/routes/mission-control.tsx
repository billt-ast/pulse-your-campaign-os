import { createFileRoute } from "@tanstack/react-router";
import { MissionControlSection, PulseShell } from "./index";

export const Route = createFileRoute("/mission-control")({
  head: () => ({
    meta: [
      { title: "Mission Control — Pulse" },
      { name: "description", content: "Strategy, operations, communications and movement health — viewed from a single executive workspace." },
      { property: "og:title", content: "Mission Control — Pulse" },
      { property: "og:description", content: "The single pane of glass campaign leadership has been waiting for." },
    ],
  }),
  component: MissionControlPage,
});

function MissionControlPage() {
  return (
    <PulseShell>
      <MissionControlSection />
    </PulseShell>
  );
}
