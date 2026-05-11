import { useState, useEffect, useRef } from 'react'
import PlayDiagram from '../PlayDiagram.jsx'
import { getPlay, updatePlay, subscribe } from '../../store/playbookStore.js'

const W = 560
const H = 374

const ALL_POSITIONS = [
  'QB', 'RB', 'SB',
  'WR_L', 'WR_R', 'WR_M',
  'C', 'LG', 'RG', 'LT', 'RT',
  'TE_L', 'TE_R',
]

const OL_SET = new Set(['C', 'LG', 'RG', 'LT', 'RT'])

const DEFAULT_POS = {
  QB:   { x: 50, y: 62 }, RB:  { x: 50, y: 75 },
  C:    { x: 50, y: 52 }, LG:  { x: 43, y: 52 }, RG: { x: 57, y: 52 },
  LT:   { x: 36, y: 52 }, RT:  { x: 64, y: 52 },
  TE_L: { x: 30, y: 52 }, TE_R:{ x: 70, y: 52 },
  SB:   { x: 22, y: 58 },
  WR_L: { x: 10, y: 52 }, WR_R:{ x: 90, y: 52 }, WR_M:{ x: 50, y: 40 },
}

const PLAYER_LABELS = {
  QB:'QB', RB:'RB', SB:'SB',
  WR_L:'WR G', WR_R:'WR D', WR_M:'WR M',
  C:'C', LG:'LG', RG:'RG', LT:'LT', RT:'RT',
  TE_L:'TE G', TE_R:'TE D',
}

const MODE_LABELS = {
  select: 'Normal',
  drag:   'Déplacer joueur',
  route:  'Route (passe)',
  motion: 'Mouvement pré-snap',
  run:    'Chemin de course',
}

function toSvg(x, y) {
  return { cx: (x / 100) * W, cy: (y / 100) * H }
}

function eventToPercent(e, svgEl) {
  const rect = svgEl.getBoundingClientRect()
  return {
    x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
    y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
  }
}

