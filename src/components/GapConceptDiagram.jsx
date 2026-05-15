const VW = 500
const VH = 190
const OL_Y = 145
const ZONE_TOP = 50
const ZONE_BOTTOM = 131
const LOS_Y = 132

// All positions are perfectly symmetric around x = 250 (SVG centre).
// Interior spacing: 60px between adjacent linemen.
// Wing spacing: 72px outside each tackle.
const OLINE = [
  { id: 'LW', x: 58,  label: 'LW', type: 'wing' },
  { id: 'LT', x: 130, label: 'LT', type: 'ol'   },
  { id: 'LG', x: 190, label: 'LG', type: 'ol'   },
  { id: 'C',  x: 250, label: 'C',  type: 'ol'   },
  { id: 'RG', x: 310, label: 'RG', type: 'ol'   },
  { id: 'RT', x: 370, label: 'RT', type: 'ol'   },
  { id: 'RW', x: 442, label: 'RW', type: 'wing' },
]

// Gap zones derived from player edges (player half-width = 12).
// Left and right zones are mirror images around x = 250.
const GAPS = [
  // Left side — outward from centre
  { code: 'A', side: 'left',  color: '#E8521A', x1: 202, x2: 238, cx: 220 }, // LG → C
  { code: 'B', side: 'left',  color: '#A08840', x1: 142, x2: 178, cx: 160 }, // LT → LG
  { code: 'C', side: 'left',  color: '#3B9EE8', x1: 70,  x2: 118, cx: 94  }, // LW → LT
  // Right side — outward from centre
  { code: 'A', side: 'right', color: '#E8521A', x1: 262, x2: 298, cx: 280 }, // C  → RG
  { code: 'B', side: 'right', color: '#A08840', x1: 322, x2: 358, cx: 340 }, // RG → RT
  { code: 'C', side: 'right', color: '#3B9EE8', x1: 382, x2: 430, cx: 406 }, // RT → RW
]

export default function GapConceptDiagram({ direction = 'left' }) {
  const visibleGaps = GAPS.filter(g => g.side === direction)
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ display: 'block', borderRadius: '8px', marginBottom: '1rem', marginTop: '1rem' }}
    >
      {/* Field */}
      <rect width={VW} height={VH} fill="#2D5A27" />

      {/* Faint horizontal markers */}
      {[25, 50, 75].map(pct => (
        <line key={pct}
          x1={0} y1={(pct / 100) * VH} x2={VW} y2={(pct / 100) * VH}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
      ))}

      {/* Gap zones */}
      {visibleGaps.map((g, i) => (
        <g key={i}>
          {/* Run Gap rectangle */}
          <rect
            x={g.x1} y={ZONE_TOP}
            width={g.x2 - g.x1} height={ZONE_BOTTOM - ZONE_TOP}
            fill={g.color} opacity={0.22} rx={3}
          />
          <rect
            x={g.x1} y={ZONE_TOP}
            width={g.x2 - g.x1} height={ZONE_BOTTOM - ZONE_TOP}
            fill="none" stroke={g.color} strokeWidth="1.5" opacity={0.5} rx={3}
          />
          {/* Run Gap text */}
          <text
            x={g.cx} y={ZONE_TOP + 30}
            textAnchor="middle"
            fill={g.color}
            fontSize="18"
            fontFamily="Barlow Condensed, sans-serif"
            fontWeight="800"
            opacity={0.9}
          >{g.code}</text>
          <text
            x={g.cx} y={ZONE_TOP + 44}
            textAnchor="middle"
            fill={g.color}
            fontSize="8.5"
            fontFamily="Barlow Condensed, sans-serif"
            fontWeight="700"
            letterSpacing="0.08em"
            opacity={0.75}
          >GAP</text>
        </g>
      ))}

      {/* Line of scrimmage */}
      <line
        x1={0} y1={LOS_Y} x2={VW} y2={LOS_Y}
        stroke="#ffffff" strokeWidth="1.5" strokeDasharray="6 4" opacity={0.55}
      />
      <text
        x={VW -8} y={LOS_Y - 4}
        textAnchor="end"
        fill="rgba(255, 255, 255, 0.45)"
        fontSize="7.5"
        fontFamily="Barlow Condensed, sans-serif"
        fontWeight="600"
      >LIGNE DE MÊLÉE</text>

      
      {/* O-line players */}
      {OLINE.map(p => {
        if (p.type === 'ol') {
          return (
            <g key={p.id}>
              <rect
                x={p.x - 12} y={OL_Y - 12} width={24} height={24}
                fill="#A08840" stroke="#7A6530" strokeWidth="1.5" rx="2"
              />
              <text
                x={p.x} y={OL_Y + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="9"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="700"
              >{p.label[0]}</text>
            </g>
          )
        }
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={OL_Y} r={12} fill="#A08840" stroke="#7A6530" strokeWidth="1.5" />
            <text
              x={p.x} y={OL_Y + 5}
              textAnchor="middle"
              fill="#fff"
              fontSize="9"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="700"
            >W</text>
          </g>
        )
      })}

      {/* Position labels below players */}
      {OLINE.map(p => (
        <text
          key={`lbl-${p.id}`}
          x={p.x} y={OL_Y + 26}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize="7.5"
          fontFamily="Barlow Condensed, sans-serif"
          fontWeight="600"
        >{p.label}</text>
      ))}

    </svg>
  )
}
