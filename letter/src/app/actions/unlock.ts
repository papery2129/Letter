"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { normalizeText } from "@/lib/normalize";

export interface VerifyAccessResult {
  success: boolean;
  letter?: string;
  error?: string;
}

const GENERIC_ERROR =
  "No pudimos abrir la carta. Revisa el nombre e inténtalo de nuevo.";
const MAX_INPUT_LENGTH = 100;
const SESSION_COOKIE = "letter_session";

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

// El token es un HMAC del nombre normalizado: el nombre nunca viaja en la cookie.
function signName(normalizedName: string, secret: string): string {
  return createHmac("sha256", secret).update(normalizedName).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

async function startSession(normalizedName: string): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    console.error(
      "[verifyAccess] Falta SESSION_SECRET (mín. 16 caracteres): la sesión no se conservará al recargar.",
    );
    return;
  }

  const cookieStore = await cookies();
  // Sin maxAge/expires: cookie de sesión (se borra al cerrar el navegador).
  cookieStore.set(SESSION_COOKIE, signName(normalizedName, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
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

  await startSession(normalized);
  return { success: true, letter };
}

// Restaura la sesión al recargar: valida la cookie firmada contra la lista actual.
export async function restoreSession(): Promise<VerifyAccessResult> {
  const secret = process.env.SESSION_SECRET;
  const letter = getLetterContent();
  if (!secret || secret.length < 16 || letter === null) {
    return { success: false };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return { success: false };

  let isValid = false;
  for (const allowedName of getAllowedNames()) {
    if (safeEqualHex(token, signName(allowedName, secret))) isValid = true;
  }

  return isValid ? { success: true, letter } : { success: false };
}
