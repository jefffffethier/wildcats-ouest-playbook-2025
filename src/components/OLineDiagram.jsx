// SVG diagram focused on the O-line blocking area.
// Viewport: 500 × 190  — coordinates match olineSchemes.js

const VW = 500
const VH = 210

const OLINE = [
  { id: 'LW', x: 75,  y: 145, label: 'W', type: 'wing' },
  { id: 'LT', x: 150, y: 145, label: 'T', type: 'ol'   },
  { id: 'LG', x: 210, y: 145, label: 'G', type: 'ol'   },
  { id: 'C',  x: 270, y: 145, label: 'C', type: 'ol'   },
  { id: 'RG', x: 330, y: 145, label: 'G', type: 'ol'   },
  { id: 'RT', x: 390, y: 145, label: 'T', type: 'ol'   },
  { id: 'RW', x: 455, y: 145, label: 'W', type: 'wing' },
]

const C = {
  field:    '#2D5A27',
  ol:       { fill: '#A08840',     stroke: '#7A6530', text: '#fff' },
  wing:     { fill: '#A08840',  stroke: '#7A6530', text: '#fff'    },
  fb:       { fill: '#7B3FD4',  stroke: '#5A2E9E', text: '#fff'    },
  defender: '#E8521A',
  block:    '#E040B0',
  release:  'rgba(255,255,255,0.55)',
  blitz:    '#FF3B30',
  runZone:  '#4CFF80',
  los:      '#FFFFFF',
}

function XMark({ x, y, size = 9 }) {
  return (
    <g>
      <line x1={x - size} y1={y - size} x2={x + size} y2={y + size}
            stroke={C.defender} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={x + size} y1={y - size} x2={x - size} y2={y + size}
            stroke={C.defender} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, color, width = 1.8, dashed = false, headSize = 7 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI) + 90
  const dist  = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const r     = Math.max(0, (dist - headSize - 3) / dist)
  const ex    = x1 + (x2 - x1) * r
  const ey    = y1 + (y2 - y1) * r
  const hw    = headSize * 0.55

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={ex} y2={ey}
        stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '5 3' : undefined}
        strokeLinecap="round"
      />
      <polygon
        points={`0,-${headSize} ${hw},${headSize * 0.5} -${hw},${headSize * 0.5}`}
        fill={color}
        transform={`translate(${ex},${ey}) rotate(${angle})`}
      />
    </g>
  )
}

function BlockLine({ x1, y1, x2, y2, color, width = 1.8, dashed = false, capSize = 10 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const perp  = angle + Math.PI / 2
  const half  = capSize / 2
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '5 3' : undefined}
        strokeLinecap="round"
      />
      <line
        x1={x2 + Math.cos(perp) * half} y1={y2 + Math.sin(perp) * half}
        x2={x2 - Math.cos(perp) * half} y2={y2 - Math.sin(perp) * half}
        stroke={color} strokeWidth={width}
        strokeLinecap="round"
      />
    </g>
  )
}

