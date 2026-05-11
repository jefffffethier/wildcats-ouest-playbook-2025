import { useState, useEffect } from 'react'
import PlayDiagram from '../PlayDiagram.jsx'
import { getPlay, updatePlay, subscribe } from '../../store/playbookStore.js'

// Default positions used when a play has no positions field at all.
const DEFAULT_POSITIONS = {
  QB:   { x: 50, y: 62 },
  RB:   { x: 50, y: 75 },
  C:    { x: 50, y: 52 },
  LG:   { x: 43, y: 52 },
  RG:   { x: 57, y: 52 },
  LT:   { x: 36, y: 52 },
  RT:   { x: 64, y: 52 },
  TE_L: { x: 30, y: 52 },
  TE_R: { x: 70, y: 52 },
  SB:   { x: 22, y: 58 },
  WR_L: { x: 10, y: 52 },
  WR_R: { x: 90, y: 52 },
}

const PLAYER_LABELS = {
  QB: 'QB', RB: 'RB', SB: 'SB',
  WR_L: 'WR (G)', WR_R: 'WR (D)',
  C: 'Centre', LG: 'G Gauche', RG: 'G Droite',
  LT: 'T Gauche', RT: 'T Droite',
  TE_L: 'TE (G)', TE_R: 'TE (D)',
}

function getPositions(play) {
  if (play.positions && Object.keys(play.positions).length > 0) {
    return play.positions
  }
  return { ...DEFAULT_POSITIONS }
}

export default function PlayCanvas({ selectedId }) {
  const [play, setPlay] = useState(selectedId ? getPlay(selectedId) : null)

  // Reload play from store whenever selectedId changes or store updates.
  useEffect(() => {
    if (!selectedId) {
      setPlay(null)
      return
    }
    setPlay(getPlay(selectedId) || null)

    const unsub = subscribe(() => {
      setPlay(getPlay(selectedId) || null)
    })
    return unsub
  }, [selectedId])

  // --- null state ---
  if (!selectedId || !play) {
    return (
      <div style={styles.root}>
        <div style={styles.placeholder}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 16, opacity: 0.3 }}>
            <rect x="6" y="14" width="36" height="26" rx="3" stroke="#fff" strokeWidth="2" fill="none" />
            <line x1="6" y1="24" x2="42" y2="24" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="24" cy="37" r="3" fill="#fff" opacity="0.5" />
          </svg>
          <span style={styles.placeholderText}>Sélectionnez un jeu pour éditer</span>
        </div>
      </div>
    )
  }

  const positions = getPositions(play)

  function handleCoordChange(posKey, axis, rawValue) {
    const parsed = parseFloat(rawValue)
    if (isNaN(parsed)) return
    // Clamp to 0–100 (percentage-based coordinate space)
    const clamped = Math.min(100, Math.max(0, parsed))
    const existing = positions[posKey] || { x: 50, y: 50 }
    updatePlay(play.id, {
      positions: {
        [posKey]: { ...existing, [axis]: clamped },
      },
    })
  }

  // --- play loaded ---
  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.playName}>{play.name}</span>
        <span style={styles.badge}>{play.type === 'run' ? 'Course' : 'Passe'}</span>
        <span style={styles.formation}>{play.formation}</span>
      </div>

      {/* Diagram */}
      <div style={styles.diagramWrap}>
        <div style={styles.diagramInner}>
          <PlayDiagram play={play} width={560} height={374} />
        </div>
      </div>

      {/* Position editor */}
      <div style={styles.editorSection}>
        <div style={styles.editorTitle}>Positions des joueurs</div>
        <div style={styles.hint}>
          Coordonnées en % du terrain (0 = gauche/haut, 100 = droite/bas)
        </div>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Joueur</th>
                <th style={{ ...styles.th, width: 90 }}>X (horiz.)</th>
                <th style={{ ...styles.th, width: 90 }}>Y (vert.)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(positions).map(([key, pos]) => (
                <PositionRow
                  key={key}
                  posKey={key}
                  label={PLAYER_LABELS[key] || key}
                  pos={pos}
                  onChange={handleCoordChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PositionRow({ posKey, label, pos, onChange }) {
  // Local state so the input is editable while typing, only commits on blur/enter.
  const [xVal, setXVal] = useState(String(pos.x))
  const [yVal, setYVal] = useState(String(pos.y))

  // Keep local state in sync when the store updates from outside.
  useEffect(() => { setXVal(String(pos.x)) }, [pos.x])
  useEffect(() => { setYVal(String(pos.y)) }, [pos.y])

  function commit(axis, value) {
    onChange(posKey, axis, value)
  }

  return (
    <tr style={styles.tr}>
      <td style={styles.tdLabel}>{label}</td>
      <td style={styles.tdInput}>
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={xVal}
          style={styles.coordInput}
          onChange={e => setXVal(e.target.value)}
          onBlur={e => commit('x', e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
      </td>
      <td style={styles.tdInput}>
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={yVal}
          style={styles.coordInput}
          onChange={e => setYVal(e.target.value)}
          onBlur={e => commit('y', e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
      </td>
    </tr>
  )
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: '#0F1923',
    overflowY: 'auto',
  },

  // --- placeholder ---
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    minHeight: 320,
    gap: 0,
  },
  placeholderText: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  // --- header ---
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  playName: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  badge: {
    background: 'rgba(232,82,26,0.2)',
    color: '#E8521A',
    borderRadius: '4px',
    padding: '0.15rem 0.55rem',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  formation: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },

  // --- diagram ---
  diagramWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.25rem 1rem 1rem',
    flexShrink: 0,
  },
  diagramInner: {
    width: '100%',
    maxWidth: 560,
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
  },

  // --- position editor ---
  editorSection: {
    padding: '0 1.25rem 1.5rem',
    flex: 1,
  },
  editorTitle: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    marginBottom: '0.3rem',
  },
  hint: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.2)',
    marginBottom: '0.75rem',
    letterSpacing: '0.02em',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.82rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  tdLabel: {
    padding: '0.45rem 0.75rem',
    color: 'rgba(255,255,255,0.75)',
    fontWeight: 600,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  },
  tdInput: {
    padding: '0.3rem 0.5rem',
  },
  coordInput: {
    width: '72px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '5px',
    padding: '0.3rem 0.5rem',
    color: '#fff',
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '0.85rem',
    outline: 'none',
    textAlign: 'right',
    appearance: 'textfield',
    MozAppearance: 'textfield',
  },
}
