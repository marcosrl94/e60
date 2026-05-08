/**
 * Disclosure card previews
 *
 * Each disclosure framework gets a unique mini-document SVG. The previews
 * sit inside a colored gradient frame on the card. Migrated 1:1 from
 * `_mockups/disclosure-hub.html` (gallery section).
 */

const DOC_FRAME = (
  <rect x={10} y={8} width={100} height={124} rx={3} fill="white" />
);

export function CsrdPreview() {
  return (
    <svg width={120} height={140} viewBox="0 0 120 140" style={{ opacity: 0.95 }}>
      {DOC_FRAME}
      <rect x={18} y={20} width={55} height={3} fill="#0b0d12" rx={1} />
      <rect x={18} y={28} width={80} height={2} fill="#9b9ea7" rx={1} />
      <rect x={18} y={34} width={70} height={2} fill="#9b9ea7" rx={1} />
      <rect x={18} y={44} width={84} height={50} fill="#f4f4f6" rx={2} />
      <rect x={22} y={50} width={20} height={40} fill="#f04e3e" rx={1} />
      <rect x={46} y={56} width={20} height={34} fill="#ff8c2d" rx={1} />
      <rect x={70} y={62} width={20} height={28} fill="#3b6cf3" rx={1} />
      <rect x={18} y={100} width={84} height={2} fill="#e7e7eb" rx={1} />
      <rect x={18} y={106} width={70} height={2} fill="#9b9ea7" rx={1} />
      <rect x={18} y={112} width={84} height={2} fill="#9b9ea7" rx={1} />
      <rect x={18} y={118} width={60} height={2} fill="#9b9ea7" rx={1} />
    </svg>
  );
}

export function CdpPreview() {
  return (
    <svg width={120} height={140} viewBox="0 0 120 140" style={{ opacity: 0.95 }}>
      {DOC_FRAME}
      <text
        x={60}
        y={42}
        textAnchor="middle"
        fontFamily="Inter"
        fontSize={32}
        fontWeight={700}
        fill="#1aa56a"
      >
        A−
      </text>
      <rect x={20} y={56} width={80} height={2} fill="#e7e7eb" rx={1} />
      <rect x={20} y={64} width={60} height={2} fill="#9b9ea7" rx={1} />
      <rect x={20} y={72} width={80} height={2} fill="#9b9ea7" rx={1} />
      <rect x={20} y={80} width={50} height={2} fill="#9b9ea7" rx={1} />
      <rect x={20} y={92} width={80} height={32} fill="#f4f4f6" rx={2} />
      <circle cx={35} cy={108} r={6} fill="#1aa56a" />
      <rect x={48} y={100} width={48} height={2} fill="#9b9ea7" />
      <rect x={48} y={106} width={36} height={2} fill="#c2c4cb" />
      <rect x={48} y={112} width={42} height={2} fill="#c2c4cb" />
    </svg>
  );
}

export function PillarThreePreview() {
  const yLines = [58, 68, 78, 88, 98, 108];
  const xCols = [40, 62, 82];
  const dots = [
    { y: 63, color: '#1aa56a' },
    { y: 73, color: '#1aa56a' },
    { y: 83, color: '#1aa56a' },
    { y: 93, color: '#1aa56a' },
    { y: 103, color: '#f04e3e' },
    { y: 113, color: '#1aa56a' },
  ];
  return (
    <svg width={120} height={140} viewBox="0 0 120 140" style={{ opacity: 0.95 }}>
      {DOC_FRAME}
      <rect x={18} y={20} width={84} height={2} fill="#0b0d12" rx={1} />
      <rect x={18} y={26} width={50} height={2} fill="#9b9ea7" rx={1} />
      <rect x={18} y={38} width={84} height={80} rx={2} fill="#fafafb" />
      <rect x={18} y={38} width={84} height={10} fill="#e7e7eb" />
      {yLines.map((y) => (
        <line key={`h-${y}`} x1={18} y1={y} x2={102} y2={y} stroke="#e7e7eb" />
      ))}
      {xCols.map((x) => (
        <line key={`v-${x}`} x1={x} y1={38} x2={x} y2={118} stroke="#e7e7eb" />
      ))}
      {dots.map((d) => (
        <circle key={`d-${d.y}`} cx={92} cy={d.y} r={2} fill={d.color} />
      ))}
    </svg>
  );
}

