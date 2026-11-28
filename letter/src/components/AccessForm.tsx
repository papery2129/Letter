"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { verifyAccess } from "@/app/actions/unlock";
import EmberField from "@/components/EmberField";
import {
  ArrowForwardIcon,
  BackspaceIcon,
  FingerprintIcon,
  SpinnerIcon,
} from "@/components/icons";

interface AccessFormProps {
  onUnlock: (content: string) => void;
  /** Se llama de forma síncrona dentro del clic (gesto del usuario). */
  onAttempt?: () => void;
  onReject?: () => void;
}

const FALLBACK_ERROR = "No pudimos abrir la carta. Inténtalo de nuevo.";

export default function AccessForm({
  onUnlock,
  onAttempt,
  onReject,
}: AccessFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    onAttempt?.();

    startTransition(async () => {
      try {
        const result = await verifyAccess(name);
        if (result.success && result.letter) {
          onUnlock(result.letter);
        } else {
          onReject?.();
          setError(result.error ?? FALLBACK_ERROR);
        }
      } catch {
        onReject?.();
        setError(FALLBACK_ERROR);
      }
    });
  };

  const handleClear = () => {
    setName("");
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Fondo atmosférico */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_40%,rgba(163,22,33,0.12),transparent_70%)]"
      />
      <EmberField />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-space-md">
        <div className="relative flex w-full flex-col items-center justify-center p-gutter">
          {/* Halo ambiental */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-secondary/15 via-primary/5 to-transparent blur-3xl"
          />

          <div className="relative w-full max-w-[540px] overflow-hidden rounded-xl border border-outline/25 bg-surface-container p-space-lg shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(163,22,33,0.08)] motion-safe:animate-rim-light md:p-space-xl">
            <div className="mb-space-xl space-y-1 text-center">
              <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-on-surface">
                Buenas noches
              </h1>
              <p className="text-[15px] leading-normal font-normal text-on-surface-variant">
                Identifícate, por favor.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-space-lg">
              <div className="space-y-space-xs">
                <label
                  htmlFor="agent-id"
                  className="flex items-center gap-1.5 text-label-md font-medium tracking-wide text-on-surface-variant"
                >
                  Nombre/apodo
                </label>
                <div className="group/field relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-space-md text-outline transition-colors duration-200 group-focus-within/field:text-secondary">
                    <FingerprintIcon className="size-5" />
                  </div>
                  <input
                    ref={inputRef}
                    id="agent-id"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tu nombre/apodo"
                    maxLength={100}
                    autoComplete="off"
                    spellCheck={false}
                    required
                    disabled={isPending}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "access-error" : undefined}
                    className="w-full rounded-lg border border-outline/30 bg-surface-container-low py-3.5 pr-11 pl-11 text-body-md text-on-surface transition-all duration-200 outline-none placeholder:text-on-surface-variant/60 focus:border-secondary focus:shadow-[0_0_0_1px_#A31621,0_0_15px_rgba(163,22,33,0.35),0_0_25px_rgba(27,154,170,0.2)] disabled:opacity-80 aria-[invalid=true]:border-secondary"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-space-md">
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={isPending}
                      title="Borrar entrada"
                      aria-label="Borrar entrada"
                      className="text-on-surface-variant transition-colors hover:text-outline focus:outline-none disabled:pointer-events-none"
                    >
                      <BackspaceIcon className="size-[18px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-space-xs">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group/btn relative flex w-full cursor-pointer items-center justify-center gap-space-sm overflow-hidden rounded-lg bg-primary px-space-md py-3.5 text-label-lg font-bold text-on-primary shadow-[0_0_18px_rgba(242,100,25,0.35)] transition-all duration-300 hover:bg-[#d95510] hover:shadow-[0_0_28px_rgba(242,100,25,0.55)] active:scale-[0.99] active:bg-[#c04b0e] disabled:cursor-wait disabled:opacity-80"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full"
                  />
                  <span className="relative z-10 text-[15px] font-bold tracking-wider uppercase">
                    {isPending ? "Validando…" : "Entrar"}
                  </span>
                  {isPending ? (
                    <SpinnerIcon className="relative z-10 size-[18px] animate-spin" />
                  ) : (
                    <ArrowForwardIcon className="relative z-10 size-[18px] transition-transform group-hover/btn:translate-x-1" />
                  )}
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[11px] tracking-[0.25em] text-on-surface-variant uppercase select-none">
                  Sic
                  <span className="px-0.5 text-outline [text-shadow:0_0_6px_rgba(27,154,170,0.6)]">✦</span>
                  Parvis
                  <span className="px-0.5 text-outline [text-shadow:0_0_6px_rgba(27,154,170,0.6)]">✦</span>
                  Magna
                </p>
              </div>
            </form>

            {error && (
              <div
                id="access-error"
                role="alert"
                className="mt-space-md animate-fade-in rounded-lg border border-secondary/40 bg-secondary-container p-space-sm text-center text-label-sm text-on-secondary-container"
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
