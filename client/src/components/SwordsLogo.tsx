export function SwordsLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Balkan Duel crossed swords logo"
      className={className}
    >
      {/* Left sword */}
      <path
        d="M12 52L28 36L32 32L48 16L52 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      {/* Left sword guard */}
      <path
        d="M24 40L20 36"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Left sword pommel */}
      <rect x="9" y="49" width="6" height="6" fill="currentColor" rx="1" />

      {/* Right sword */}
      <path
        d="M52 52L36 36L32 32L16 16L12 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      {/* Right sword guard */}
      <path
        d="M40 40L44 36"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Right sword pommel */}
      <rect x="49" y="49" width="6" height="6" fill="currentColor" rx="1" />

      {/* Center diamond clash point */}
      <rect
        x="28"
        y="28"
        width="8"
        height="8"
        fill="hsl(var(--primary))"
        transform="rotate(45 32 32)"
        rx="1"
      />
    </svg>
  );
}
