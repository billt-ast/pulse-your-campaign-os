/**
 * Admin Console server functions — platform admins only.
 * Tenancy writes go through the kernel; account creation uses the auth admin API.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MissionKernelApi } from "@/kernel/contracts/mission";
import type { DataKernelApi } from "@/kernel/contracts/data";
import type { ContextKernelApi } from "@/kernel/contracts/context";
import type { Organization, Workspace } from "@/packages/validators";
import { email, nonEmptyString, uuid } from "@/packages/validators";
import { callerIsAdmin, slugify } from "./mission-control.functions";

interface Membership { id: string; organizationId: string; userId: string; role: string; createdAt: string }

export const MEMBER_ROLES = ["owner", "admin", "member", "viewer"] as const;

async function adminKernel(supabase: unknown, userId: string) {
  if (!(await callerIsAdmin(supabase as never, userId))) throw new Error("Forbidden: platform admin only");
  const { platformKernel } = await import("@/kernel/kernel.server");
  const kernel = await platformKernel();
  kernel.get<ContextKernelApi>("context").set({ userId, now: new Date().toISOString() });
  return {
    missions: kernel.get<MissionKernelApi>("mission"),
    data: kernel.get<DataKernelApi>("data"),
  };
}

export interface AdminUser { id: string; email: string; createdAt: string; isAdmin: boolean }
export interface AdminOrg {
  organization: Organization;
  workspaces: Workspace[];
  members: { id: string; userId: string; email: string; role: string }[];
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context: auth }): Promise<{ users: AdminUser[]; organizations: AdminOrg[] }> => {
    const { missions, data } = await adminKernel(auth.supabase, auth.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    const admins = new Set((roles ?? []).map((r) => r.user_id));
    const users: AdminUser[] = list.users.map((u) => ({
      id: u.id,
      email: u.email ?? "(no email)",
      createdAt: u.created_at,
      isAdmin: admins.has(u.id),
    }));
    const emailOf = new Map(users.map((u) => [u.id, u.email]));

    const memberRepo = data.repository<Membership>("organizationMembers");
    const orgs = await missions.organizations.list();
    const organizations: AdminOrg[] = [];
    for (const organization of orgs) {
      const workspaces = await missions.workspaces.listByOrganization(organization.id);
      const members = (await memberRepo.list({ filter: { organizationId: organization.id }, limit: 500 })).data;
      organizations.push({
        organization,
        workspaces,
        members: members.map((m) => ({ id: m.id, userId: m.userId, email: emailOf.get(m.userId) ?? m.userId, role: m.role })),
      });
    }
    return { users, organizations };
  });

export const adminCreateOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      name: nonEmptyString.max(160),
      kind: z.enum(["party", "committee", "ngo", "government", "agency", "other"]).default("other"),
    }).parse(i),
  )
  .handler(async ({ data: input, context: auth }) => {
    const { missions } = await adminKernel(auth.supabase, auth.userId);
    return missions.organizations.create({
      name: input.name,
      kind: input.kind,
      slug: `${slugify(input.name)}-${Date.now().toString(36)}`,
    });
  });

export const adminCreateWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ organizationId: uuid, name: nonEmptyString.max(160) }).parse(i))
  .handler(async ({ data: input, context: auth }) => {
    const { data } = await adminKernel(auth.supabase, auth.userId);
    const now = new Date().toISOString();
    return data.repository<Workspace>("workspaces").create({
      organizationId: input.organizationId,
      name: input.name,
      slug: `${slugify(input.name)}-${Date.now().toString(36)}`,
      createdAt: now,
      updatedAt: now,
      createdBy: auth.userId,
      updatedBy: auth.userId,
    } as Partial<Workspace>);
  });

const memberRole = z.enum(MEMBER_ROLES);

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      email,
      password: z.string().min(8).max(72),
      organizationId: uuid.nullable().default(null),
      role: memberRole.default("member"),
    }).parse(i),
  )
  .handler(async ({ data: input, context: auth }) => {
    const { data } = await adminKernel(auth.supabase, auth.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create user");
    if (input.organizationId) {
      await data.repository<Membership>("organizationMembers").create({
        organizationId: input.organizationId,
        userId: created.user.id,
        role: input.role,
      } as Partial<Membership>);
    }
    return { id: created.user.id, email: created.user.email };
  });

export const adminAddMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ organizationId: uuid, userId: uuid, role: memberRole }).parse(i))
  .handler(async ({ data: input, context: auth }) => {
    const { data } = await adminKernel(auth.supabase, auth.userId);
    const repo = data.repository<Membership>("organizationMembers");
    const existing = (await repo.list({ filter: { organizationId: input.organizationId, userId: input.userId }, limit: 1 })).data[0];
    if (existing) return repo.update(existing.id, { role: input.role } as Partial<Membership>);
    return repo.create(input as Partial<Membership>);
  });

export const adminRemoveMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ membershipId: uuid }).parse(i))
  .handler(async ({ data: input, context: auth }) => {
    const { data } = await adminKernel(auth.supabase, auth.userId);
    await data.repository<Membership>("organizationMembers").remove(input.membershipId);
    return { ok: true };
  });
