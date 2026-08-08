"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "auto" | "dark";
const ORDER: Mode[] = ["light", "auto", "dark"];

function computeDark(mode: Mode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  return !(h >= 7 && h < 18.5);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem("gf-theme") as Mode | null) ?? "auto";
    setMode(stored);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("gf-theme", mode);
    document.documentElement.classList.toggle("dark", computeDark(mode));
  }, [mode, mounted]);

  const next = () => setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
  const icons: Record<Mode, string> = { light: "☀", auto: "◐", dark: "☾" };

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`Theme: ${mode}. Click to change.`}
      title={`Theme: ${mode}`}
      className={
        "flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors hairline hover:border-fusion " +
        (className ?? "")
      }
    >
      <span aria-hidden="true">{mounted ? icons[mode] : "◐"}</span>
    </button>
  );
}
