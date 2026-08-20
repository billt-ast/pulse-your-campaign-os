/**
 * @pulse/security — adapter home for the Security Kernel ports.
 *
 * Placeholder interfaces only; real KMS-backed encryption, secret providers and
 * distributed rate limiting land in 2B.1.4.
 */
import type { AuditEntry, PolicyRule, RateLimitResult } from "@/services/security";

export interface EncryptionAdapter {
  readonly provider: "base64_dev" | "webcrypto_aes_gcm" | "kms";
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
  hash(value: string): Promise<string>;
}

export interface SecretsAdapter {
  readonly provider: "env" | "vault";
  get(name: string): Promise<string | null>;
  require(name: string): Promise<string>;
}

export interface PolicyAdapter {
  rules(organizationId: string | null): Promise<PolicyRule[]>;
  evaluate(input: { action: string; resource?: string; permissions: string[] }): Promise<boolean>;
}

export interface RateLimiterAdapter {
  readonly provider: "memory" | "redis" | "durable_object";
  consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

export interface AuditSinkAdapter {
  record(entry: Omit<AuditEntry, "id">): Promise<void>;
}

/** Constant-time string compare for signatures and tokens. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const encryptionAdapters: Partial<Record<EncryptionAdapter["provider"], () => EncryptionAdapter>> = {};
