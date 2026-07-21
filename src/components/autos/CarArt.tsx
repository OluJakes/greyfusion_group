export function CarSilhouette({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 640 240" className={className} role="img" aria-label="Vehicle silhouette">
      <ellipse cx="320" cy="212" rx="270" ry="12" fill="currentColor" opacity="0.08" />
      <path
        d="M60 178 C 70 150, 100 138, 150 132 C 190 96, 250 74, 330 74 C 410 74, 470 96, 505 130 C 555 136, 590 150, 596 168 C 600 178, 596 188, 585 190 L 60 190 C 52 188, 54 182, 60 178 Z"
        fill={color}
      />
      <path d="M190 128 C 220 100, 265 86, 325 86 C 385 86, 435 102, 465 128 Z" fill="#0B0E12" opacity="0.85" />
      <path d="M322 88 L 322 128" stroke="#0B0E12" strokeWidth="5" opacity="0.6" />
      <circle cx="175" cy="188" r="30" fill="#0B0E12" />
      <circle cx="175" cy="188" r="14" fill="#8B939E" />
      <circle cx="470" cy="188" r="30" fill="#0B0E12" />
      <circle cx="470" cy="188" r="14" fill="#8B939E" />
      <rect x="560" y="158" width="22" height="7" rx="3.5" fill="#F0765D" opacity="0.9" />
      <rect x="62" y="160" width="18" height="6" rx="3" fill="#E8EAED" opacity="0.85" />
    </svg>
  );
}

export function Cutaway({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 640 260" className="w-full" role="img" aria-label="Cutaway: battery pack along the floor, electric motor on the rear axle, onboard charger up front">
      <path
        d="M60 188 C 70 160, 100 148, 150 142 C 190 106, 250 84, 330 84 C 410 84, 470 106, 505 140 C 555 146, 590 160, 596 178 C 600 188, 596 198, 585 200 L 60 200 C 52 198, 54 192, 60 188 Z"
        fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 5"
      />
      <g className="cutaway-battery">
        <rect x="150" y="176" width="330" height="20" rx="6" fill={accent} opacity="0.9" />
        {[...Array(9)].map((_, i) => (
          <line key={i} x1={185 + i * 33} y1="176" x2={185 + i * 33} y2="196" stroke="#0B0E12" strokeWidth="1.5" opacity="0.35" />
        ))}
        <text x="315" y="222" textAnchor="middle" fontSize="11" fill="var(--muted)">Battery pack · floor-mounted, liquid-cooled</text>
      </g>
      <g>
        <circle cx="470" cy="168" r="22" fill="#0B0E12" />
        <circle cx="470" cy="168" r="12" fill={accent} />
        <text x="470" y="132" textAnchor="middle" fontSize="11" fill="var(--muted)">PMSM motor</text>
      </g>
      <g>
        <rect x="120" y="150" width="44" height="24" rx="5" fill="#0B0E12" />
        <rect x="127" y="156" width="30" height="12" rx="3" fill={accent} opacity="0.7" />
        <text x="142" y="140" textAnchor="middle" fontSize="11" fill="var(--muted)">Onboard charger</text>
      </g>
      <circle cx="175" cy="198" r="26" fill="none" stroke="var(--muted)" strokeWidth="1.5" />
      <circle cx="470" cy="198" r="26" fill="none" stroke="var(--muted)" strokeWidth="1.5" />
    </svg>
  );
}
