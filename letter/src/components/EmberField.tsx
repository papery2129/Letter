"use client";

import type { CSSProperties } from "react";

type CSSVariables = CSSProperties & Record<`--${string}`, string | number>;

interface EmberColor {
  color: string;
  glow: string;
}

interface Ember {
  size: number;
  left: string;
  color: string;
  glow: string;
  opacity: number;
  endScale: number;
  duration: number;
  delay: number;
  sway: number;
  swayDur: number;
  swayDelay: number;
  flickerDur: number;
  flickerDelay: number;
}

const PALETTE: readonly EmberColor[] = [
  { color: "#6ad6e6", glow: "106,214,230" },
  { color: "#ffb3ae", glow: "255,179,174" },
  { color: "#f4f6f8", glow: "244,246,248" },
  { color: "#1b9aaa", glow: "27,154,170" },
  { color: "#ffb597", glow: "255,181,151" },
];

const EMBER_COUNT = 28;
const EMBER_SEED = 0x5eed;

/** PRNG determinista para mantener consistencia entre SSR e hidratación. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildEmbers(count: number, seed: number): readonly Ember[] {
  const rand = mulberry32(seed);
  const embers: Ember[] = [];

  for (let i = 0; i < count; i++) {
    const tone = PALETTE[i % PALETTE.length];
    const duration = round(14 + rand() * 8);
    // Retrasos negativos repartidos uniformemente para emitir de forma constante desde el primer frame.
    const progress = (i + rand() * 0.65) / count;
    const delay = round(-progress * duration);
    const band = ((i * 7 + rand() * 5) % count) / count;
    const left = `${round(3 + band * 94, 1)}%`;

    embers.push({
      size: round(1 + rand() * 1.5, 1),
      left,
      color: tone.color,
      glow: tone.glow,
      opacity: round(0.15 + rand() * 0.09),
      endScale: round(0.45 + rand() * 0.3),
      duration,
      delay,
      sway: round(6 + rand() * 12, 1),
      swayDur: round(3 + rand() * 3),
      swayDelay: round(-rand() * 4),
      flickerDur: round(1.5 + rand() * 2),
      flickerDelay: round(-rand() * 3),
    });
  }

  return embers;
}

const EMBERS = buildEmbers(EMBER_COUNT, EMBER_SEED);

export default function EmberField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {EMBERS.map((ember, index) => {
        const riseStyle: CSSVariables = {
          left: ember.left,
          bottom: "-10px",
          "--p-op": ember.opacity,
          "--rise-scale": ember.endScale,
          animation: `ember-rise ${ember.duration}s linear ${ember.delay}s infinite`,
        };

        const bodyStyle: CSSVariables = {
          width: `${ember.size}px`,
          height: `${ember.size}px`,
          backgroundColor: ember.color,
          boxShadow: `0 0 6px rgba(${ember.glow},0.8)`,
          "--sway": `${ember.sway}px`,
          animation: `ember-sway ${ember.swayDur}s ease-in-out ${ember.swayDelay}s infinite alternate, ember-flicker ${ember.flickerDur}s ease-in-out ${ember.flickerDelay}s infinite alternate`,
        };

        return (
          <div
            key={index}
            className="particle-item absolute"
            style={riseStyle}
          >
            <div
              className="rounded-full"
              style={bodyStyle}
            />
          </div>
        );
      })}
    </div>
  );
}
