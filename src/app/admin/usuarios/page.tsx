import { AdminGate, AdminLayout } from "@/components/admin-layout";
import { getAdminAccess } from "@/lib/admin";
import { serverSupabase } from "@/lib/supabase-server";
import { updateMember } from "../actions";

export default async function UsersPage() {
  const access = await getAdminAccess(); if (access.state !== "admin") return <AdminGate access={access} />; const supabase = await serverSupabase();
  const { data: members } = await supabase.from("profiles").select("id,full_name,email,whatsapp,role,created_at").order("created_at", { ascending: false });
  return <AdminLayout active="/admin/usuarios" title="Usuários"><section className="admin-section"><div className="admin-section-head"><div><p className="eyebrow dark">Comunidade</p><h2>Membros e acessos</h2></div><span>{members?.length ?? 0} cadastrados</span></div><div className="admin-records">{(members ?? []).map((member) => <form className="admin-record" action={updateMember} key={member.id}><input type="hidden" name="id" value={member.id}/><div><strong>{member.full_name || "Sem nome"}</strong><span>{member.email || "Sem e-mail"}</span></div><label>Nome<input name="full_name" defaultValue={member.full_name || ""}/></label><label>WhatsApp<input name="whatsapp" defaultValue={member.whatsapp || ""}/></label><label>Papel<select name="role" defaultValue={member.role} disabled={member.id === access.userId}><option value="customer">Membro</option><option value="admin">Admin</option></select></label><button className="button" disabled={member.id === access.userId}>Salvar</button></form>)}</div></section></AdminLayout>;
}