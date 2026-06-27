import { createFileRoute } from "@tanstack/react-router";
import { PulseShell, WalkthroughSection } from "./index";

export const Route = createFileRoute("/walkthrough")({
  head: () => ({
    meta: [
      { title: "Walkthrough — Pulse" },
      { name: "description", content: "Follow an entire election lifecycle through Pulse — six chapters from planning to election day." },
      { property: "og:title", content: "Walkthrough — Pulse" },
      { property: "og:description", content: "Six chapters. One continuous workspace. Planning, volunteers, community, comms, polling and election day." },
    ],
  }),
  component: WalkthroughPage,
});

function WalkthroughPage() {
  return (
    <PulseShell>
      <WalkthroughSection />
    </PulseShell>
  );
}
