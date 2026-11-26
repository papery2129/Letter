"use client";

import { useEffect, useState } from "react";
import { restoreSession } from "@/app/actions/unlock";
import AccessForm from "@/components/AccessForm";
import LetterView from "@/components/LetterView";

export default function Home() {
  const [letter, setLetter] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Al recargar, el servidor valida la cookie de sesión y devuelve la carta.
  useEffect(() => {
    let cancelled = false;

    restoreSession()
      .then((result) => {
        if (!cancelled && result.success && result.letter) {
          setLetter(result.letter);
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
  }, []);

  return (
    <main className="relative w-full flex-1 overflow-x-hidden">
      {isChecking ? null : letter === null ? (
        <AccessForm onUnlock={setLetter} />
      ) : (
        <LetterView content={letter} />
      )}
    </main>
  );
}
