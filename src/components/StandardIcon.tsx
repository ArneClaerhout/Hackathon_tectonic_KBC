// Blue line icons for the fixed tiles, in the style of the real KBC app.
const PATHS: Record<string, JSX.Element> = {
  qrPay: (
    <>
      <rect x="4" y="4" width="9" height="9" rx="1" /><rect x="7" y="7" width="3" height="3" />
      <rect x="19" y="4" width="9" height="9" rx="1" /><rect x="22" y="7" width="3" height="3" />
      <rect x="4" y="19" width="9" height="9" rx="1" /><rect x="7" y="22" width="3" height="3" />
      <path d="M17 4v5M17 13h2M19 17h4v3M17 19v4h3M24 24h4v4M28 17v4M17 27h3" />
    </>
  ),
  wallet: (
    <>
      <path d="M6 9l17-4 1 4" />
      <rect x="4" y="9" width="24" height="18" rx="2" fill="#1a8fd0" />
      <path d="M12 16h8M13 19h6M12 22h8" stroke="#fff" />
    </>
  ),
  receive: (
    <>
      <rect x="10" y="3" width="14" height="26" rx="2" />
      <path d="M14 26h6M3 16h13M12 12l4 4-4 4" />
    </>
  ),
  kateCoins: (
    <>
      <circle cx="16" cy="16" r="12" fill="#1a8fd0" />
      <circle cx="16" cy="16" r="9" stroke="#fff" />
      <path d="M13 11v10M13 16l5-5M13 16l5 5" stroke="#fff" strokeWidth="2.4" />
    </>
  ),
}

export function hasStandardIcon(id: string) {
  return id in PATHS
}

export default function StandardIcon({ id }: { id: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#1a8fd0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[id]}
    </svg>
  )
}
