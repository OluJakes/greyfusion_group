import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "gf_admin_session";
const MAX_AGE = 60 * 60 * 12; // 12h

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

const DEFAULT_ADMIN = "hello@greyfusion.com.ng";

/** Signed session token carrying the authenticated admin's username (base64url). */
export function signSession(username: string, expiresAt: number): string {
  const u = Buffer.from(username).toString("base64url");
  const payload = `admin.${u}.${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "admin") return false;
  const expiresAt = Number(parts[2]);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = createHmac("sha256", secret()).update(`admin.${parts[1]}.${parts[2]}`).digest("hex");
  const a = Buffer.from(parts[3]);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Server-side check usable in layouts, pages, server actions and route handlers. */
export function isAdminAuthenticated(): boolean {
  return verifySessionToken(cookies().get(COOKIE)?.value);
}

/** The authenticated admin's username (from the verified session), or null. */
export function getSessionUsername(): string | null {
  const token = cookies().get(COOKIE)?.value;
  if (!verifySessionToken(token)) return null;
  try {
    return Buffer.from(token!.split(".")[1], "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function createAdminSession(username: string = DEFAULT_ADMIN): void {
  const expiresAt = Date.now() + MAX_AGE * 1000;
  cookies().set(COOKIE, signSession(username, expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroyAdminSession(): void {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export const ADMIN_COOKIE = COOKIE;

// ─── Password hashing (scrypt: salt:hash hex) ───

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  return test.length === known.length && timingSafeEqual(test, known);
}

// ─── Math CAPTCHA (signed, short-lived, HTTP-only) ───

const CAPTCHA_COOKIE = "gf_admin_captcha";
const CAPTCHA_TTL = 10 * 60 * 1000; // 10 minutes

export function signCaptcha(answer: number): string {
  const expiresAt = Date.now() + CAPTCHA_TTL;
  const payload = `${answer}.${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function setCaptchaCookie(answer: number): void {
  cookies().set(CAPTCHA_COOKIE, signCaptcha(answer), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CAPTCHA_TTL / 1000,
  });
}

export function verifyCaptcha(userAnswer: string): boolean {
  const token = cookies().get(CAPTCHA_COOKIE)?.value;
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [answer, expiresAt, sig] = parts;
  if (Date.now() > Number(expiresAt)) return false;
  const expected = createHmac("sha256", secret()).update(`${answer}.${expiresAt}`).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return String(Number(userAnswer)) === String(Number(answer));
}

export function clearCaptcha(): void {
  cookies().set(CAPTCHA_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
