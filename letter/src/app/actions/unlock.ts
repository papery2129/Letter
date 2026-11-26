"use server";

import { normalizeText } from "@/lib/normalize";

export interface VerifyAccessResult {
  success: boolean;
  letter?: string;
  error?: string;
}

const GENERIC_ERROR =
  "No pudimos abrir la carta. Revisa el nombre e inténtalo de nuevo.";
const MAX_INPUT_LENGTH = 100;

function getAllowedNames(): Set<string> {
  const raw = process.env.ALLOWED_NAMES ?? "";
  return new Set(
    raw
      .split(",")
      .map(normalizeText)
      .filter((name) => name.length > 0),
  );
}

function getLetterContent(): string | null {
  const raw = process.env.LETTER_CONTENT;
  if (!raw || raw.trim().length === 0) return null;
  // Soporta "\n" literales (p. ej. paneles de hosting sin multilínea).
  return raw.replace(/\\n/g, "\n");
}

export async function verifyAccess(name: unknown): Promise<VerifyAccessResult> {
  // Una Server Action es un endpoint público: no confiar en el tipo del input.
  if (typeof name !== "string" || name.length > MAX_INPUT_LENGTH) {
    return { success: false, error: GENERIC_ERROR };
  }

  const normalized = normalizeText(name);
  const allowedNames = getAllowedNames();
  const letter = getLetterContent();

  if (allowedNames.size === 0 || letter === null) {
    console.error(
      "[verifyAccess] Faltan ALLOWED_NAMES o LETTER_CONTENT en el entorno.",
    );
    return { success: false, error: GENERIC_ERROR };
  }

  if (normalized.length === 0 || !allowedNames.has(normalized)) {
    return { success: false, error: GENERIC_ERROR };
  }

  return { success: true, letter };
}
