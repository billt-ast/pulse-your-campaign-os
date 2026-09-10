/** Client-side Mission Control helpers: query keys and lifecycle metadata. */
import type { MissionStatus } from "@/packages/validators";
import type { LifecycleAction } from "./mission-control.functions";

export const missionControlKey = ["mission-control", "overview"] as const;

/** Which lifecycle action is offered next for a mission in each status. */
export const NEXT_ACTIONS: Record<MissionStatus, LifecycleAction[]> = {
  draft: ["plan"],
  planning: ["launch"],
  active: ["pause", "complete"],
  paused: ["resume", "complete"],
  completed: ["archive"],
  archived: [],
};

export const ACTION_LABEL: Record<LifecycleAction, string> = {
  plan: "Move to planning",
  launch: "Launch (needs approval)",
  pause: "Pause",
  resume: "Resume",
  complete: "Complete",
  archive: "Archive",
};

export const STATUS_TONE: Record<MissionStatus, string> = {
  draft: "bg-secondary text-graphite",
  planning: "bg-[oklch(0.93_0.05_265)] text-navy",
  active: "bg-[oklch(0.9_0.09_150)] text-[oklch(0.35_0.1_150)]",
  paused: "bg-[oklch(0.94_0.08_75)] text-[oklch(0.4_0.09_60)]",
  completed: "bg-[oklch(0.92_0.03_265)] text-navy",
  archived: "bg-secondary text-graphite",
};

export const MISSION_TYPES = [
  "campaign",
  "governance",
  "ngo_program",
  "advocacy",
  "civic_engagement",
  "internal",
] as const;

export const ORG_KINDS = ["party", "committee", "ngo", "government", "agency", "other"] as const;

export function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
