"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { verifyAccess } from "@/app/actions/unlock";

interface AccessFormProps {
  onUnlock: (content: string) => void;
}

const FALLBACK_ERROR = "No pudimos abrir la carta. Inténtalo de nuevo.";

export default function AccessForm({ onUnlock }: AccessFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await verifyAccess(name);
        if (result.success && result.letter) {
          onUnlock(result.letter);
        } else {
          setError(result.error ?? FALLBACK_ERROR);
        }
      } catch {
        setError(FALLBACK_ERROR);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label htmlFor="name">Tu nombre o apodo</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Escribe tu nombre o apodo"
        maxLength={100}
        autoComplete="off"
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Abriendo…" : "Abrir carta"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
