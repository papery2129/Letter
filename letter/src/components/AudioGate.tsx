"use client";

import { FingerprintIcon } from "@/components/icons";

interface AudioGateProps {
  onContinue: () => void;
}

export default function AudioGate({ onContinue }: AudioGateProps) {
  return (
    <button
      type="button"
      onClick={onContinue}
      aria-label="Toca para continuar"
      className="fixed inset-0 z-50 flex animate-fade-in cursor-pointer flex-col items-center justify-center gap-space-lg bg-surface/85 p-margin text-center backdrop-blur-md focus:outline-none"
    >
      <span className="flex size-16 items-center justify-center rounded-full border border-outline/30 bg-surface-container text-outline motion-safe:animate-rim-light">
        <FingerprintIcon className="size-7" />
      </span>
      <span className="flex flex-col gap-space-xs">
        <span className="text-headline-sm text-on-surface">
          Toca para continuar
        </span>
        <span className="text-body-md text-on-surface-variant">
          La carta suena mejor con música.
        </span>
      </span>
      <span className="text-label-sm tracking-[0.25em] text-on-surface-variant uppercase select-none">
        Sic
        <span className="px-0.5 text-outline [text-shadow:0_0_6px_rgba(27,154,170,0.6)]">✦</span>
        Parvis
        <span className="px-0.5 text-outline [text-shadow:0_0_6px_rgba(27,154,170,0.6)]">✦</span>
        Magna
      </span>
    </button>
  );
}