export default function OLineDiagram({ scheme }) {
  const { defenders, blocks, releases = [], runX, fb, blitzer, fbBlock, gap } = scheme
  const gapHalf = 27

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block', borderRadius: '8px' }}>

      {/* Field */}
      <rect width={VW} height={VH} fill={C.field} />

      {/* Faint horizontal markers */}
      {[25, 50, 75].map(pct => (
        <line key={pct}
          x1={0} y1={(pct / 100) * VH} x2={VW} y2={(pct / 100) * VH}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
      ))}

      {/* Run zone — drawn behind everything */}
      <rect
        x={runX - gapHalf} y={50}
        width={gapHalf * 2} height={96}
        fill={C.runZone} opacity={0.15} rx={3}
      />
      <rect
        x={runX - gapHalf} y={50}
        width={gapHalf * 2} height={96}
        fill="none" stroke={C.runZone} strokeWidth="1.5" opacity={0.4} rx={3}
      />
      
      {/* Run zone — Gap Text */}
          <text
            x={runX} y={95}
            width={gapHalf * 2}
            textAnchor="middle"
            fill={C.runZone}
            fontSize="11"
            fontFamily="Barlow Condensed, sans-serif"
            fontWeight="800"
            opacity={0.9}
          >{gap}</text>

      {/* Line of scrimmage */}
      <line x1={0} y1={120} x2={VW} y2={120}
            stroke={C.los} strokeWidth="1.5" strokeDasharray="6 4" opacity={0.55} />
      <text x={VW - 8} y={113} textAnchor="end"
            fill="rgba(255, 255, 255, 0.45)" fontSize="7.5"
            fontFamily="Barlow Condensed" fontWeight="600">LIGNE DE MÊLÉE</text>

      {/* Blitz rush arrow */}
      {blitzer && (
        <Arrow
          x1={blitzer.x} y1={blitzer.y}
          x2={blitzer.toX} y2={blitzer.toY}
          color={C.blitz} width={2.5} dashed headSize={8}
        />
      )}

      {/* 2nd-level release lines */}
      {releases.map((rel, i) => (
        <BlockLine key={i}
          x1={rel.from[0]} y1={rel.from[1]}
          x2={rel.to[0]}   y2={rel.to[1]}
          color={C.release} width={1.4} dashed capSize={8}
        />
      ))}

      {/* Block assignment lines */}
      {blocks.map((b, i) => (
        <BlockLine key={i}
          x1={b.from[0]} y1={b.from[1]}
          x2={b.to[0]}   y2={b.to[1]}
          color={C.block} width={2} capSize={10}
        />
      ))}

      {/* FB block arrow */}
      {fb && fbBlock && (
        <Arrow
          x1={fb.x} y1={fb.y}
          x2={fbBlock.toX} y2={fbBlock.toY}
          color="#B070FF" width={2} headSize={7}
        />
      )}

      {/* Defenders */}
      {defenders.map((d, i) => <XMark key={i} x={d.x} y={d.y} />)}

      {/* O-line players */}
      {OLINE.map(p => {
        if (p.type === 'ol') {
          return (
            <g key={p.id}>
              <rect x={p.x - 12} y={p.y - 12} width={24} height={24}
                    fill={C.ol.fill} stroke={C.ol.stroke} strokeWidth="1.5" rx="2" />
              <text x={p.x} y={p.y + 5} textAnchor="middle"
                    fill={C.ol.text} fontSize="9"
                    fontFamily="Barlow Condensed" fontWeight="700">{p.label}</text>
            </g>
          )
        }
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={12}
                    fill={C.wing.fill} stroke={C.wing.stroke} strokeWidth="1.5" />
            <text x={p.x} y={p.y + 5} textAnchor="middle"
                  fill={C.wing.text} fontSize="9"
                  fontFamily="Barlow Condensed" fontWeight="700">{p.label}</text>
          </g>
        )
      })}

      {/* FB player (blitz only) */}
      {fb && (
        <g>
          <circle cx={fb.x} cy={fb.y} r={12}
                  fill={C.fb.fill} stroke={C.fb.stroke} strokeWidth="1.5" />
          <text x={fb.x} y={fb.y + 5} textAnchor="middle"
                fill={C.fb.text} fontSize="8"
                fontFamily="Barlow Condensed" fontWeight="700">FB</text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(8,${VH - 36})`}>
        <rect x={0} y={0} width={320} height={32} rx={3} fill="rgba(0,0,0,0.58)" />

        {/* Block */}
        <line x1={7} y1={9} x2={22} y2={9} stroke={C.block} strokeWidth="2" strokeLinecap="round" />
        <line x1={22} y1={5} x2={22} y2={13} stroke={C.block} strokeWidth="2" strokeLinecap="round" />
        <text x={30} y={13} fill="#fff" fontSize="7.5" fontFamily="Barlow Condensed">Block</text>

        {/* 2e niveau */}
        <line x1={68} y1={9} x2={83} y2={9} stroke={C.release} strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1={83} y1={5} x2={83} y2={13} stroke={C.release} strokeWidth="1.5" strokeLinecap="round" />
        <text x={91} y={13} fill="#fff" fontSize="7.5" fontFamily="Barlow Condensed">2e niveau</text>

        {/* Blitz */}
        <line x1={154} y1={9} x2={167} y2={9} stroke={C.blitz} strokeWidth="2" strokeDasharray="3 2" />
        <polygon points="167,6 172,9 167,12" fill={C.blitz} />
        <text x={177} y={13} fill="#fff" fontSize="7.5" fontFamily="Barlow Condensed">Blitz</text>

        {/* Run zone */}
        <rect x={7} y={19} width={13} height={9} fill={C.runZone} opacity={0.25}
              stroke={C.runZone} strokeOpacity={0.5} strokeWidth="1" rx={2} />
        <text x={26} y={27} fill="#fff" fontSize="7.5" fontFamily="Barlow Condensed">Zone de course</text>

        {/* FB */}
        <circle cx={164} cy={23} r={5} fill={C.fb.fill} stroke={C.fb.stroke} strokeWidth="1" />
        <text x={174} y={27} fill="#fff" fontSize="7.5" fontFamily="Barlow Condensed">FB (contre blitz)</text>
      </g>
    </svg>
  )
}
