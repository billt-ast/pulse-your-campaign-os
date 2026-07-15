import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "motion/react";
import { useRef, useState, Fragment } from "react";
import { z } from "zod";
import {
  ArrowUpRight,
  ArrowRight,
  Activity,
  Users,
  Megaphone,
  Map as MapIcon,
  ClipboardList,
  BarChart3,
  Calendar,
  MessageSquare,
  QrCode,
  FileText,
  Layers,
  Vote,
  Building2,
  Sparkles,
  Compass,
  Check,
  Menu,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — The operating system for modern campaigns" },
      {
        name: "description",
        content:
          "One workspace for strategy, operations, intelligence and execution — from campaign planning through governance.",
      },
      { property: "og:title", content: "Pulse — The operating system for modern campaigns" },
      {
        property: "og:description",
        content:
          "An immersive product journey through the operating system for people-powered campaigns.",
      },
    ],
  }),
  component: PulseLanding,
});

/* -------------------------------------------------------------------------- */
/*  Small primitives                                                          */
/* -------------------------------------------------------------------------- */

function Eyebrow({ children, index }: { children: React.ReactNode; index?: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-graphite">
      {index && (
        <span className="font-mono text-civic">{index}</span>
      )}
      <span className="h-px w-8 bg-hairline" />
      <span>{children}</span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  index,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  index?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-6 ${
        align === "center" ? "items-center text-center" : "items-start"
      }`}
    >
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        className="font-display text-4xl leading-[1.05] text-balance text-ink md:text-6xl lg:text-7xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`max-w-2xl text-lg leading-relaxed text-graphite ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav                                                                       */
/* -------------------------------------------------------------------------- */

function PulseMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-civic animate-pulse-ring" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-civic" />
      </span>
      <span className="font-display text-[22px] tracking-tight text-ink">pulse</span>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["#problem", "Problem"],
    ["#walkthrough", "Walkthrough"],
    ["#mission", "Mission Control"],
    ["#ecosystem", "Ecosystem"],
    ["#governance", "Governance"],
  ] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="container-pulse">
        <div className="mt-3 flex items-center justify-between gap-3 rounded-full border border-hairline/80 bg-background/70 px-4 py-2 backdrop-blur-xl sm:mt-4 sm:px-5 sm:py-2.5">
          <PulseMark />
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-graphite md:flex">
            {links.map(([href, label]) => (
              <a key={href} href={href} className="rounded-sm hover:text-ink transition-colors">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#demo-request"
              className="group hidden items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm text-primary-foreground transition-all hover:bg-ink sm:inline-flex"
            >
              Book a demo
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-ink md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="container-pulse md:hidden"
          >
            <div className="mt-2 rounded-3xl border border-hairline bg-background/95 p-5 backdrop-blur-xl shadow-lg">
              <nav aria-label="Mobile" className="flex flex-col divide-y divide-hairline">
                {links.map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3 text-base text-ink"
                  >
                    {label}
                    <ArrowUpRight className="h-4 w-4 text-graphite" aria-hidden="true" />
                  </a>
                ))}
              </nav>
              <a
                href="#demo-request"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-navy px-4 py-3 text-sm text-primary-foreground"
              >
                Request private demonstration
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function NetworkBackdrop() {
  const reduce = useReducedMotion();
  // Decorative nodes
  const nodes = [
    [12, 22], [28, 14], [44, 28], [60, 12], [76, 24], [88, 38],
    [20, 48], [38, 56], [56, 46], [72, 60], [86, 70],
    [16, 78], [34, 86], [52, 74], [68, 88], [82, 82],
  ] as const;
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full opacity-[0.55]"
    >
      <defs>
        <radialGradient id="fade" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
        <mask id="m"><rect width="100" height="100" fill="white" /><rect width="100" height="100" fill="url(#fade)" /></mask>
      </defs>
      <g mask="url(#m)" stroke="oklch(0.28 0.07 265 / 0.18)" strokeWidth="0.12" fill="none">
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => {
            const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
            if (d > 28) return null;
            return <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
          }),
        )}
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="0.35" fill="oklch(0.28 0.07 265)" />
            {!reduce && i % 4 === 0 && (
              <circle cx={x} cy={y} r="0.35" fill="oklch(0.62 0.16 150)">
                <animate attributeName="r" values="0.35;1.6;0.35" dur="3.6s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                <animate attributeName="opacity" values="1;0;1" dur="3.6s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
              </circle>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

function HeroDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative mx-auto w-full max-w-5xl"
    >
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-card shadow-[0_30px_80px_-30px_rgba(20,30,60,0.18)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
          <div className="ml-4 flex items-center gap-2 text-xs text-graphite">
            <PulseMark />
            <span className="ml-2">/ mission-control</span>
          </div>
          <div className="ml-auto text-xs text-graphite">Tue 09:41</div>
        </div>
        <div className="grid grid-cols-12 gap-px bg-hairline/60">
          {/* Sidebar */}
          <div className="col-span-3 bg-card p-5 hidden md:block">
            <p className="text-[10px] uppercase tracking-widest text-graphite">Workspace</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {["Mission Control", "Campaign", "Community", "Communications", "Polling", "Mapping", "Projects", "Manifesto"].map(
                (l, i) => (
                  <li
                    key={l}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 ${
                      i === 0 ? "bg-navy/5 text-ink" : "text-graphite"
                    }`}
                  >
                    <span>{l}</span>
                    {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-civic" />}
                  </li>
                ),
              )}
            </ul>
          </div>
          {/* Main */}
          <div className="col-span-12 md:col-span-9 bg-card p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-graphite">Campaign Pulse Score</p>
                <p className="font-display text-5xl text-ink">87<span className="text-graphite text-2xl">/100</span></p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-graphite">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-civic" /> Operations</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-navy" /> Strategy</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-graphite/60" /> Comms</span>
              </div>
            </div>
            <div className="mt-4 h-32 w-full">
              <svg viewBox="0 0 400 120" className="h-full w-full">
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 150)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 150)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, delay: 1, ease: "easeOut" }}
                  d="M0,80 C40,70 70,90 110,72 C150,55 180,68 220,50 C260,32 300,40 340,28 C370,20 390,18 400,16"
                  fill="none"
                  stroke="oklch(0.62 0.16 150)"
                  strokeWidth="2"
                />
                <path
                  d="M0,80 C40,70 70,90 110,72 C150,55 180,68 220,50 C260,32 300,40 340,28 C370,20 390,18 400,16 L400,120 L0,120 Z"
                  fill="url(#g1)"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.4, delay: 1.2 }}
                  d="M0,95 C50,88 80,92 130,82 C180,72 220,82 270,68 C310,56 350,60 400,48"
                  fill="none"
                  stroke="oklch(0.28 0.07 265)"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                />
              </svg>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { l: "Active volunteers", v: "12,408", d: "+184 today" },
                { l: "Wards covered", v: "92%", d: "284 of 308" },
                { l: "Open issues", v: "47", d: "12 resolved" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-hairline p-3">
                  <p className="text-[10px] uppercase tracking-widest text-graphite">{s.l}</p>
                  <p className="mt-1 font-display text-2xl text-ink">{s.v}</p>
                  <p className="text-[11px] text-civic">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Soft glow */}
      <div className="pointer-events-none absolute -inset-x-10 -bottom-10 -z-10 h-32 bg-civic/10 blur-3xl" />
    </motion.div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-36 pb-28 md:pt-44 md:pb-40">
      <NetworkBackdrop />
      <motion.div style={{ y, opacity }} className="container-pulse relative">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Eyebrow index="00 / Pulse">An operating system for campaigns</Eyebrow>
          </Reveal>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            className="mt-8 font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-ink text-balance md:text-7xl lg:text-[88px]"
          >
            Campaigns move fast.<br />
            <span className="italic text-navy">Leadership</span> should move{" "}
            <span className="italic text-civic">faster</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-graphite md:text-xl"
          >
            One operating system for strategy, operations, intelligence and execution —
            from the first volunteer to the first day of governance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href="#closing"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Book private demonstration
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#walkthrough"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-background/60 px-6 py-3 text-sm text-ink backdrop-blur transition-colors hover:bg-card"
            >
              Explore the platform
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
        <div className="mt-20 md:mt-28">
          <HeroDashboardPreview />
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Problem                                                                   */
/* -------------------------------------------------------------------------- */

function ProblemSection() {
  // Orbital rings: each ring holds chips at fixed angles, the ring rotates,
  // chips counter-rotate to keep text upright, and each chip gently pulsates.
  const rings: { radius: number; duration: number; direction: 1 | -1; chips: { l: string; angle: number }[] }[] = [
    {
      radius: 22,
      duration: 42,
      direction: 1,
      chips: [
        { l: "Spreadsheets", angle: 40 },
        { l: "PDFs", angle: 210 },
      ],
    },
    {
      radius: 34,
      duration: 60,
      direction: -1,
      chips: [
        { l: "Paper maps", angle: 100 },
        { l: "WhatsApp groups", angle: 160 },
        { l: "Social DMs", angle: 20 },
        { l: "Emails", angle: 285 },
      ],
    },
    {
      radius: 46,
      duration: 90,
      direction: 1,
      chips: [
        { l: "Volunteer lists", angle: 200 },
        { l: "Phone calls", angle: 320 },
      ],
    },
  ];
  const insights = [
    "Fragmented communication",
    "Lost institutional knowledge",
    "Poor operational visibility",
    "Manual coordination",
    "Reactive decision making",
  ];
  return (
    <section id="problem" className="border-t border-hairline py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="01"
          eyebrow="The current reality"
          title={
            <>
              Modern campaigns run on a{" "}
              <span className="italic text-navy">dozen disconnected tools</span>.
            </>
          }
          subtitle="The cost is invisible until election day — when fragmentation becomes the difference between a coordinated movement and a scattered one."
        />

        <div className="relative mt-20 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-2xl border border-hairline bg-card">
            {/* Concentric orbit rings */}
            {rings.map((ring, i) => (
              <div
                key={`ring-${i}`}
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy/10"
                style={{ width: `${ring.radius * 2}%`, height: `${ring.radius * 2}%` }}
              />
            ))}

            {/* Rotating chip layers */}
            {rings.map((ring, ri) => (
              <motion.div
                key={`orbit-${ri}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: `${ring.radius * 2}%`, height: `${ring.radius * 2}%` }}
                animate={{ rotate: ring.direction * 360 }}
                transition={{ duration: ring.duration, ease: "linear", repeat: Infinity }}
              >
                {ring.chips.map((chip, ci) => {
                  const rad = (chip.angle * Math.PI) / 180;
                  const x = 50 + 50 * Math.cos(rad);
                  const y = 50 + 50 * Math.sin(rad);
                  return (
                    <motion.div
                      key={chip.l}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      animate={{ rotate: -ring.direction * 360 }}
                      transition={{ duration: ring.duration, ease: "linear", repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                        transition={{
                          duration: 2.8 + ci * 0.3,
                          ease: "easeInOut",
                          repeat: Infinity,
                          delay: (ri + ci) * 0.25,
                        }}
                        className="whitespace-nowrap rounded-md border border-hairline bg-background px-3 py-1.5 text-xs text-graphite shadow-sm"
                      >
                        {chip.l}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}

            {/* Center pulse core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-civic/30 blur-2xl" />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-navy/20 bg-card">
                  <PulseMark />
                </div>
              </div>
            </motion.div>
          </div>

          <ul className="flex flex-col justify-center gap-1">
            {insights.map((t, i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="group flex items-start gap-4 border-b border-hairline py-5">
                  <span className="mt-1 font-mono text-xs text-graphite">0{i + 1}</span>
                  <span className="flex-1 font-display text-2xl text-ink md:text-3xl">{t}</span>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-civic opacity-60 group-hover:opacity-100" />
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pulse Concept (architecture)                                              */
/* -------------------------------------------------------------------------- */

function ConceptSection() {
  const layers = [
    { l: "Data layer", d: "Communities, volunteers, regions, issues." },
    { l: "Coordination layer", d: "Tasks, events, communications, approvals." },
    { l: "Intelligence layer", d: "Pulse score, heatmaps, decision queue." },
    { l: "Engagement layer", d: "Polls, forums, manifesto, QR distribution." },
  ];
  return (
    <section className="border-t border-hairline bg-secondary/40 py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="02"
          eyebrow="The birth of Pulse"
          title={
            <>
              Campaigns are organizations.<br />
              <span className="italic text-graphite">Organizations need operating systems.</span>
            </>
          }
          subtitle="Pulse replaces the dozen disconnected tools with a single architecture — every layer aware of the next."
        />

        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            {layers.map((layer, i) => (
              <Reveal key={layer.l} delay={i * 0.1}>
                <div className="group flex items-center justify-between rounded-xl border border-hairline bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-navy/30">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-graphite">L{i + 1}</span>
                    <div>
                      <p className="font-display text-xl text-ink">{layer.l}</p>
                      <p className="text-sm text-graphite">{layer.d}</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-civic opacity-50 group-hover:opacity-100" />
                </div>
              </Reveal>
            ))}
          </div>

          {/* Architecture diagram */}
          <Reveal delay={0.2}>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-hairline bg-card p-8">
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`absolute rounded-full border border-navy/15 ${
                      n === 2 ? "animate-orbit-slow" : n === 3 ? "animate-orbit-reverse" : ""
                    }`}
                    style={{ width: `${n * 22}%`, height: `${n * 22}%` }}
                  >
                    {n === 2 && (
                      <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-civic" />
                    )}
                    {n === 3 && (
                      <span className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rounded-full bg-navy" />
                    )}
                  </div>
                ))}
                <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-ink text-primary-foreground">
                  <span className="text-[10px] uppercase tracking-widest opacity-70">Core</span>
                  <span className="font-display text-xl">Pulse</span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-4 text-center text-[11px] uppercase tracking-widest text-graphite">
                One core. Every layer aware.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Walkthrough — the signature section                                       */
/* -------------------------------------------------------------------------- */

const chapters = [
  {
    n: "01",
    title: "Planning",
    body: "Define the campaign blueprint. Coordinators, milestones, regions and the operational timeline all begin here.",
    preview: PlanningPreview,
  },
  {
    n: "02",
    title: "Volunteers & Teams",
    body: "Recruit, structure and deploy volunteers by ward, role and capacity. Every team rolls up to one operational tree.",
    preview: VolunteersPreview,
  },
  {
    n: "03",
    title: "Community Engagement",
    body: "Organize supporters into long-term communities by geography and interest, beyond a single election cycle.",
    preview: CommunityPreview,
  },
  {
    n: "04",
    title: "Communications",
    body: "Broadcast across SMS, WhatsApp, email and push from one hub. Targeted by audience, scheduled or sent now.",
    preview: CommsPreview,
  },
  {
    n: "05",
    title: "Field & Polling",
    body: "Run structured polls. Aggregate field reports. Surface what supporters actually care about — by region.",
    preview: PollingPreview,
  },
  {
    n: "06",
    title: "Election Day",
    body: "A real-time operating picture: turnout, incidents, coverage gaps, and the executive decision queue.",
    preview: ElectionPreview,
  },
];

function WalkthroughSection() {
  return (
    <section id="walkthrough" className="border-t border-hairline py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="03"
          eyebrow="Follow a campaign"
          title={<>An entire election lifecycle, <span className="italic text-navy">scroll by scroll</span>.</>}
          subtitle="Six chapters. One continuous workspace. Each step reveals a different surface of Pulse, in the moment a campaign team would use it."
        />
        <div className="mt-20 space-y-28">
          {chapters.map((c, i) => {
            const Preview = c.preview;
            const reversed = i % 2 === 1;
            return (
              <div
                key={c.n}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Reveal>
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-graphite">
                      <span className="font-mono text-civic">CH {c.n}</span>
                      <span className="h-px w-8 bg-hairline" />
                      <span>Chapter {parseInt(c.n)} of {chapters.length}</span>
                    </div>
                    <h3 className="font-display text-4xl text-ink md:text-5xl">{c.title}</h3>
                    <p className="max-w-md text-lg leading-relaxed text-graphite">{c.body}</p>
                  </div>
                </Reveal>
                <Reveal delay={0.15}>
                  <div className="relative">
                    <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-[0_20px_60px_-30px_rgba(20,30,60,0.18)]">
                      <Preview />
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----- Chapter UI previews (compact, realistic) ----- */

function FauxWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-hairline" />
        <span className="h-2 w-2 rounded-full bg-hairline" />
        <span className="h-2 w-2 rounded-full bg-hairline" />
        <span className="ml-3 text-[11px] text-graphite">pulse / {title}</span>
      </div>
      <div className="p-5">{children}</div>
    </>
  );
}

function PlanningPreview() {
  const items = [
    { d: "Launch announcement", o: "Strategy", s: 100 },
    { d: "Volunteer onboarding", o: "Operations", s: 86 },
    { d: "Ward coordinators set", o: "Operations", s: 62 },
    { d: "Manifesto draft v1", o: "Policy", s: 40 },
    { d: "First town hall", o: "Events", s: 18 },
  ];
  return (
    <FauxWindow title="campaign / timeline">
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it.d} className="grid grid-cols-12 items-center gap-3">
            <span className="col-span-5 text-sm text-ink">{it.d}</span>
            <span className="col-span-3 text-xs text-graphite">{it.o}</span>
            <div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-hairline/70">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${it.s}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full bg-civic"
              />
            </div>
            <span className="col-span-1 text-right font-mono text-xs text-graphite">{it.s}%</span>
          </div>
        ))}
      </div>
    </FauxWindow>
  );
}

function VolunteersPreview() {
  const teams = [
    { w: "Westlands", c: "M. Atieno", v: 412 },
    { w: "Kasarani", c: "J. Mwangi", v: 386 },
    { w: "Embakasi N", c: "G. Njeri", v: 521 },
    { w: "Roysambu", c: "D. Otieno", v: 274 },
  ];
  return (
    <FauxWindow title="teams / wards">
      <div className="overflow-hidden rounded-lg border border-hairline">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] uppercase tracking-widest text-graphite">
            <tr>
              <th className="px-3 py-2 text-left font-normal">Ward</th>
              <th className="px-3 py-2 text-left font-normal">Coordinator</th>
              <th className="px-3 py-2 text-right font-normal">Volunteers</th>
              <th className="px-3 py-2 text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.w} className="border-t border-hairline">
                <td className="px-3 py-2.5 text-ink">{t.w}</td>
                <td className="px-3 py-2.5 text-graphite">{t.c}</td>
                <td className="px-3 py-2.5 text-right font-mono text-ink">{t.v}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-civic/10 px-2 py-0.5 text-[11px] text-civic">
                    <span className="h-1.5 w-1.5 rounded-full bg-civic" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FauxWindow>
  );
}

function CommunityPreview() {
  const groups = [
    { l: "Youth · Nairobi", n: 2480 },
    { l: "Boda Riders", n: 1840 },
    { l: "Market Vendors", n: 1620 },
    { l: "Educators", n: 980 },
    { l: "Women in Tech", n: 720 },
  ];
  return (
    <FauxWindow title="community / segments">
      <div className="grid grid-cols-2 gap-3">
        {groups.map((g, i) => (
          <motion.div
            key={g.l}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg border border-hairline p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">{g.l}</span>
              <span className="font-mono text-xs text-graphite">{g.n.toLocaleString()}</span>
            </div>
            <div className="mt-2 flex -space-x-1.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <span
                  key={k}
                  className="h-5 w-5 rounded-full border border-card"
                  style={{
                    background: `oklch(${0.55 + k * 0.05} 0.08 ${150 + i * 20})`,
                  }}
                />
              ))}
              <span className="ml-2 text-[11px] text-graphite">+{Math.floor(g.n / 20)} active</span>
            </div>
          </motion.div>
        ))}
      </div>
    </FauxWindow>
  );
}

function CommsPreview() {
  const channels = [
    { l: "WhatsApp", v: 42 },
    { l: "SMS", v: 28 },
    { l: "Email", v: 17 },
    { l: "Push", v: 13 },
  ];
  return (
    <FauxWindow title="comms / broadcast">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-hairline p-3">
          <p className="text-[11px] uppercase tracking-widest text-graphite">Compose</p>
          <p className="mt-2 text-sm text-ink">Town hall this Saturday at Kasarani Youth Centre. Your voice shapes our future.</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-graphite">
            <span>To: Nairobi · All supporters</span>
            <span className="rounded-full bg-civic/10 px-2 py-0.5 text-civic">Scheduled</span>
          </div>
        </div>
        <div className="space-y-2">
          {channels.map((c, i) => (
            <div key={c.l} className="flex items-center gap-3">
              <span className="w-20 text-xs text-graphite">{c.l}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-hairline/70">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.v * 2}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.1 }}
                  className="h-full bg-navy"
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-ink">{c.v}%</span>
            </div>
          ))}
        </div>
      </div>
    </FauxWindow>
  );
}

function PollingPreview() {
  const issues = [
    { l: "Roads & Infrastructure", v: 45 },
    { l: "Water Supply", v: 28 },
    { l: "Youth Employment", v: 17 },
    { l: "Healthcare", v: 10 },
  ];
  return (
    <FauxWindow title="polls / results">
      <p className="text-sm text-ink">Which issue should we prioritize?</p>
      <p className="text-xs text-graphite">1,245 responses · Nairobi</p>
      <div className="mt-4 space-y-2.5">
        {issues.map((it, i) => (
          <div key={it.l}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink">{it.l}</span>
              <span className="font-mono text-graphite">{it.v}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-hairline/70">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${it.v * 2}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-full ${i === 0 ? "bg-civic" : "bg-navy/70"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </FauxWindow>
  );
}

function ElectionPreview() {
  return (
    <FauxWindow title="election-day / situation">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Turnout", v: "62.4%", d: "+4.1 vs '22" },
          { l: "Incidents", v: "12", d: "8 resolved" },
          { l: "Coverage", v: "98%", d: "302 wards" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-hairline p-3">
            <p className="text-[10px] uppercase tracking-widest text-graphite">{s.l}</p>
            <p className="mt-1 font-display text-2xl text-ink">{s.v}</p>
            <p className="text-[11px] text-civic">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-hairline p-3">
        <p className="text-[11px] uppercase tracking-widest text-graphite">Decision queue</p>
        <ul className="mt-2 space-y-2 text-sm">
          {[
            "Approve volunteer redeployment — Kasarani",
            "Dispatch observer team to Embakasi N",
            "Issue clarification — Roysambu polling station",
          ].map((d, i) => (
            <li key={d} className="flex items-center justify-between border-t border-hairline pt-2 first:border-0 first:pt-0">
              <span className="text-ink">{d}</span>
              <span className="font-mono text-[11px] text-graphite">P{i + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </FauxWindow>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mission Control                                                           */
/* -------------------------------------------------------------------------- */

function MissionControlSection() {
  const overlays = [
    "Campaign Pulse Score",
    "Operational Health Rings",
    "Executive Decision Queue",
    "Campaign Timeline",
    "Strategic Situation Map",
  ];
  return (
    <section id="mission" className="border-t border-hairline bg-ink text-primary-foreground py-28 md:py-40">
      <div className="container-pulse">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
              <span className="font-mono text-civic">04</span>
              <span className="h-px w-8 bg-primary-foreground/20" />
              <span>Mission Control</span>
            </div>
            <h2 className="mt-6 font-display text-5xl leading-[1.02] text-balance md:text-7xl">
              The single pane of glass<br />
              <span className="italic text-civic">campaign leadership</span> has been waiting for.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-primary-foreground/70">
            Strategy, operations, communications and movement health — viewed from one workspace,
            updated in real time. Mission Control is the executive lens on the entire system.
          </p>
        </div>

        {/* Dark dashboard */}
        <Reveal delay={0.15}>
          <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="ml-3 text-[11px] text-primary-foreground/60">mission-control</span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-civic">
                <span className="h-1.5 w-1.5 rounded-full bg-civic animate-pulse" />
                Live
              </span>
            </div>

            <div className="grid gap-px bg-white/5 md:grid-cols-3">
              {/* Pulse score */}
              <div className="bg-ink p-6">
                <p className="text-[11px] uppercase tracking-widest text-primary-foreground/50">Campaign Pulse Score</p>
                <p className="mt-2 font-display text-6xl">87<span className="text-2xl text-primary-foreground/50">/100</span></p>
                <p className="mt-1 text-xs text-civic">+3 over 7 days</p>
                <div className="mt-6 flex items-center gap-4">
                  {[
                    { l: "Strategy", v: 92 },
                    { l: "Ops", v: 88 },
                    { l: "Comms", v: 81 },
                  ].map((r) => (
                    <div key={r.l} className="flex flex-col items-center">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                        <motion.circle
                          cx="24" cy="24" r="20"
                          stroke="oklch(0.62 0.16 150)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 20}
                          initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                          whileInView={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - r.v / 100) }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.4 }}
                          transform="rotate(-90 24 24)"
                          strokeLinecap="round"
                        />
                        <text x="24" y="28" textAnchor="middle" fontSize="11" fill="white">{r.v}</text>
                      </svg>
                      <span className="mt-1 text-[10px] uppercase tracking-widest text-primary-foreground/50">{r.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision queue */}
              <div className="bg-ink p-6">
                <p className="text-[11px] uppercase tracking-widest text-primary-foreground/50">Executive Decision Queue</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    { l: "Approve manifesto v3", t: "Strategy", p: "P1" },
                    { l: "Redeploy 80 volunteers — Kasarani", t: "Operations", p: "P1" },
                    { l: "Sign-off comms — Saturday broadcast", t: "Comms", p: "P2" },
                    { l: "Approve event budget — Kisumu rally", t: "Events", p: "P3" },
                  ].map((d) => (
                    <li key={d.l} className="flex items-start justify-between gap-3 border-t border-white/10 pt-3 first:border-0 first:pt-0">
                      <div>
                        <p className="text-primary-foreground">{d.l}</p>
                        <p className="text-[11px] text-primary-foreground/50">{d.t}</p>
                      </div>
                      <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] text-civic">{d.p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Situation map */}
              <div className="bg-ink p-6">
                <p className="text-[11px] uppercase tracking-widest text-primary-foreground/50">Strategic Situation Map</p>
                <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-lg border border-white/10">
                  <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full">
                    <defs>
                      <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
                        <path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
                      </pattern>
                    </defs>
                    <rect width="100" height="75" fill="url(#grid)" />
                    {[[25, 30], [55, 22], [70, 45], [40, 55], [82, 60], [18, 50]].map(([x, y], i) => (
                      <g key={i}>
                        <circle cx={x} cy={y} r="1.4" fill="oklch(0.62 0.16 150)" />
                        <circle cx={x} cy={y} r="3" fill="none" stroke="oklch(0.62 0.16 150)" opacity="0.4">
                          <animate attributeName="r" values="1.4;5;1.4" dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                          <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                        </circle>
                      </g>
                    ))}
                  </svg>
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-primary-foreground/60">
                    6 active field clusters
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-2">
          {overlays.map((o) => (
            <span key={o} className="rounded-full border border-white/15 px-3 py-1 text-xs text-primary-foreground/70">
              {o}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ecosystem (orbit)                                                         */
/* -------------------------------------------------------------------------- */

const modules = [
  "Campaign Management", "Volunteer & Teams", "Permissions", "Manifesto Builder",
  "Policy Library", "Campaign Calendar", "Task Assignment", "Communications Hub",
  "Polling & Consultation", "Community Management", "Issue Tracking", "Project Tracking",
  "Analytics", "Geo Mapping", "Regional Zoning", "QR Distribution",
  "Media Library", "Event Management", "Document Repository", "Knowledge Base",
  "Feedback Loops", "Election Transition", "Governance Continuity",
];

function EcosystemSection() {
  return (
    <section id="ecosystem" className="border-t border-hairline py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="05"
          eyebrow="Everything connected"
          title={<>One core. <span className="italic text-navy">Twenty-three</span> modules. Zero seams.</>}
          subtitle="Pulse isn't a list of features. It's an ecosystem of workspaces that share the same data, the same permissions, and the same operating language."
          align="center"
        />

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Orbit */}
          <div className="relative mx-auto aspect-square w-full max-w-[480px]">
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                className={`absolute inset-0 m-auto rounded-full border border-navy/10 ${
                  r === 1 ? "animate-orbit-slow" : r === 2 ? "animate-orbit-reverse" : "animate-orbit-slow"
                }`}
                style={{ width: `${r * 30}%`, height: `${r * 30}%` }}
              />
            ))}
            {modules.slice(0, 12).map((m, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const r = 44;
              const x = 50 + r * Math.cos(angle);
              const y = 50 + r * Math.sin(angle);
              return (
                <motion.div
                  key={m}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="whitespace-nowrap rounded-full border border-hairline bg-card px-2.5 py-1 text-[11px] text-graphite shadow-sm">
                    {m}
                  </span>
                </motion.div>
              );
            })}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-civic/30 blur-2xl" />
                <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-ink text-primary-foreground">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Core</span>
                  <span className="font-display text-2xl">Pulse</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full list */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline/60 md:grid-cols-3">
            {modules.map((m) => (
              <div key={m} className="bg-card p-4">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-civic">·</span>
                <span className="mt-1 block text-sm text-ink">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interactive features (expandable cards)                                   */
/* -------------------------------------------------------------------------- */

const showcases = [
  {
    icon: ClipboardList,
    module: "Campaign Management",
    explanation:
      "Plan campaigns, assign coordinators, monitor milestones and track execution from a centralized operational timeline.",
  },
  {
    icon: Users,
    module: "Community",
    explanation:
      "Organize supporters into structured communities by geography and interests — long-term engagement beyond election cycles.",
  },
  {
    icon: FileText,
    module: "Manifesto",
    explanation:
      "Present policy priorities through visual roadmaps, development plans and interactive project previews.",
  },
  {
    icon: Vote,
    module: "Polls & Feedback",
    explanation:
      "Gather structured feedback to surface recurring themes. Present results transparently with aggregated insights.",
  },
  {
    icon: Layers,
    module: "Project Tracking",
    explanation:
      "Watch proposed projects evolve from planning through implementation, allowing leadership and the public to follow progress.",
  },
  {
    icon: MessageSquare,
    module: "Issue Tracking",
    explanation:
      "Community-reported issues are organized, categorized and prioritized for structured follow-up.",
  },
  {
    icon: MapIcon,
    module: "Mapping & Zoning",
    explanation:
      "Visualize regions, administrative boundaries, field teams, events and operational coverage through layered maps.",
  },
  {
    icon: QrCode,
    module: "QR Distribution",
    explanation:
      "Printed campaign materials carry QR codes that connect people directly to campaign info, events or community portals.",
  },
];

function InteractiveFeatures() {
  const [active, setActive] = useState(0);
  const item = showcases[active];
  const Icon = item.icon;
  return (
    <section className="border-t border-hairline bg-secondary/40 py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="06"
          eyebrow="Explore every workspace"
          title={<>Eight signature surfaces. <span className="italic text-graphite">Pick one.</span></>}
        />
        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <ul className="space-y-1">
            {showcases.map((s, i) => {
              const SIcon = s.icon;
              const isActive = i === active;
              return (
                <li key={s.module}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all ${
                      isActive
                        ? "border-navy/30 bg-card shadow-sm"
                        : "border-transparent hover:border-hairline hover:bg-card/60"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                        isActive ? "border-civic/30 bg-civic/10 text-civic" : "border-hairline text-graphite"
                      }`}
                    >
                      <SIcon className="h-4 w-4" />
                    </span>
                    <span className={`flex-1 text-sm ${isActive ? "text-ink" : "text-graphite"}`}>
                      {s.module}
                    </span>
                    <ArrowRight
                      className={`h-4 w-4 transition-transform ${
                        isActive ? "translate-x-0 text-civic" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-hairline bg-card p-8 shadow-[0_20px_60px_-30px_rgba(20,30,60,0.18)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 text-[11px] uppercase tracking-widest text-graphite">
                  <Icon className="h-3 w-3 text-civic" /> Workspace
                </span>
                <h3 className="mt-4 font-display text-3xl text-ink md:text-4xl">{item.module}</h3>
              </div>
              <span className="font-mono text-xs text-graphite">0{active + 1} / 0{showcases.length}</span>
            </div>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-graphite">{item.explanation}</p>

            {/* Faux annotated preview */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-lg border border-hairline p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-graphite">Callout {n}</span>
                    <Check className="h-3 w-3 text-civic" />
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hairline/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${35 + n * 18}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * n }}
                      className="h-full bg-navy/70"
                    />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-1 w-3/4 rounded bg-hairline" />
                    <div className="h-1 w-1/2 rounded bg-hairline" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Intelligence                                                              */
/* -------------------------------------------------------------------------- */

function IntelligenceSection() {
  const tiles = [
    { icon: Users, l: "Community Growth", v: "+18%", d: "Last 30 days" },
    { icon: Activity, l: "Operational Timeline", v: "94%", d: "Milestones on track" },
    { icon: Sparkles, l: "Volunteer Activity", v: "12.4k", d: "Active this week" },
    { icon: MapIcon, l: "Regional Coverage", v: "284", d: "Wards covered" },
    { icon: BarChart3, l: "Campaign Health", v: "87/100", d: "Pulse score" },
    { icon: Layers, l: "Project Pipeline", v: "62", d: "In implementation" },
    { icon: Compass, l: "Issue Heatmaps", v: "9", d: "Priority clusters" },
    { icon: Megaphone, l: "Communications Flow", v: "1.2M", d: "Messages routed" },
  ];
  return (
    <section className="border-t border-hairline py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="07"
          eyebrow="The intelligence layer"
          title={<>Operational data becomes <span className="italic text-civic">organizational awareness</span>.</>}
          subtitle="Pulse turns the noise of a campaign into a continuous read on what's working — without manipulation, without dark patterns. Just clarity."
        />
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline/60 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t, i) => {
            const TIcon = t.icon;
            return (
              <Reveal key={t.l} delay={(i % 4) * 0.06}>
                <div className="group h-full bg-card p-6 transition-colors hover:bg-secondary/40">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-graphite group-hover:text-civic">
                      <TIcon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] text-graphite">/{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-6 font-display text-3xl text-ink">{t.v}</p>
                  <p className="mt-1 text-sm text-ink">{t.l}</p>
                  <p className="text-xs text-graphite">{t.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Governance transition                                                     */
/* -------------------------------------------------------------------------- */

function GovernanceSection() {
  const pairs: [string, string][] = [
    ["Manifesto", "Development Plan"],
    ["Community", "Citizen Communities"],
    ["Events", "Public Forums"],
    ["Issue Collection", "Service Requests"],
    ["Campaign Projects", "Project Delivery"],
  ];
  return (
    <section id="governance" className="border-t border-hairline bg-secondary/40 py-28 md:py-40">
      <div className="container-pulse">
        <SectionHeader
          index="08"
          eyebrow="Governance transition"
          title={
            <>
              The campaign doesn't end on <span className="italic text-navy">election day</span>.
            </>
          }
          subtitle="Pulse preserves institutional knowledge and relationships, allowing organizations to keep engaging communities long after the votes are counted."
        />

        <div className="mt-16 overflow-hidden rounded-2xl border border-hairline bg-card">
          <div className="grid grid-cols-2 gap-px bg-hairline">
            <div className="bg-card p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-graphite">
                <Vote className="h-3 w-3" /> Campaign mode
              </div>
            </div>
            <div className="bg-card p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-civic">
                <Building2 className="h-3 w-3" /> Governance mode
              </div>
            </div>

            {pairs.map(([c, g], i) => (
              <Fragment key={c}>
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="bg-card px-5 py-6"
                >
                  <p className="font-display text-2xl text-ink">{c}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-graphite">
                    <span>Campaign workspace</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-civic">Transforms</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.15 }}
                  className="bg-card px-5 py-6"
                >
                  <p className="font-display text-2xl text-ink">{g}</p>
                  <p className="mt-2 text-xs text-graphite">Continuity preserved · same data, new lens</p>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Closing                                                                   */
/* -------------------------------------------------------------------------- */

function ClosingSection() {
  return (
    <section id="closing" className="relative overflow-hidden border-t border-hairline py-32 md:py-48">
      <NetworkBackdrop />
      <div className="container-pulse relative">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow index="09">A final word</Eyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="mt-8 font-display text-5xl leading-[1.02] text-balance text-ink md:text-7xl"
          >
            Lead with <span className="italic text-navy">clarity</span>.
          </motion.h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-graphite">
            See Pulse in motion. A private demonstration walks your team through the full
            lifecycle — planning, operations, election day and governance.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5" href="#demo-request">
              Request private demonstration
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a className="inline-flex items-center gap-2 rounded-full border border-hairline bg-background/60 px-6 py-3 text-sm text-ink backdrop-blur transition-colors hover:bg-card" href="mailto:hello@pulse.app">
              Talk to the Pulse team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo Request                                                              */
/* -------------------------------------------------------------------------- */

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
  "aol.com", "proton.me", "protonmail.com", "live.com", "msn.com",
]);

const demoSchema = z.object({
  name: z.string().trim().min(2, "Please share your full name").max(80),
  email: z
    .string()
    .trim()
    .max(120)
    .email("Enter a valid work email")
    .refine(
      (e) => !FREE_EMAIL_DOMAINS.has(e.split("@")[1]?.toLowerCase() ?? ""),
      "Please use your work email address",
    ),
  organization: z.string().trim().min(2, "Organization is required").max(120),
  role: z.string().min(1, "Select your role"),
  timeline: z.string().min(1, "Select a timeline"),
});

type DemoForm = z.infer<typeof demoSchema>;
type DemoErrors = Partial<Record<keyof DemoForm, string>>;

const ROLES = [
  "Campaign Manager",
  "Chief of Staff",
  "Field Director",
  "Communications Lead",
  "Data & Analytics",
  "Candidate / Principal",
  "Party / Coalition Leadership",
  "Other",
];

const TIMELINES = [
  "Within 2 weeks",
  "This quarter",
  "Next 3–6 months",
  "Exploring for a future cycle",
];

function DemoRequestSection() {
  const [form, setForm] = useState<DemoForm>({
    name: "", email: "", organization: "", role: "", timeline: "",
  });
  const [errors, setErrors] = useState<DemoErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function update<K extends keyof DemoForm>(key: K, value: DemoForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = demoSchema.safeParse(form);
    if (!parsed.success) {
      const next: DemoErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof DemoForm;
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  }

  return (
    <section
      id="demo-request"
      className="relative scroll-mt-24 border-t border-hairline bg-gradient-to-b from-background to-secondary/40 py-24 md:py-36"
    >
      <div className="container-pulse">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* Left: pitch */}
          <div className="flex flex-col gap-8">
            <Eyebrow index="10">Private demonstration</Eyebrow>
            <h2 className="font-display text-4xl leading-[1.05] text-balance text-ink sm:text-5xl md:text-6xl">
              A guided walkthrough,<br className="hidden sm:block" />{" "}
              <span className="italic text-navy">tailored to your campaign</span>.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-graphite sm:text-lg">
              Tell us a little about your work. A member of the Pulse team will reach out
              within one business day to schedule a 45-minute private session — no slides,
              just the product in motion.
            </p>
            <ul className="grid gap-3 text-sm text-ink">
              {[
                "End-to-end walkthrough across planning, ops & governance",
                "Tailored to your jurisdiction and team size",
                "Discussion of data residency, security and rollout",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-civic/15 text-civic">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs text-graphite">
              <ShieldCheck className="h-4 w-4 text-civic" />
              Your details stay private. We never share or sell campaign data.
            </div>
          </div>

          {/* Right: form */}
          <div className="relative">
            <div className="rounded-3xl border border-hairline bg-card p-6 shadow-[0_30px_80px_-40px_rgba(20,30,60,0.25)] sm:p-8 md:p-10">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-5 py-10 text-center"
                  >
                    <div className="relative grid h-14 w-14 place-items-center rounded-full bg-civic/15 text-civic">
                      <span className="absolute inset-0 rounded-full bg-civic/25 animate-pulse-ring" />
                      <Check className="relative h-6 w-6" />
                    </div>
                    <h3 className="font-display text-3xl text-ink">Request received</h3>
                    <p className="max-w-sm text-sm text-graphite">
                      Thank you, {form.name.split(" ")[0]}. A member of the Pulse team will reach
                      out to <span className="text-ink">{form.email}</span> within one business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ name: "", email: "", organization: "", role: "", timeline: "" });
                        setStatus("idle");
                      }}
                      className="text-xs uppercase tracking-[0.2em] text-graphite hover:text-ink"
                    >
                      Submit another request
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={onSubmit}
                    noValidate
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-graphite">
                        Request a demonstration
                      </span>
                      <span className="hidden text-[11px] text-graphite sm:inline">
                        ~ 60 seconds
                      </span>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <DemoField label="Full name" error={errors.name} htmlFor="demo-name">
                        <Input
                          id="demo-name"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Alex Rivera"
                          maxLength={80}
                          aria-invalid={!!errors.name}
                        />
                      </DemoField>
                      <DemoField label="Work email" error={errors.email} htmlFor="demo-email">
                        <Input
                          id="demo-email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="alex@campaign.org"
                          maxLength={120}
                          aria-invalid={!!errors.email}
                        />
                      </DemoField>
                    </div>

                    <DemoField label="Organization" error={errors.organization} htmlFor="demo-org">
                      <Input
                        id="demo-org"
                        autoComplete="organization"
                        value={form.organization}
                        onChange={(e) => update("organization", e.target.value)}
                        placeholder="Campaign, party or coalition"
                        maxLength={120}
                        aria-invalid={!!errors.organization}
                      />
                    </DemoField>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <DemoField label="Your role" error={errors.role} htmlFor="demo-role">
                        <Select
                          value={form.role}
                          onValueChange={(v) => update("role", v)}
                        >
                          <SelectTrigger id="demo-role" aria-invalid={!!errors.role} className="h-9 w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DemoField>
                      <DemoField label="Preferred timeline" error={errors.timeline} htmlFor="demo-timeline">
                        <Select
                          value={form.timeline}
                          onValueChange={(v) => update("timeline", v)}
                        >
                          <SelectTrigger id="demo-timeline" aria-invalid={!!errors.timeline} className="h-9 w-full">
                            <SelectValue placeholder="When are you exploring?" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMELINES.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DemoField>
                    </div>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="group mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:h-11"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending request
                        </>
                      ) : (
                        <>
                          Request private demonstration
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </>
                      )}
                    </button>

                    <p className="text-[11px] leading-relaxed text-graphite">
                      By submitting, you agree that Pulse may contact you about the
                      demonstration. We do not share your information with third parties.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-[11px] uppercase tracking-[0.18em] text-graphite">
        {label}
      </Label>
      {children}
      {error && (
        <span role="alert" className="text-[11px] font-medium text-destructive">{error}</span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */


function Footer() {
  return (
    <footer className="border-t border-hairline py-10">
      <div className="container-pulse flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <PulseMark />
        <div className="flex flex-wrap items-center gap-6 text-xs text-graphite">
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-civic" /> Secure</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-civic" /> Compliant</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-civic" /> Transparent</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-civic" /> Data you own</span>
        </div>
        <p className="text-xs text-graphite">© {new Date().getFullYear()} Pulse · Phase One</p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function PulseLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main id="main-content">
        <Hero />
        <ProblemSection />
        <ConceptSection />
        <WalkthroughSection />
        <MissionControlSection />
        <EcosystemSection />
        <InteractiveFeatures />
        <IntelligenceSection />
        <GovernanceSection />
        <ClosingSection />
        <DemoRequestSection />
      </main>
      <Footer />
    </div>
  );
}