export function DjsiPreview() {
  const bars = [
    { y: 44, w: 68, color: '#3b6cf3' },
    { y: 58, w: 48, color: '#3b6cf3' },
    { y: 72, w: 56, color: '#3b6cf3' },
    { y: 86, w: 32, color: '#ff8c2d' },
    { y: 100, w: 72, color: '#3b6cf3' },
    { y: 114, w: 60, color: '#3b6cf3' },
  ];
  return (
    <svg width={120} height={140} viewBox="0 0 120 140" style={{ opacity: 0.95 }}>
      {DOC_FRAME}
      <rect x={20} y={20} width={80} height={3} fill="#0b0d12" rx={1} />
      <rect x={20} y={28} width={50} height={2} fill="#9b9ea7" rx={1} />
      {bars.map((b) => (
        <g key={`b-${b.y}`}>
          <rect x={20} y={b.y} width={80} height={6} fill="#f4f4f6" rx={3} />
          <rect x={20} y={b.y} width={b.w} height={6} fill={b.color} rx={3} />
        </g>
      ))}
    </svg>
  );
}

export function PrbPreview() {
  return (
    <svg width={120} height={140} viewBox="0 0 120 140" style={{ opacity: 0.95 }}>
      {DOC_FRAME}
      <circle cx={60} cy={55} r={22} fill="none" stroke="#7a4cf0" strokeWidth={3} />
      <circle
        cx={60}
        cy={55}
        r={22}
        fill="none"
        stroke="#1aa56a"
        strokeWidth={3}
        strokeDasharray="100 38"
        transform="rotate(-90 60 55)"
      />
      <text
        x={60}
        y={60}
        textAnchor="middle"
        fontFamily="Inter"
        fontSize={13}
        fontWeight={600}
        fill="#0b0d12"
      >
        72%
      </text>
      <rect x={20} y={92} width={80} height={2} fill="#9b9ea7" rx={1} />
      <rect x={20} y={100} width={60} height={2} fill="#9b9ea7" rx={1} />
      <rect x={20} y={108} width={80} height={2} fill="#9b9ea7" rx={1} />
      <rect x={20} y={116} width={50} height={2} fill="#9b9ea7" rx={1} />
    </svg>
  );
}

export function BoardPreview() {
  return (
    <svg width={120} height={140} viewBox="0 0 120 140" style={{ opacity: 0.95 }}>
      {DOC_FRAME}
      <rect x={18} y={18} width={60} height={3} fill="#0b0d12" rx={1} />
      <rect x={18} y={26} width={40} height={2} fill="#9b9ea7" rx={1} />
      <rect x={18} y={38} width={38} height={22} fill="#f4f4f6" rx={2} />
      <rect x={22} y={42} width={14} height={2} fill="#9b9ea7" />
      <rect x={22} y={48} width={20} height={6} fill="#0b0d12" rx={1} />
      <rect x={60} y={38} width={38} height={22} fill="#f4f4f6" rx={2} />
      <rect x={64} y={42} width={14} height={2} fill="#9b9ea7" />
      <rect x={64} y={48} width={22} height={6} fill="#1aa56a" rx={1} />
      <rect x={18} y={64} width={38} height={22} fill="#f4f4f6" rx={2} />
      <rect x={22} y={68} width={14} height={2} fill="#9b9ea7" />
      <rect x={22} y={74} width={18} height={6} fill="#f04e3e" rx={1} />
      <rect x={60} y={64} width={38} height={22} fill="#f4f4f6" rx={2} />
      <rect x={64} y={68} width={14} height={2} fill="#9b9ea7" />
      <rect x={64} y={74} width={20} height={6} fill="#3b6cf3" rx={1} />
      <rect x={18} y={92} width={80} height={28} fill="#fafafb" rx={2} />
      <path
        d="M22 110 L34 105 L46 100 L58 102 L70 96 L82 90 L94 94"
        stroke="#3b6cf3"
        strokeWidth={1.5}
        fill="none"
      />
    </svg>
  );
}
