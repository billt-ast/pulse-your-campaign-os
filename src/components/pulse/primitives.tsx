/**
 * Pulse UI primitives
 * ---------------------------------------------------------------------------
 * Reusable, design-system-consumable building blocks. Authenticated pages
 * MUST prefer these over hand-rolled markup so visual language stays coherent
 * with the Phase 2A landing experience.
 * ---------------------------------------------------------------------------
 */
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { motion as motionTokens } from "./tokens";

/* --------------------------------- Card ---------------------------------- */
export function PulseCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-hairline bg-card p-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------- Section head ------------------------------ */
export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-6", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-graphite">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl leading-tight text-ink md:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------- Stats ---------------------------------- */
export function StatCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  hint?: string;
}) {
  const deltaColor =
    delta?.direction === "up"
      ? "text-civic"
      : delta?.direction === "down"
        ? "text-destructive"
        : "text-graphite";
  return (
    <PulseCard className="p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">{label}</p>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta && <span className={deltaColor}>{delta.value}</span>}
        {hint && <span className="text-graphite">{hint}</span>}
      </div>
    </PulseCard>
  );
}

/* --------------------------- Dashboard grid ------------------------------ */
export function DashboardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>
  );
}

/* ------------------------------ Panel frame ------------------------------ */
export function PanelFrame({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <PulseCard className={cn("flex flex-col gap-4", className)}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-graphite">{description}</p>}
        </div>
        {actions}
      </header>
      <div>{children}</div>
    </PulseCard>
  );
}

/* --------------------------- Placeholder frames -------------------------- */
export function MapFrame({ label = "Geospatial layer" }: { label?: string }) {
  return (
    <div className="relative h-72 overflow-hidden rounded-xl border border-hairline bg-[oklch(0.965_0.01_240)]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0.01 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.01 260) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute left-4 top-4 rounded-full border border-hairline bg-paper px-3 py-1 text-[11px] uppercase tracking-widest text-graphite">
        {label}
      </div>
      <div className="absolute bottom-6 right-6 h-16 w-16 rounded-full border border-civic/50 bg-civic/10" />
      <div className="absolute left-1/3 top-1/2 h-3 w-3 rounded-full bg-navy" />
      <div className="absolute right-1/3 top-1/3 h-3 w-3 rounded-full bg-civic" />
    </div>
  );
}

export function ChartFrame({ label = "Chart" }: { label?: string }) {
  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-hairline bg-paper p-4">
      <p className="text-[11px] uppercase tracking-widest text-graphite">{label}</p>
      <svg viewBox="0 0 400 160" className="mt-3 h-40 w-full">
        <defs>
          <linearGradient id="pulseGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--civic)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--civic)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 C60,80 120,110 180,70 C240,30 300,90 400,50 L400,160 L0,160 Z"
          fill="url(#pulseGradient)"
        />
        <path
          d="M0,120 C60,80 120,110 180,70 C240,30 300,90 400,50"
          fill="none"
          stroke="var(--navy)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* --------------------- Empty / coming-soon placeholder -------------------- */
export function ComingSoon({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <PulseCard className="flex flex-col items-start gap-4 p-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3 py-1 text-[11px] uppercase tracking-widest text-graphite">
        <span className="h-1.5 w-1.5 rounded-full bg-civic" />
        Foundation ready · module scaffolded
      </span>
      <div>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite">{description}</p>
      </div>
      {bullets && (
        <ul className="mt-2 grid gap-2 md:grid-cols-2">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 rounded-md border border-hairline bg-paper p-3 text-sm text-ink"
            >
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-navy" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </PulseCard>
  );
}

/* --------------------------- Motion Reveal -------------------------------- */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: motionTokens.duration.base,
        delay,
        ease: motionTokens.ease.entrance,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