export default function PlayCanvas({ selectedId }) {
  const [play, setPlay]         = useState(null)
  const [mode, setMode]         = useState('select')
  const [dragKey, setDragKey]   = useState(null)
  const [route, setRoute]       = useState(null)   // { player, path:[{x,y}...] }
  const [motion, setMotion]     = useState(null)   // { player, path:[{x,y}...] }
  const [runFrom, setRunFrom]   = useState(null)   // {x,y} while waiting for 2nd click
  const overlayRef              = useRef(null)

  useEffect(() => {
    if (!selectedId) { setPlay(null); return }
    setPlay(getPlay(selectedId) ?? null)
    const unsub = subscribe(() => setPlay(getPlay(selectedId) ?? null))
    return unsub
  }, [selectedId])

  // Reset interaction state when the selected play changes
  useEffect(() => {
    setMode('select'); setDragKey(null); setRoute(null); setMotion(null); setRunFrom(null)
  }, [selectedId])

  if (!selectedId || !play) {
    return (
      <div style={styles.root}>
        <div style={styles.placeholder}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
            style={{ marginBottom: 16, opacity: 0.25 }}>
            <rect x="6" y="14" width="36" height="26" rx="3"
              stroke="#fff" strokeWidth="2" fill="none" />
            <line x1="6" y1="24" x2="42" y2="24"
              stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="24" cy="37" r="3" fill="#fff" opacity="0.5" />
          </svg>
          <span style={styles.placeholderText}>Sélectionnez un jeu pour éditer</span>
        </div>
      </div>
    )
  }

  const positions = play.positions || {}

  // ── Mode switch ────────────────────────────────────────────────────────────

  function switchMode(m) {
    setMode(m); setDragKey(null); setRoute(null); setMotion(null); setRunFrom(null)
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function onPlayerMouseDown(e, key) {
    e.preventDefault(); e.stopPropagation()
    setDragKey(key)
  }

  function onOverlayMouseMove(e) {
    if (!dragKey || !overlayRef.current) return
    e.preventDefault()
    const { x, y } = eventToPercent(e, overlayRef.current)
    updatePlay(play.id, {
      positions: {
        ...positions,
        [dragKey]: { x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 },
      },
    })
  }

  function onOverlayMouseUp() { setDragKey(null) }

  // ── Route handlers ─────────────────────────────────────────────────────────

  function startRoute(e, key) {
    e.stopPropagation()
    if (route) return
    const pos = positions[key] || DEFAULT_POS[key] || { x: 50, y: 50 }
    setRoute({ player: key, path: [{ x: pos.x, y: pos.y }] })
  }

  function addRouteWaypoint(e) {
    if (!route || !overlayRef.current) return
    const pt = eventToPercent(e, overlayRef.current)
    setRoute(r => ({ ...r, path: [...r.path, pt] }))
  }

  function finalizeRoute() {
    if (!route || route.path.length < 2) { setRoute(null); return }
    const label = PLAYER_LABELS[route.player] || route.player
    const others = (play.routes || []).filter(r => r.player !== route.player)
    updatePlay(play.id, {
      routes: [...others, { player: route.player, path: route.path, label }],
    })
    setRoute(null)
  }

  function removeRoute(playerKey) {
    updatePlay(play.id, {
      routes: (play.routes || []).filter(r => r.player !== playerKey),
    })
  }

  // ── Motion handlers ───────────────────────────────────────────────────────

  function startMotion(e, key) {
    e.stopPropagation()
    if (motion) return
    const pos = positions[key] || DEFAULT_POS[key] || { x: 50, y: 50 }
    setMotion({ player: key, path: [{ x: pos.x, y: pos.y }] })
  }

  function addMotionWaypoint(e) {
    if (!motion || !overlayRef.current) return
    const pt = eventToPercent(e, overlayRef.current)
    setMotion(m => ({ ...m, path: [...m.path, pt] }))
  }

  function finalizeMotion() {
    if (!motion || motion.path.length < 2) { setMotion(null); return }
    const others = (play.motions || []).filter(m => m.player !== motion.player)
    updatePlay(play.id, {
      motions: [...others, { player: motion.player, path: motion.path, type: 'motion' }],
    })
    setMotion(null)
  }

  function removeMotion(playerKey) {
    updatePlay(play.id, {
      motions: (play.motions || []).filter(m => m.player !== playerKey),
    })
  }

  // ── Run path handlers ──────────────────────────────────────────────────────

  function onRunClick(e) {
    if (!overlayRef.current) return
    const pt = eventToPercent(e, overlayRef.current)
    if (!runFrom) {
      setRunFrom(pt)
    } else {
      updatePlay(play.id, { runPath: { from: runFrom, to: pt } })
      setRunFrom(null)
      switchMode('select')
    }
  }

  function removeRunPath() {
    updatePlay(play.id, { runPath: undefined })
  }

  // ── Player toggle ──────────────────────────────────────────────────────────

  function togglePlayer(key) {
    const p = { ...positions }
    if (p[key]) { delete p[key] }
    else { p[key] = DEFAULT_POS[key] || { x: 50, y: 50 } }
    updatePlay(play.id, { positions: p })
  }

  // ── Overlay click dispatcher ───────────────────────────────────────────────

  function onOverlayClick(e) {
    if (mode === 'route' && route) addRouteWaypoint(e)
    if (mode === 'motion' && motion) addMotionWaypoint(e)
    if (mode === 'run') onRunClick(e)
  }

  const overlayCursor =
    mode === 'drag'   ? (dragKey ? 'grabbing' : 'default') :
    mode === 'route'  ? (route   ? 'crosshair' : 'default') :
    mode === 'motion' ? (motion  ? 'crosshair' : 'default') :
    mode === 'run'    ? 'crosshair' : 'default'

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.playName}>{play.name}</span>
        <span style={styles.badge}>{play.type === 'run' ? 'Course' : 'Passe'}</span>
        <span style={styles.formation}>{play.formation}</span>
      </div>

      {/* Mode toolbar */}
      <div style={styles.modeBar}>
        {Object.entries(MODE_LABELS).map(([k, label]) => (
          <button key={k} onClick={() => switchMode(k)}
            style={mode === k ? styles.modeBtnActive : styles.modeBtn}>
            {label}
          </button>
        ))}
      </div>

      {/* Contextual instruction */}
      {mode === 'drag' && (
        <div style={styles.hint}>Cliquez et glissez un joueur pour le repositionner</div>
      )}
      {mode === 'route' && !route && (
        <div style={styles.hint}>Cliquez sur un joueur pour commencer sa route</div>
      )}
      {mode === 'route' && route && (
        <div style={styles.hintActive}>
          <span style={{ color: '#E8521A', fontWeight: 700 }}>
            {PLAYER_LABELS[route.player]}
          </span>
          {' — '}{route.path.length - 1} point(s). Cliquez sur le terrain pour ajouter des points.
          <button style={styles.hintBtn} onClick={finalizeRoute}>Terminer ✓</button>
          <button style={{ ...styles.hintBtn, background: 'rgba(255,255,255,0.08)' }}
            onClick={() => setRoute(null)}>Annuler</button>
        </div>
      )}
      {mode === 'motion' && !motion && (
        <div style={styles.hint}>Cliquez sur un joueur pour commencer son mouvement pré-snap</div>
      )}
      {mode === 'motion' && motion && (
        <div style={styles.hintActive}>
          <span style={{ color: '#FFD700', fontWeight: 700 }}>
            {PLAYER_LABELS[motion.player]}
          </span>
          {' — '}{motion.path.length - 1} point(s). Cliquez sur le terrain pour ajouter des points.
          <button style={{ ...styles.hintBtn, background: '#A08840' }} onClick={finalizeMotion}>Terminer ✓</button>
          <button style={{ ...styles.hintBtn, background: 'rgba(255,255,255,0.08)' }}
            onClick={() => setMotion(null)}>Annuler</button>
        </div>
      )}
      {mode === 'run' && (
        <div style={styles.hint}>
          {!runFrom
            ? 'Cliquez sur le terrain pour marquer le point de départ du porteur'
            : 'Cliquez pour marquer la destination'}
        </div>
      )}

      {/* Diagram + interactive overlay */}
      <div style={styles.diagramWrap}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 560,
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
          <PlayDiagram play={play} width={W} height={H} />
          <svg
            ref={overlayRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              pointerEvents: mode !== 'select' ? 'all' : 'none',
              cursor: overlayCursor,
            }}
            onMouseMove={onOverlayMouseMove}
            onMouseUp={onOverlayMouseUp}
            onMouseLeave={onOverlayMouseUp}
            onClick={onOverlayClick}
          >
            {/* Route in progress — dashed preview line */}
            {mode === 'route' && route && route.path.length >= 2 && (
              <polyline
                points={route.path.map(p =>
                  `${(p.x / 100) * W},${(p.y / 100) * H}`).join(' ')}
                fill="none" stroke="#E8521A" strokeWidth="2.5"
                strokeDasharray="5 3" opacity={0.9} strokeLinecap="round"
              />
            )}
            {/* Route waypoints */}
            {mode === 'route' && route && route.path.slice(1).map((p, i) => (
              <circle key={i}
                cx={(p.x / 100) * W} cy={(p.y / 100) * H}
                r={4} fill="#E8521A" opacity={0.85} />
            ))}

            {/* Motion in progress — yellow dashed preview line */}
            {mode === 'motion' && motion && motion.path.length >= 2 && (
              <polyline
                points={motion.path.map(p =>
                  `${(p.x / 100) * W},${(p.y / 100) * H}`).join(' ')}
                fill="none" stroke="#FFD700" strokeWidth="2"
                strokeDasharray="5 3" opacity={0.9} strokeLinecap="round"
              />
            )}
            {mode === 'motion' && motion && motion.path.slice(1).map((p, i) => (
              <circle key={i}
                cx={(p.x / 100) * W} cy={(p.y / 100) * H}
                r={4} fill="#FFD700" opacity={0.85} />
            ))}

            {/* Run path first-click marker */}
            {mode === 'run' && runFrom && (
              <g>
                <circle cx={(runFrom.x / 100) * W} cy={(runFrom.y / 100) * H}
                  r={7} fill="#E8521A" opacity={0.8} />
                <line
                  x1={(runFrom.x / 100) * W - 5} y1={(runFrom.y / 100) * H}
                  x2={(runFrom.x / 100) * W + 5} y2={(runFrom.y / 100) * H}
                  stroke="#fff" strokeWidth={1.5} />
                <line
                  x1={(runFrom.x / 100) * W} y1={(runFrom.y / 100) * H - 5}
                  x2={(runFrom.x / 100) * W} y2={(runFrom.y / 100) * H + 5}
                  stroke="#fff" strokeWidth={1.5} />
              </g>
            )}

            {/* Player hit areas (only rendered when not in select mode) */}
            {mode !== 'select' && Object.entries(positions).map(([key, pos]) => {
              const { cx, cy } = toSvg(pos.x, pos.y)
              const isOL = OL_SET.has(key)
              const r = (isOL ? 13 : 11) + 7
              const isDragging = dragKey === key

              if (mode === 'drag') {
                return (
                  <g key={key}>
                    {isOL
                      ? <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx="2"
                          fill="transparent"
                          stroke={isDragging ? '#fff' : 'rgba(255,255,255,0.5)'}
                          strokeWidth={isDragging ? 2.5 : 1.5}
                          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                          onMouseDown={e => onPlayerMouseDown(e, key)} />
                      : <circle cx={cx} cy={cy} r={r}
                          fill="transparent"
                          stroke={isDragging ? '#fff' : 'rgba(255,255,255,0.5)'}
                          strokeWidth={isDragging ? 2.5 : 1.5}
                          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                          onMouseDown={e => onPlayerMouseDown(e, key)} />
                    }
                  </g>
                )
              }

              if (mode === 'route' && !route) {
                return (
                  <g key={key} style={{ cursor: 'pointer' }}>
                    <circle cx={cx} cy={cy} r={r}
                      fill="rgba(232,82,26,0.18)"
                      stroke="rgba(232,82,26,0.65)"
                      strokeWidth="1.5"
                      onClick={e => startRoute(e, key)} />
                  </g>
                )
              }

              if (mode === 'motion' && !motion) {
                return (
                  <g key={key} style={{ cursor: 'pointer' }}>
                    <circle cx={cx} cy={cy} r={r}
                      fill="rgba(255,215,0,0.15)"
                      stroke="rgba(255,215,0,0.6)"
                      strokeWidth="1.5"
                      onClick={e => startMotion(e, key)} />
                  </g>
                )
              }

              return null
            })}
          </svg>
        </div>
      </div>

      {/* Existing routes */}
      {(play.routes || []).length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Routes</div>
          {(play.routes || []).map(r => (
            <div key={r.player} style={styles.infoRow}>
              <span style={styles.infoLabel}>{PLAYER_LABELS[r.player] || r.player}</span>
              <span style={styles.infoDetail}>{r.label} — {r.path.length} pts</span>
              <button style={styles.deleteBtn} onClick={() => removeRoute(r.player)}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Motions list */}
      {(play.motions || []).filter(m => m.type === 'motion').length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Mouvements pré-snap</div>
          {(play.motions || []).filter(m => m.type === 'motion').map(m => (
            <div key={m.player} style={styles.infoRow}>
              <span style={styles.infoLabel}>{PLAYER_LABELS[m.player] || m.player}</span>
              <span style={styles.infoDetail}>{m.path.length} pts</span>
              <button style={styles.deleteBtn} onClick={() => removeMotion(m.player)}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Run path summary */}
      {play.runPath && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Chemin de course</div>
          <div style={styles.infoRow}>
            <span style={styles.infoDetail}>
              ({play.runPath.from.x.toFixed(0)},{play.runPath.from.y.toFixed(0)})
              {' → '}
              ({play.runPath.to.x.toFixed(0)},{play.runPath.to.y.toFixed(0)})
            </span>
            <button style={styles.deleteBtn} onClick={removeRunPath}>×</button>
          </div>
        </div>
      )}

      {/* Player toggles */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Joueurs actifs</div>
        <div style={styles.toggleGrid}>
          {ALL_POSITIONS.map(key => (
            <label key={key} style={styles.toggleItem}>
              <input
                type="checkbox"
                checked={!!positions[key]}
                onChange={() => togglePlayer(key)}
                style={{ accentColor: '#E8521A', marginRight: 5, cursor: 'pointer' }}
              />
              <span style={{
                color: positions[key] ? '#fff' : 'rgba(255,255,255,0.3)',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '0.82rem',
                letterSpacing: '0.03em',
              }}>
                {PLAYER_LABELS[key]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex', flexDirection: 'column',
    width: '100%', height: '100%',
    background: '#0F1923', overflowY: 'auto',
  },

  placeholder: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    flex: 1, height: '100%', minHeight: 320,
  },
  placeholderText: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '1.1rem', fontWeight: 600,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },

  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
  },
  playName: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '1.25rem', fontWeight: 800,
    color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  badge: {
    background: 'rgba(232,82,26,0.2)', color: '#E8521A',
    borderRadius: '4px', padding: '0.15rem 0.55rem',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.7rem', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  formation: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  },

  modeBar: {
    display: 'flex', gap: '0.4rem',
    padding: '0.6rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0, flexWrap: 'wrap',
  },
  modeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '5px', padding: '0.3rem 0.7rem',
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.78rem', fontWeight: 600,
    letterSpacing: '0.04em', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  modeBtnActive: {
    background: '#E8521A', border: '1px solid #E8521A',
    borderRadius: '5px', padding: '0.3rem 0.7rem',
    color: '#fff',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.78rem', fontWeight: 700,
    letterSpacing: '0.04em', cursor: 'pointer',
  },

  hint: {
    padding: '0.45rem 1rem',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.02em', flexShrink: 0,
  },
  hintActive: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
    padding: '0.45rem 1rem',
    background: 'rgba(232,82,26,0.07)',
    borderBottom: '1px solid rgba(232,82,26,0.15)',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)',
    flexShrink: 0,
  },
  hintBtn: {
    background: '#E8521A', border: 'none', borderRadius: '4px',
    padding: '0.2rem 0.6rem', color: '#fff',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
  },

  diagramWrap: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    padding: '1rem 1rem 0.75rem', flexShrink: 0,
  },

  section: {
    padding: '0.6rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.65rem', fontWeight: 700,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.25)', marginBottom: '0.4rem',
  },
  infoRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.25rem 0',
  },
  infoLabel: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.8rem', fontWeight: 700,
    color: '#fff', minWidth: 40,
  },
  infoDetail: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)',
    flex: 1,
  },
  deleteBtn: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
    fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem',
    transition: 'color 0.15s',
  },

  toggleGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: '0.35rem',
  },
  toggleItem: {
    display: 'flex', alignItems: 'center',
    cursor: 'pointer', padding: '0.15rem 0',
  },
}
