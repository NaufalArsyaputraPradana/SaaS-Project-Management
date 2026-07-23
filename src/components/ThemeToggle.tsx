"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="fixed bottom-6 right-6 w-12 h-12"></div>;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-[60] flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border border-blue-500/30 shadow-2xl shadow-blue-900/40 hover:shadow-blue-500/50 hover:scale-105 transition-all text-slate-200"
      title="Ubah Tema Gelap/Terang"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-blue-400" />
      )}
    </button>
  );
}
