"use server";

import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import {
  createAdminSession,
  setCaptchaCookie,
  verifyCaptcha,
  clearCaptcha,
  verifyPassword,
} from "@/lib/auth";

export interface CaptchaChallenge {
  question: string;
}

const DEFAULT_USERNAME = "hello@greyfusion.com.ng";

/** Generate an A±B challenge, store the signed answer in an HTTP-only cookie. */
export async function generateCaptchaChallenge(): Promise<CaptchaChallenge> {
  const a = Math.floor(Math.random() * 98) + 1; // 1..99
  let b = Math.floor(Math.random() * 98) + 1;
  const subtract = Math.random() > 0.5;
  let answer: number;
  let question: string;
  if (subtract) {
    if (b > a) [b] = [Math.floor(Math.random() * a) + 1]; // keep non-negative
    answer = a - b;
    question = `What is ${a} − ${b}?`;
  } else {
    answer = a + b;
    question = `What is ${a} + ${b}?`;
  }
  setCaptchaCookie(answer);
  return { question };
}

export interface LoginState {
  error?: string;
}

/**
 * Verify username, password (scrypt hash via AdminUser, or env fallback for the
 * default account) and the math CAPTCHA answer, then issue the admin session.
 */
export async function loginAdmin(_prev: LoginState | null, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const captcha = String(formData.get("captcha") ?? "");

  if (!verifyCaptcha(captcha)) {
    return { error: "Incorrect CAPTCHA answer. A new question has been issued — try again." };
  }
  clearCaptcha();

  let authed = false;
  try {
    const user = await db.adminUser.findUnique({ where: { username } });
    if (user) {
      if (!user.isActive) return { error: "This account has been disabled. Contact a super administrator." };
      authed = verifyPassword(password, user.passwordHash);
      if (authed) {
        try {
          await db.adminUser.update({ where: { username }, data: { lastLoginAt: new Date() } });
        } catch {
          /* best-effort last-login stamp */
        }
      }
    }
  } catch {
    /* fall through to env fallback */
  }

  // Env fallback: the default super-admin account keyed off ADMIN_PASSWORD.
  if (!authed && username === DEFAULT_USERNAME) {
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (expected) {
      const x = Buffer.from(password.padEnd(64, "\0"));
      const y = Buffer.from(expected.padEnd(64, "\0"));
      authed = x.length === y.length && timingSafeEqual(x, y);
    }
  }

  if (!authed) {
    return { error: "Incorrect username or password." };
  }

  createAdminSession(username);
  redirect("/admin");
}
