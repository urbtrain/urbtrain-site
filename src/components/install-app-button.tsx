"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      setMessage(choice.outcome === "accepted" ? "Aplicativo instalado." : "");
      return;
    }

    const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setMessage(
      isAppleMobile
        ? "No iPhone, toque em Compartilhar e escolha Adicionar a Tela de Inicio."
        : "Use o menu do navegador e escolha Instalar aplicativo."
    );
  }

  return (
    <div className="install-app-wrap">
      <button className="button alt install-app-button" type="button" onClick={install}>
        Nosso aplicativo
      </button>
      {message && <p className="install-app-message" role="status">{message}</p>}
    </div>
  );
}
