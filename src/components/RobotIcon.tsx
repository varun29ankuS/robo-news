interface RobotIconProps {
  size?: number;
  className?: string;
}

export default function RobotIcon({ size = 24, className = "" }: RobotIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`robot-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer hexagonal frame */}
      <polygon
        points="24,2 44,14 44,34 24,46 4,34 4,14"
        fill="none"
        strokeWidth="1.5"
      />

      {/* Inner hexagonal frame */}
      <polygon
        points="24,8 38,17 38,31 24,40 10,31 10,17"
        fill="none"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Robot head - sleek visor style */}
      <path
        d="M15,18 L33,18 L33,28 Q24,32 15,28 Z"
        fill="none"
        strokeWidth="1.5"
      />

      {/* Visor/eye band */}
      <rect
        x="17" y="20" width="14" height="4" rx="2"
        fill="currentColor"
        className="fill-[var(--accent)]"
        opacity="0.8"
      />

      {/* Central eye/sensor */}
      <circle
        cx="24" cy="22" r="1.5"
        fill="var(--bg-primary, #0a0a0a)"
      />

      {/* Antenna nodes */}
      <circle cx="24" cy="12" r="2" fill="currentColor" className="fill-[var(--accent)]" />
      <line x1="24" y1="14" x2="24" y2="18" strokeWidth="1.5" />

      {/* Side data streams */}
      <line x1="8" y1="20" x2="15" y2="20" strokeWidth="1" opacity="0.5" />
      <line x1="8" y1="24" x2="15" y2="24" strokeWidth="1" opacity="0.5" />
      <line x1="33" y1="20" x2="40" y2="20" strokeWidth="1" opacity="0.5" />
      <line x1="33" y1="24" x2="40" y2="24" strokeWidth="1" opacity="0.5" />

      {/* Corner accents */}
      <circle cx="24" cy="2" r="1.5" fill="currentColor" className="fill-[var(--accent)]" />
      <circle cx="4" cy="14" r="1" fill="currentColor" className="fill-[var(--accent)]" opacity="0.6" />
      <circle cx="44" cy="14" r="1" fill="currentColor" className="fill-[var(--accent)]" opacity="0.6" />
      <circle cx="4" cy="34" r="1" fill="currentColor" className="fill-[var(--accent)]" opacity="0.6" />
      <circle cx="44" cy="34" r="1" fill="currentColor" className="fill-[var(--accent)]" opacity="0.6" />
      <circle cx="24" cy="46" r="1" fill="currentColor" className="fill-[var(--accent)]" opacity="0.6" />

      {/* Bottom data indicator */}
      <rect x="20" y="35" width="8" height="2" rx="1" fill="currentColor" className="fill-[var(--accent)]" opacity="0.4" />
    </svg>
  );
}
