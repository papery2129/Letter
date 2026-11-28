"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { TARGET_VOLUME } from "@/lib/audio";

export interface BackgroundAudio {
  audioRef: RefObject<HTMLAudioElement | null>;
  /** El navegador exige un gesto del usuario para reproducir. */
  isBlocked: boolean;
  /** Llamar de forma síncrona dentro del clic, antes de cualquier await. */
  prime: () => void;
  /** Acceso concedido (o sesión restaurada): la música debe sonar. */
  start: () => void;
  /** Acceso rechazado: silencia y reinicia lo que `prime` hubiera arrancado. */
  abort: () => void;
  /** Toque del usuario sobre la capa de bloqueo. */
  resume: () => void;
}

export function useBackgroundAudio(): BackgroundAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // `true` mientras la carta está abierta y la música debe sonar siempre.
  const activeRef = useRef(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsBlocked(false);
    } catch (error) {
      // Solo un bloqueo por falta de gesto muestra la capa; otros errores
      // (p. ej. archivo ausente) no deben dejar la carta inaccesible.
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setIsBlocked(true);
      }
    }
  }, []);

  const prime = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    audio.play().catch(() => {
      // Solo desbloquea el elemento dentro del gesto; sin sonido.
    });
  }, []);

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    activeRef.current = true;
    audio.currentTime = 0;
    audio.volume = TARGET_VOLUME;
    audio.muted = false;
    void play();
  }, [play]);

  const abort = useCallback(() => {
    const audio = audioRef.current;
    activeRef.current = false;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = TARGET_VOLUME;
    audio.muted = false;
    void play();
  }, [play]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Sin pausa posible: cualquier pausa externa se revierte.
    const handlePause = () => {
      if (activeRef.current && !audio.ended) void play();
    };
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        activeRef.current &&
        audio.paused
      ) {
        void play();
      }
    };

    audio.addEventListener("pause", handlePause);
    document.addEventListener("visibilitychange", handleVisibility);

    // Teclas multimedia y controles del sistema: no pausan.
    const session = "mediaSession" in navigator ? navigator.mediaSession : null;
    try {
      if (session) {
        session.metadata = new MediaMetadata({ title: "Una carta para ti" });
        session.setActionHandler("pause", () => void play());
        session.setActionHandler("stop", () => void play());
      }
    } catch {
      // Soporte parcial de Media Session según el navegador.
    }

    return () => {
      audio.removeEventListener("pause", handlePause);
      document.removeEventListener("visibilitychange", handleVisibility);
      try {
        session?.setActionHandler("pause", null);
        session?.setActionHandler("stop", null);
      } catch {
        // Nada que limpiar.
      }
    };
  }, [play]);

  return { audioRef, isBlocked, prime, start, abort, resume };
}
