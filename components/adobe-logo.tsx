export function AdobeLogo({
  className,
  showWordmark = false,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  if (showWordmark) {
    return (
      <svg
        viewBox="0 0 96 32"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Adobe"
      >
        <rect width="32" height="32" rx="4" fill="#FA0F00" />
        <polygon points="16,8 24,23 8,23" fill="#FFFFFF" />
        <text
          x="40"
          y="22"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="14"
          fontWeight="700"
          fill="currentColor"
          letterSpacing="-0.2"
        >
          Adobe
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Adobe"
    >
      <rect width="32" height="32" rx="4" fill="#FA0F00" />
      <polygon points="16,8 24,23 8,23" fill="#FFFFFF" />
    </svg>
  );
}
