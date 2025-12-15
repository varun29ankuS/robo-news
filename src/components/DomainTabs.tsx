"use client";

import { domains, type DomainId } from "@/lib/sources";
import {
  AllIcon,
  DroneIcon,
  ArmIcon,
  HumanoidIcon,
  MobileIcon,
  IndustrialIcon,
  DIYIcon,
} from "./DomainIcons";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  all: AllIcon,
  drones: DroneIcon,
  arms: ArmIcon,
  humanoids: HumanoidIcon,
  mobile: MobileIcon,
  industrial: IndustrialIcon,
  diy: DIYIcon,
};

interface DomainTabsProps {
  active: DomainId;
  onChange: (domain: DomainId) => void;
  counts?: Record<string, number>;
}

export default function DomainTabs({ active, onChange, counts = {} }: DomainTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {domains.map((domain) => {
        const Icon = iconMap[domain.id] || AllIcon;
        const count = counts[domain.id] || 0;

        return (
          <button
            key={domain.id}
            onClick={() => onChange(domain.id)}
            className={`domain-tab flex items-center gap-2 ${active === domain.id ? "active" : ""}`}
          >
            <Icon size={22} />
            <span>{domain.name}</span>
            {count > 0 && (
              <span className="text-[0.6rem] opacity-50">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
