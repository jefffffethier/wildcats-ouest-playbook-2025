const PLAYER_COLORS = {
  QB:   { fill: '#E8521A', stroke: '#C0420F', text: '#fff' },
  RB:   { fill: '#1B2A4A', stroke: '#0F1923', text: '#fff' },
  SB:   { fill: '#1B2A4A', stroke: '#0F1923', text: '#fff' },
  WR_L: { fill: '#1B2A4A', stroke: '#0F1923', text: '#fff' },
  WR_R: { fill: '#1B2A4A', stroke: '#0F1923', text: '#fff' },
  C:    { fill: '#fff', stroke: '#1B2A4A', text: '#1B2A4A' },
  LG:   { fill: '#fff', stroke: '#1B2A4A', text: '#1B2A4A' },
  RG:   { fill: '#fff', stroke: '#1B2A4A', text: '#1B2A4A' },
  LT:   { fill: '#fff', stroke: '#1B2A4A', text: '#1B2A4A' },
  RT:   { fill: '#fff', stroke: '#1B2A4A', text: '#1B2A4A' },
  TE_L: { fill: '#A08840', stroke: '#7A6530', text: '#fff' },
  TE_R: { fill: '#A08840', stroke: '#7A6530', text: '#fff' },
}

const PLAYER_LABELS = {
  QB: 'QB', RB: 'RB', SB: 'SB',
  WR_L: 'WR', WR_R: 'WR',
  C: 'C', LG: 'LG', RG: 'RG', LT: 'LT', RT: 'RT',
  TE_L: 'TE', TE_R: 'TE',
}

function toSvg(x, y, W, H) {
  return { cx: (x / 100) * W, cy: (y / 100) * H }
}

function ArrowHead({ x, y, angle, color = '#E8521A' }) {
  const size = 8
  return (
    <polygon
      points={`0,-${size} ${size * 0.6},${size * 0.5} -${size * 0.6},${size * 0.5}`}
      fill={color}
      transform={`translate(${x},${y}) rotate(${angle})`}
    />
  )
}

function pathFromPoints(pts, W, H) {
  const svgPts = pts.map(p => toSvg(p.x, p.y, W, H))
  return svgPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ')
}

function getAngle(p1, p2) {
  return Math.atan2(p2.cy - p1.cy, p2.cx - p1.cx) * (180 / Math.PI) + 90
}

