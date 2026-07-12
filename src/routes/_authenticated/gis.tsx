import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PanelFrame, MapFrame, SectionHeading, Reveal } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/gis")({
  head: () => ({ meta: [{ title: "Geospatial — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Intelligence" title="Geospatial">
      <Reveal>
        <SectionHeading
          title="Geospatial intelligence workspace"
          description="Every operation is geographically aware. Layers, catchments, boundaries and geospatial signals will live here."
        />
        <PanelFrame title="Base layer" description="Mapbox / MapLibre integration lands in Phase 2B.2">
          <MapFrame label="Base map" />
        </PanelFrame>
      </Reveal>
    </AppShell>
  ),
});
