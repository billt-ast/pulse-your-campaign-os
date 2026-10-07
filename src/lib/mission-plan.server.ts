/** Server-only: generate a structured mission plan through Lovable AI Gateway. */
import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

const MODEL = "openai/gpt-6-astra";
const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export const missionPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  objectives: z.array(z.object({ name: z.string(), metric: z.string(), target: z.string() })),
  phases: z.array(
    z.object({
      name: z.string(),
      duration: z.string(),
      goals: z.array(z.string()),
      tasks: z.array(z.object({ title: z.string(), owner: z.string(), priority: z.enum(["low", "normal", "high", "critical"]) })),
    }),
  ),
  risks: z.array(z.object({ risk: z.string(), mitigation: z.string() })),
  kpis: z.array(z.string()),
});
export type MissionPlan = z.infer<typeof missionPlanSchema>;

export class AiGatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function generateMissionPlan(brief: string, context: { missionType: string; organization: string | null }): Promise<MissionPlan> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiGatewayError(401, "AI is not configured for this project.");

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID_HEADER, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID_HEADER) ?? undefined;
      if (!res.ok) {
        const body = await res.clone().json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
        throw new AiGatewayError(res.status, body?.message ?? body?.error?.message ?? `AI request failed (${res.status})`);
      }
      return res;
    },
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions:
      "You are Pulse, a senior campaign strategist. Turn the campaign leader's brief into an actionable mission plan. " +
      "Produce 3-5 objectives with measurable metrics, 3-5 sequential phases each with 2-4 goals and 3-6 concrete tasks (owner = a role, not a name), " +
      "3-5 risks with mitigations, and 4-6 KPIs. Be specific to the brief; keep each string under 200 characters.",
    messages: [
      {
        role: "user",
        content: `Mission type: ${context.missionType}\nOrganization: ${context.organization ?? "unspecified"}\n\nBrief:\n${brief}`,
      },
    ],
    output: Output.object({ schema: missionPlanSchema }),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    return await result.output;
  } catch (error) {
    if (error instanceof AiGatewayError) throw error;
    if (NoObjectGeneratedError.isInstance(error)) {
      const parsed = missionPlanSchema.safeParse(JSON.parse(error.text ?? "null"));
      if (parsed.success) return parsed.data;
      throw new AiGatewayError(502, "The AI returned an incomplete plan. Please try again.");
    }
    const cause = (error as { cause?: unknown })?.cause;
    if (cause instanceof AiGatewayError) throw cause;
    throw error;
  }
}
