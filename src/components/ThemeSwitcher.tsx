"use client";

import { useEffect, useState } from "react";

type Theme = "cyan" | "amber" | "matrix" | "light";

const themes: { id: Theme; color: string; label: string; border?: string }[] = [
  { id: "cyan", color: "#00d4ff", label: "Cyan" },
  { id: "amber", color: "#ffb000", label: "Amber" },
  { id: "matrix", color: "#00ff41", label: "Matrix" },
  { id: "light", color: "#ffffff", label: "Light", border: "#ccc" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("cyan");

  useEffect(() => {
    const saved = localStorage.getItem("robo-theme") as Theme | null;
    if (saved && themes.some((t) => t.id === saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("robo-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-60 mr-2 uppercase tracking-wider">Theme</span>
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => changeTheme(t.id)}
          className={`theme-btn ${theme === t.id ? "active" : ""}`}
          style={{
            backgroundColor: t.color,
            borderColor: t.border || t.color,
          }}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        />
      ))}
    </div>
  );
}
