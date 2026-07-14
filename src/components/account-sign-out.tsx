"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserSupabase } from "@/lib/supabase-browser";

export function AccountSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await browserSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="button account-signout" type="button" onClick={signOut} disabled={loading}>
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