export default function PlayDiagram({ play, width = 600, height = 400 }) {
  const W = width
  const H = height

  const scrimmageY = (52 / 100) * H

  const finalPositions = { ...play.positions }
  if (play.motions) {
    play.motions.forEach(m => {
      if (m.type === 'pre-snap') {
        finalPositions[m.player] = { x: m.to.x, y: m.to.y }
      }
    })
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', borderRadius: '8px' }}
    >
      {/* Field background */}
      <rect width={W} height={H} fill="#2D5A27" />

      {/* Yard lines */}
      {[20, 30, 40, 50, 60, 70, 80].map(y => (
        <line
          key={y}
          x1={0} y1={(y / 100) * H}
          x2={W} y2={(y / 100) * H}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* End zone hint */}
      <rect x={0} y={0} width={W} height={(20 / 100) * H} fill="rgba(27,42,74,0.35)" />

      {/* Line of scrimmage */}
      <line
        x1={0} y1={scrimmageY}
        x2={W} y2={scrimmageY}
        stroke="#FFD700"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity={0.6}
      />
      <text
        x={6} y={scrimmageY - 5}
        fill="rgba(255,215,0,0.6)"
        fontSize="9"
        fontFamily="Barlow Condensed"
        fontWeight="600"
      >LIGNE DE MÊLÉE</text>

      {/* Motion arrows (pre-snap, dashed) */}
      {play.motions && play.motions.map((m, i) => {
        if (m.type !== 'motion') return null
        const from = toSvg(m.from.x, m.from.y, W, H)
        const to = toSvg(m.to.x, m.to.y, W, H)
        const angle = getAngle(from, to)
        return (
          <g key={i}>
            <line
              x1={from.cx} y1={from.cy}
              x2={to.cx} y2={to.cy}
              stroke="#FFD700"
              strokeWidth="2"
              strokeDasharray="5 3"
              opacity={0.8}
            />
            <ArrowHead x={to.cx} y={to.cy} angle={angle} color="#FFD700" />
          </g>
        )
      })}

      {/* Run path */}
      {play.runPath && (() => {
        const from = toSvg(play.runPath.from.x, play.runPath.from.y, W, H)
        const to = toSvg(play.runPath.to.x, play.runPath.to.y, W, H)
        const angle = getAngle(from, to)
        const mx = (from.cx + to.cx) / 2
        const my = (from.cy + to.cy) / 2 - 20
        return (
          <g>
            <path
              d={`M ${from.cx} ${from.cy} Q ${mx} ${my} ${to.cx} ${to.cy}`}
              fill="none"
              stroke="#E8521A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ArrowHead x={to.cx} y={to.cy} angle={angle} color="#E8521A" />
          </g>
        )
      })()}

      {/* QB bootleg path */}
      {play.qbPath && (() => {
        const from = toSvg(play.qbPath.from.x, play.qbPath.from.y, W, H)
        const to = toSvg(play.qbPath.to.x, play.qbPath.to.y, W, H)
        const angle = getAngle(from, to)
        return (
          <g>
            <line
              x1={from.cx} y1={from.cy}
              x2={to.cx} y2={to.cy}
              stroke="#E8521A"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity={0.7}
            />
            <ArrowHead x={to.cx} y={to.cy} angle={angle} color="#E8521A" />
          </g>
        )
      })()}

      {/* Pass routes */}
      {play.routes && play.routes.map((route, i) => {
        const d = pathFromPoints(route.path, W, H)
        const pts = route.path.map(p => toSvg(p.x, p.y, W, H))
        const last = pts[pts.length - 1]
        const prev = pts[pts.length - 2]
        const angle = getAngle(prev, last)
        const labelPt = pts[Math.floor(pts.length / 2)]
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#E8521A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <ArrowHead x={last.cx} y={last.cy} angle={angle} color="#E8521A" />
            <text
              x={labelPt.cx + 4} y={labelPt.cy - 6}
              fill="#FFD700"
              fontSize="8"
              fontFamily="Barlow Condensed"
              fontWeight="600"
            >{route.label}</text>
          </g>
        )
      })}

      {/* Players */}
      {Object.entries(finalPositions).map(([key, pos]) => {
        const { cx, cy } = toSvg(pos.x, pos.y, W, H)
        const colors = PLAYER_COLORS[key] || { fill: '#888', stroke: '#555', text: '#fff' }
        const label = PLAYER_LABELS[key] || key
        const isOL = ['C','LG','RG','LT','RT'].includes(key)
        const size = isOL ? 13 : 11

        return (
          <g key={key}>
            {isOL ? (
              <rect
                x={cx - size} y={cy - size}
                width={size * 2} height={size * 2}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1.5"
                rx="2"
              />
            ) : (
              <circle cx={cx} cy={cy} r={size} fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
            )}
            <text
              x={cx} y={cy + 4}
              textAnchor="middle"
              fill={colors.text}
              fontSize="8"
              fontFamily="Barlow Condensed"
              fontWeight="700"
            >{label}</text>
          </g>
        )
      })}

      {/* Ball */}
      <ellipse
        cx={(50 / 100) * W}
        cy={scrimmageY - 10}
        rx="6" ry="4"
        fill="#8B4513"
        stroke="#5C2D0A"
        strokeWidth="1"
      />
      <line
        x1={(50 / 100) * W - 4} y1={scrimmageY - 10}
        x2={(50 / 100) * W + 4} y2={scrimmageY - 10}
        stroke="#fff"
        strokeWidth="0.8"
        opacity={0.7}
      />

      {/* Legend */}
      <g transform={`translate(8, ${H - 42})`}>
        <rect x={0} y={0} width={160} height={38} rx={4} fill="rgba(0,0,0,0.55)" />
        <line x1={8} y1={12} x2={28} y2={12} stroke="#E8521A" strokeWidth="2.5" />
        <polygon points="28,9 34,12 28,15" fill="#E8521A" />
        <text x={40} y={16} fill="#fff" fontSize="8" fontFamily="Barlow Condensed">Course / Route</text>
        <line x1={8} y1={28} x2={28} y2={28} stroke="#FFD700" strokeWidth="2" strokeDasharray="4 2" />
        <polygon points="28,25 34,28 28,31" fill="#FFD700" />
        <text x={40} y={32} fill="#fff" fontSize="8" fontFamily="Barlow Condensed">Mouvement pré-snap</text>
      </g>
    </svg>
  )
}
