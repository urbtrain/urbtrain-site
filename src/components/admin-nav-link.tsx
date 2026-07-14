"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserSupabase, configured } from "@/lib/supabase-browser";

export function AdminNavLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!configured) return;

      const supabase = browserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

      if (active) setIsAdmin(profile?.role === "admin");
    }

    void loadRole();

    return () => {
      active = false;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <Link className="admin-nav-link" href="/admin">
      Painel
    </Link>
  );
}
