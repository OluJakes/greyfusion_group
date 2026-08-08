"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAdmin, generateCaptchaChallenge } from "@/app/admin/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Verifying…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(loginAdmin, null);
  const [question, setQuestion] = useState<string>("Loading challenge…");
  const [loadingCaptcha, setLoadingCaptcha] = useState(true);

  const refresh = async () => {
    setLoadingCaptcha(true);
    const c = await generateCaptchaChallenge();
    setQuestion(c.question);
    setLoadingCaptcha(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  // After a failed attempt the server rotates the answer cookie — fetch a fresh question.
  useEffect(() => {
    if (state?.error) void refresh();
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="admin-user" className="label-gf">Username</label>
        <input
          id="admin-user"
          name="username"
          type="text"
          autoComplete="username"
          required
          defaultValue="hello@greyfusion.com.ng"
          className="input-gf"
        />
      </div>
      <div>
        <label htmlFor="admin-pass" className="label-gf">Password</label>
        <input id="admin-pass" name="password" type="password" autoComplete="current-password" required className="input-gf" />
      </div>
      <div>
        <label htmlFor="admin-captcha" className="label-gf">Security check</label>
        <div className="flex items-center gap-2">
          <span className="num flex h-11 flex-1 items-center rounded-xl border px-3.5 text-sm font-semibold hairline" aria-live="polite">
            {question}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={loadingCaptcha}
            aria-label="New challenge"
            className="flex h-11 w-11 items-center justify-center rounded-xl border text-lg hairline transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            ↻
          </button>
        </div>
        <input
          id="admin-captcha"
          name="captcha"
          type="text"
          inputMode="numeric"
          required
          placeholder="Your answer"
          className="input-gf mt-2"
          aria-label="CAPTCHA answer"
        />
      </div>
      {state?.error && <p className="text-sm text-fusion">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
