/** Identity Kernel — authentication, sessions, membership, permissions. */
import type { KernelMeta } from "../types";

export interface IdentityProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}
export interface SessionInfo {
  userId: string;
  organizationId: string | null;
  workspaceId: string | null;
  roles: string[];
  expiresAt: string;
}
export interface IdentityService {
  currentUser(): Promise<IdentityProfile | null>;
  signInWithPassword(email: string, password: string): Promise<SessionInfo>;
  signInWithProvider(provider: "google" | "microsoft" | "saml"): Promise<{ redirectUrl: string }>;
  signOut(): Promise<void>;
}
export interface SessionManager {
  get(): Promise<SessionInfo | null>;
  refresh(): Promise<SessionInfo | null>;
  revoke(userId: string): Promise<void>;
}
export interface PermissionEngine {
  can(userId: string, permission: string, scope?: { organizationId?: string; missionId?: string }): Promise<boolean>;
  listPermissions(userId: string, organizationId: string): Promise<string[]>;
}
export interface RoleRegistry {
  roles(): string[];
  permissionsFor(role: string): string[];
}
export interface OrganizationResolver {
  membershipsFor(userId: string): Promise<{ organizationId: string; role: string }[]>;
  switchWorkspace(userId: string, workspaceId: string): Promise<SessionInfo>;
}
export interface IdentityKernelApi {
  identity: IdentityService;
  sessions: SessionManager;
  permissions: PermissionEngine;
  roles: RoleRegistry;
  organizations: OrganizationResolver;
}
export const identityKernelMeta: KernelMeta = {
  id: "identity",
  name: "Identity Kernel",
  purpose: "Authentication, sessions, RBAC/ABAC, org membership and workspace switching.",
  dependencies: ["security", "data"],
  publishes: ["identity.user_authenticated", "identity.user_signed_out", "identity.role_changed", "identity.workspace_changed"],
  consumes: ["mission.organization_created"],
  extensionPoints: ["auth.provider", "mfa.provider", "sso.provider"],
};
