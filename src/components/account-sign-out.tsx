"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { browserSupabase, configured } from "@/lib/supabase-browser";

export function AccountSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!configured) return;

    const supabase = browserSupabase();
    void supabase.auth.getUser().then(({ data: { user } }) => setSignedIn(Boolean(user)));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setLoading(true);
    await browserSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!signedIn) return null;

  return (
    <button className="button account-signout" type="button" onClick={signOut} disabled={loading}>
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
