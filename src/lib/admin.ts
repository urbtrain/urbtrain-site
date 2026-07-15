import { configured, serverSupabase } from "@/lib/supabase-server";

export type AdminAccess =
  | { state: "unconfigured" }
  | { state: "anonymous" }
  | { state: "forbidden" }
  | { state: "admin"; userId: string; email: string | null };

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!configured) return { state: "unconfigured" };
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { state: "anonymous" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { state: "forbidden" };
  return { state: "admin", userId: user.id, email: user.email ?? null };
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access.state !== "admin") throw new Error("Ação restrita a administradores.");
  return { access, supabase: await serverSupabase() };
}
