"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";
import RobotIcon from "./RobotIcon";

const NAV_ITEMS = [
  { href: "/", label: "NEWS", icon: "◈" },
  { href: "/terminal", label: "TERMINAL", icon: "▣" },
  { href: "/games", label: "GAMES", icon: "◉" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-gray-900 relative">
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="logo-icon">
              <RobotIcon size={52} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href="/">
                  <h1 className="logo-text glow-text text-2xl">ROBO-NEWS</h1>
                </Link>
                <span className="cursor" />
              </div>
              <p className="text-[0.65rem] text-gray-600 tracking-[0.3em] mt-1">
                THE FRONT PAGE OF ROBOTICS
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  nav-tab px-4 py-2 text-xs font-mono tracking-wider transition-all duration-300
                  ${isActive(item.href)
                    ? "text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.1)]"
                    : "text-gray-500 hover:text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.05)]"
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-600">
              <div className="pulse-dot" />
              <span className="font-mono">LIVE FEED</span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="circuit-line" />
    </header>
  );
}
