"use server";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { normalizeText } from "@/lib/normalize";

export interface VerifyAccessResult {
  success: boolean;
  letter?: string;
  secondLetter?: string;
  error?: string;
}

const GENERIC_ERROR =
  "No pudimos abrir la carta. Revisa el nombre e inténtalo de nuevo.";
const MAX_INPUT_LENGTH = 100;
const SESSION_COOKIE = "letter_session";
const FALLBACK_SESSION_SALT = "letter-private-session-v1";

function getSigningKey(): string {
  // Deriva una clave estable en el servidor a partir de las variables privadas ya configuradas.
  return createHash("sha256")
    .update(FALLBACK_SESSION_SALT)
    .update("\0")
    .update(process.env.ALLOWED_NAMES ?? "")
    .update("\0")
    .update(process.env.SPECIAL_NAMES ?? "")
    .update("\0")
    .update(process.env.LETTER_CONTENT ?? "")
    .update("\0")
    .update(process.env.SPECIAL_LETTER_CONTENT ?? "")
    .digest("hex");
}

function parseNameList(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[\n\r,]+/)
      .map(normalizeText)
      .filter((name) => name.length > 0),
  );
}

function getLetterText(raw: string | undefined): string | null {
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
  const cookieStore = await cookies();
  // Sin maxAge/expires: cookie de sesión (se borra al cerrar el navegador).
  cookieStore.set(SESSION_COOKIE, signName(normalizedName, getSigningKey()), {
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
  const allowedNames = parseNameList(process.env.ALLOWED_NAMES);
  const specialNames = parseNameList(process.env.SPECIAL_NAMES);
  const letter = getLetterText(process.env.LETTER_CONTENT);
  const secondLetter = getLetterText(process.env.SPECIAL_LETTER_CONTENT);

  if ((allowedNames.size === 0 && specialNames.size === 0) || letter === null) {
    console.error(
      "[verifyAccess] Faltan ALLOWED_NAMES/SPECIAL_NAMES o LETTER_CONTENT en el entorno.",
    );
    return { success: false, error: GENERIC_ERROR };
  }

  const isSpecial = normalized.length > 0 && specialNames.has(normalized);
  const isAllowed =
    isSpecial || (normalized.length > 0 && allowedNames.has(normalized));

  if (!isAllowed) {
    return { success: false, error: GENERIC_ERROR };
  }

  if (isSpecial && secondLetter === null) {
    console.error(
      "[verifyAccess] Hay SPECIAL_NAMES configurado pero falta SPECIAL_LETTER_CONTENT.",
    );
  }

  await startSession(normalized);
  return {
    success: true,
    letter,
    ...(isSpecial && secondLetter !== null ? { secondLetter } : {}),
  };
}

// Restaura la sesión al recargar: valida la cookie firmada contra la lista actual.
export async function restoreSession(): Promise<VerifyAccessResult> {
  const letter = getLetterText(process.env.LETTER_CONTENT);
  if (letter === null) {
    return { success: false };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return { success: false };

  const signingKey = getSigningKey();
  const allowedNames = parseNameList(process.env.ALLOWED_NAMES);
  const specialNames = parseNameList(process.env.SPECIAL_NAMES);
  const secondLetter = getLetterText(process.env.SPECIAL_LETTER_CONTENT);

  let isAllowed = false;
  let isSpecial = false;

  for (const allowedName of allowedNames) {
    if (safeEqualHex(token, signName(allowedName, signingKey))) isAllowed = true;
  }
  for (const specialName of specialNames) {
    if (safeEqualHex(token, signName(specialName, signingKey))) {
      isAllowed = true;
      isSpecial = true;
    }
  }

  if (!isAllowed) return { success: false };

  return {
    success: true,
    letter,
    ...(isSpecial && secondLetter !== null ? { secondLetter } : {}),
  };
}
