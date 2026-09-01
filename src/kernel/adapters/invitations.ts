/**
 * Invitation service — provider-agnostic, built on the Data Kernel repository
 * contract so it behaves identically on in-memory and SQL providers.
 *
 * Tokens are generated here and never accepted from a caller; the kernel is the
 * only issuer.
 */
import type { Invitation } from "@/packages/validators";
import type { DataKernelApi } from "../contracts/data";
import type { EventKernelApi } from "../contracts/event";
import type { InvitationService } from "../contracts/identity";

function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createInvitationService(deps: { data: DataKernelApi; events?: EventKernelApi }): InvitationService {
  const repo = deps.data.repository<Invitation>("invitations");

  return {
    async issue({ organizationId, workspaceId, email, role, invitedBy = null, ttlDays = 14 }) {
      const now = new Date();
      const invitation = await repo.create({
        organizationId,
        workspaceId,
        email: email.toLowerCase(),
        role,
        status: "pending",
        token: newToken(),
        expiresAt: new Date(now.getTime() + ttlDays * 86_400_000).toISOString(),
        acceptedAt: null,
        invitedBy,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: invitedBy,
        updatedBy: invitedBy,
      } as Partial<Invitation>);
      await deps.events?.bus.publish("identity.invitation_issued", {
        invitationId: invitation.id,
        organizationId,
        email: invitation.email,
        role,
      });
      return invitation;
    },
    async list(organizationId) {
      return (await repo.list({ filter: { organizationId }, limit: 200 })).data;
    },
    async accept(token) {
      const { data } = await repo.list({ filter: { token }, limit: 1 });
      const invitation = data[0];
      if (!invitation) throw new Error("invitation not found");
      if (invitation.status !== "pending") throw new Error(`invitation is ${invitation.status}`);
      if (Date.parse(invitation.expiresAt) < Date.now()) {
        return repo.update(invitation.id, { status: "expired" } as Partial<Invitation>);
      }
      const accepted = await repo.update(invitation.id, {
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      } as Partial<Invitation>);
      await deps.events?.bus.publish("identity.invitation_accepted", {
        invitationId: accepted.id,
        organizationId: accepted.organizationId,
        email: accepted.email,
      });
      return accepted;
    },
    async revoke(id) {
      return repo.update(id, { status: "revoked" } as Partial<Invitation>);
    },
  };
}

/** Invitations carry a secret token; strip it before anything leaves the server. */
export function redactInvitation(invitation: Invitation): Omit<Invitation, "token"> {
  const { token: _token, ...rest } = invitation;
  return rest;
}
