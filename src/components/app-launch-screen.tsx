"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function AppLaunchScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return <div className="app-launch-screen" role="presentation" aria-hidden="true"><Image src="/Splash-Mobile.png" alt="" fill priority sizes="100vw"/></div>;
}