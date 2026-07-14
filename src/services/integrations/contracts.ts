/**
 * integrations contracts — external provider connections.
 */
import { z } from "zod";
import { uuid, nonEmptyString, isoTimestamp } from "@/packages/validators";

export const integrationConnection = z.object({
  id: uuid,
  organizationId: uuid,
  provider: nonEmptyString.max(80),
  status: z.enum(["connected", "disconnected", "error"]),
  connectedAt: isoTimestamp.nullable(),
});
export type IntegrationConnection = z.infer<typeof integrationConnection>;

export const connectIntegrationRequest = z.object({
  organizationId: uuid,
  provider: nonEmptyString.max(80),
  config: z.record(z.string(), z.unknown()).default({}),
});
export const listIntegrationsRequest = z.object({ organizationId: uuid });
export const listIntegrationsResponse = z.object({ connections: z.array(integrationConnection) });
