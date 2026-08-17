/** Security Kernel — encryption, policy, rate limits, audit. */
import type { KernelMeta, RuntimeContext } from "../types";

export interface EncryptionService {
  encrypt(plaintext: string, keyId?: string): Promise<string>;
  decrypt(ciphertext: string, keyId?: string): Promise<string>;
  hash(value: string): Promise<string>;
}
export interface SecretsService {
  get(name: string): Promise<string | null>;
  require(name: string): Promise<string>;
}
export interface PolicyEngine {
  evaluate(ctx: RuntimeContext, action: string, resource: string): Promise<boolean>;
}
export interface RateLimiter {
  consume(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }>;
}
export interface AuditLogger {
  record(entry: {
    action: string;
    entityType: string;
    entityId: string;
    actorId: string | null;
    organizationId: string | null;
    diff?: Record<string, unknown>;
  }): Promise<void>;
}
export interface SecurityKernelApi {
  encryption: EncryptionService;
  secrets: SecretsService;
  policies: PolicyEngine;
  rateLimiter: RateLimiter;
  audit: AuditLogger;
}
export const securityKernelMeta: KernelMeta = {
  id: "security",
  name: "Security Kernel",
  purpose: "Platform-wide encryption, secrets, policy enforcement, rate limiting and audit.",
  dependencies: [],
  publishes: ["security.policy_denied", "security.rate_limited"],
  consumes: [],
  extensionPoints: ["policy.provider", "secrets.provider", "threat.detector"],
};
