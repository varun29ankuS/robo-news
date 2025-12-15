interface IconProps {
  size?: number;
  className?: string;
}

export function AIIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="fill-[var(--accent)]" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="3" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="7" y2="7" />
      <line x1="17" y1="17" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="7" y2="17" />
      <line x1="17" y1="7" x2="18.4" y2="5.6" />
    </svg>
  );
}

export function DroneIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="5" y1="7" x2="5" y2="17" />
      <line x1="19" y1="7" x2="19" y2="17" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <rect x="9" y="10" width="6" height="4" rx="1" />
    </svg>
  );
}

export function ArmIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <rect x="2" y="18" width="6" height="4" rx="1" />
      <line x1="5" y1="18" x2="5" y2="14" />
      <line x1="5" y1="14" x2="12" y2="8" />
      <line x1="12" y1="8" x2="18" y2="4" />
      <circle cx="5" cy="14" r="2" />
      <circle cx="12" cy="8" r="2" />
      <circle cx="18" cy="4" r="2" />
      <line x1="18" y1="4" x2="22" y2="2" />
      <line x1="18" y1="4" x2="22" y2="6" />
    </svg>
  );
}

export function HumanoidIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <circle cx="12" cy="4" r="3" />
      <line x1="12" y1="7" x2="12" y2="14" />
      <line x1="12" y1="9" x2="6" y2="12" />
      <line x1="12" y1="9" x2="18" y2="12" />
      <line x1="12" y1="14" x2="8" y2="22" />
      <line x1="12" y1="14" x2="16" y2="22" />
    </svg>
  );
}

export function MobileIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <rect x="4" y="8" width="16" height="10" rx="2" />
      <circle cx="8" cy="20" r="2" />
      <circle cx="16" cy="20" r="2" />
      <line x1="12" y1="4" x2="12" y2="8" />
      <circle cx="12" cy="3" r="1" fill="currentColor" className="fill-[var(--accent)]" />
      <rect x="8" y="11" width="3" height="3" rx="0.5" className="fill-[var(--accent)]" />
      <rect x="13" y="11" width="3" height="3" rx="0.5" className="fill-[var(--accent)]" />
    </svg>
  );
}

export function IndustrialIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <rect x="2" y="16" width="20" height="6" rx="1" />
      <rect x="4" y="10" width="6" height="6" />
      <rect x="14" y="6" width="6" height="10" />
      <line x1="7" y1="10" x2="7" y2="4" />
      <line x1="7" y1="4" x2="17" y2="4" />
      <line x1="17" y1="4" x2="17" y2="6" />
      <circle cx="7" cy="13" r="1" fill="currentColor" className="fill-[var(--accent)]" />
      <circle cx="17" cy="11" r="1" fill="currentColor" className="fill-[var(--accent)]" />
    </svg>
  );
}

export function DIYIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="21" />
      <circle cx="6" cy="6" r="1" fill="currentColor" className="fill-[var(--accent)]" />
      <circle cx="15" cy="6" r="1" fill="currentColor" className="fill-[var(--accent)]" />
      <rect x="12" y="12" width="6" height="3" rx="0.5" />
      <rect x="12" y="17" width="4" height="2" rx="0.5" />
    </svg>
  );
}

export function AllIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`robot-icon ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" className="fill-[var(--accent)]" />
      <line x1="12" y1="3" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="3" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="21" y2="12" />
    </svg>
  );
}
