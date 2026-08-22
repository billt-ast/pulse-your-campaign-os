CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE (organization_id, slug)
);

CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'campaign',
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'internal',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE (organization_id, slug)
);

CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ,
  invited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE TABLE public.workflow_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  definition_key TEXT NOT NULL,
  state TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.storage_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size BIGINT NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_org ON public.workspaces(organization_id);
CREATE INDEX idx_missions_org ON public.missions(organization_id);
CREATE INDEX idx_invitations_org ON public.invitations(organization_id);
CREATE INDEX idx_workflow_instances_entity ON public.workflow_instances(entity_type, entity_id);
CREATE INDEX idx_storage_assets_bucket ON public.storage_assets(bucket, path);

GRANT SELECT ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
GRANT SELECT ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
GRANT SELECT ON public.missions TO authenticated;
GRANT ALL ON public.missions TO service_role;
GRANT ALL ON public.invitations TO service_role;
GRANT SELECT ON public.workflow_instances TO authenticated;
GRANT ALL ON public.workflow_instances TO service_role;
GRANT SELECT ON public.storage_assets TO authenticated;
GRANT ALL ON public.storage_assets TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view organizations" ON public.organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workspaces" ON public.workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view missions" ON public.missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workflow instances" ON public.workflow_instances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view storage assets" ON public.storage_assets FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER touch_organizations BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_workspaces BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_missions BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_invitations BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_workflow_instances BEFORE UPDATE ON public.workflow_instances FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_storage_assets BEFORE UPDATE ON public.storage_assets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();