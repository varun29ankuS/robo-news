"use client";

import { domains, type DomainId } from "@/lib/sources";
import {
  AllIcon,
  AIIcon,
  DroneIcon,
  ArmIcon,
  HumanoidIcon,
  MobileIcon,
  IndustrialIcon,
  DIYIcon,
} from "./DomainIcons";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  all: AllIcon,
  ai: AIIcon,
  drones: DroneIcon,
  arms: ArmIcon,
  humanoids: HumanoidIcon,
  mobile: MobileIcon,
  industrial: IndustrialIcon,
  diy: DIYIcon,
};

interface DomainSidebarProps {
  active: DomainId;
  onChange: (domain: DomainId) => void;
}

export default function DomainSidebar({ active, onChange }: DomainSidebarProps) {
  return (
    <nav className="space-y-2">
      <div className="text-[0.65rem] text-[var(--accent)] uppercase tracking-[0.2em] mb-4 px-3">
        Domains
      </div>
      {domains.map((domain) => {
        const Icon = iconMap[domain.id] || AllIcon;
        const isActive = active === domain.id;

        return (
          <button
            key={domain.id}
            onClick={() => onChange(domain.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-3
              transition-all duration-200 text-left
              border-l-2
              ${isActive
                ? "border-[var(--accent)] bg-[rgba(0,212,255,0.08)] text-[var(--accent)]"
                : "border-transparent text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
              }
            `}
          >
            <Icon size={24} className={isActive ? "" : "opacity-60"} />
            <span className="text-sm font-medium tracking-wide">{domain.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
