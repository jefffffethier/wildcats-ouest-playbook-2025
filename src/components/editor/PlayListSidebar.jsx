import { useState, useEffect } from 'react'
import {
  getPlays,
  addPlay,
  deletePlay,
  duplicatePlay,
  reorderPlays,
  subscribe,
} from '../../store/playbookStore.js'

const DEFAULT_PLAY = {
  name: 'Nouveau Jeu',
  type: 'pass',
  snap: 'down',
  formation: 'Double Tight',
  description: '',
  assignments: {},
}

const TYPE_BADGE = {
  run: { label: 'Course', bg: '#A08840', color: '#fff' },
  pass: { label: 'Passe', bg: '#1B2A4A', color: '#fff' },
}

export default function PlayListSidebar({ selectedId, onSelect }) {
  const [plays, setPlays] = useState(() => getPlays())

  useEffect(() => {
    const unsubscribe = subscribe(() => setPlays(getPlays()))
    return unsubscribe
  }, [])

  function handleAdd() {
    const play = addPlay({ ...DEFAULT_PLAY })
    onSelect(play.id)
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Supprimer ce jeu ?')) return
    deletePlay(id)
    if (selectedId === id) onSelect(null)
  }

  function handleDuplicate(e, id) {
    e.stopPropagation()
    const copy = duplicatePlay(id)
    if (copy) onSelect(copy.id)
  }

  function handleMoveUp(e, index) {
    e.stopPropagation()
    if (index === 0) return
    const ids = plays.map(p => p.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    reorderPlays(ids)
  }

  function handleMoveDown(e, index) {
    e.stopPropagation()
    if (index === plays.length - 1) return
    const ids = plays.map(p => p.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    reorderPlays(ids)
  }

  return (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerLabel}>JEUX</span>
        <span style={styles.count}>{plays.length}</span>
      </div>

      {/* Add button */}
      <div style={styles.addWrap}>
        <button style={styles.addBtn} onClick={handleAdd}>
          <span style={styles.addIcon}>+</span>
          Nouveau Jeu
        </button>
      </div>

      {/* Play list */}
      <div style={styles.list}>
        {plays.length === 0 && (
          <div style={styles.empty}>Aucun jeu</div>
        )}
        {plays.map((play, index) => {
          const isSelected = play.id === selectedId
          const badge = TYPE_BADGE[play.type] || TYPE_BADGE.pass

          return (
            <div
              key={play.id}
              style={{
                ...styles.row,
                ...(isSelected ? styles.rowSelected : {}),
              }}
              onClick={() => onSelect(play.id)}
            >
              {/* Name + badge */}
              <div style={styles.rowMain}>
                <span style={styles.playName}>{play.name}</span>
                <span
                  style={{
                    ...styles.badge,
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>

              {/* Action buttons */}
              <div style={styles.actions} onClick={e => e.stopPropagation()}>
                <button
                  style={styles.iconBtn}
                  title="Monter"
                  onClick={e => handleMoveUp(e, index)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  style={styles.iconBtn}
                  title="Descendre"
                  onClick={e => handleMoveDown(e, index)}
                  disabled={index === plays.length - 1}
                >
                  ↓
                </button>
                <button
                  style={styles.iconBtn}
                  title="Dupliquer"
                  onClick={e => handleDuplicate(e, play.id)}
                >
                  ⧉
                </button>
                <button
                  style={{ ...styles.iconBtn, ...styles.deleteBtn }}
                  title="Supprimer"
                  onClick={e => handleDelete(e, play.id)}
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '100%',
    height: '100%',
    background: '#1B2A4A',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0.875rem 0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  headerLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
  },
  count: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '1px 7px',
  },
  addWrap: {
    padding: '0.625rem 0.75rem 0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    width: '100%',
    background: '#E8521A',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: '1rem',
    lineHeight: 1,
    fontWeight: 400,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.25rem 0',
  },
  empty: {
    padding: '2rem 1rem',
    textAlign: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.25)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 0.5rem 0 0.75rem',
    height: '40px',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'background 0.1s',
    gap: '0.25rem',
  },
  rowSelected: {
    background: 'rgba(232,82,26,0.18)',
    borderLeft: '3px solid #E8521A',
  },
  rowMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  playName: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.85)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
  },
  badge: {
    flexShrink: 0,
    fontFamily: 'var(--font-display)',
    fontSize: '0.58rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: '3px',
    padding: '1px 5px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '3px',
    padding: 0,
    lineHeight: 1,
    transition: 'color 0.1s, background 0.1s',
  },
  deleteBtn: {
    fontSize: '1rem',
    color: 'rgba(232,82,26,0.5)',
  },
}
