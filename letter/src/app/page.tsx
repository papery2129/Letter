"use client";

import { useCallback, useEffect, useState } from "react";
import { restoreSession } from "@/app/actions/unlock";
import AccessForm from "@/components/AccessForm";
import AudioGate from "@/components/AudioGate";
import LetterView from "@/components/LetterView";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { BACKGROUND_AUDIO_SRC } from "@/lib/audio";

export default function Home() {
  const [letter, setLetter] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { audioRef, isBlocked, prime, start, abort, resume } =
    useBackgroundAudio();

  const handleUnlock = useCallback(
    (content: string) => {
      setLetter(content);
      start();
    },
    [start],
  );

  // Al recargar, el servidor valida la cookie de sesión y devuelve la carta.
  // Sin gesto previo, el navegador puede bloquear el audio: se muestra AudioGate.
  useEffect(() => {
    let cancelled = false;

    restoreSession()
      .then((result) => {
        if (!cancelled && result.success && result.letter) {
          setLetter(result.letter);
          start();
        }
      })
      .catch(() => {
        // Sin sesión válida: se muestra el formulario.
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [start]);

  return (
    <main className="relative w-full flex-1 overflow-x-hidden">
      {/* Único elemento de audio: persiste entre AccessForm y LetterView. */}
      <audio ref={audioRef} src={BACKGROUND_AUDIO_SRC} loop preload="auto" />

      {isChecking ? null : letter === null ? (
        <AccessForm
          onUnlock={handleUnlock}
          onAttempt={prime}
          onReject={abort}
        />
      ) : (
        <LetterView content={letter} />
      )}

      {isBlocked && letter !== null ? <AudioGate onContinue={resume} /> : null}
    </main>
  );
}
