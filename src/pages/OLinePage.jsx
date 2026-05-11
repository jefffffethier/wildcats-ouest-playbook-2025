import { useState } from 'react'
import OLineDiagram from '../components/OLineDiagram.jsx'
import { DIVE_LEFT_SCHEMES, CONCEPTS } from '../data/olineSchemes.js'

const SITUATION_OPTS = [
  { key: 'normal', label: 'Normal' },
  { key: 'blitz',  label: 'Blitz'  },
]

const GAP_COLORS = {
  'A GAP': '#E8521A',
  'B GAP': '#A08840',
  'C GAP': '#3B9EE8',
}

export default function OLinePage({ onLock, onNavigate }) {
  const [situation, setSituation] = useState('normal')
  const schemes = DIVE_LEFT_SCHEMES[situation]

  return (
    <div style={s.root}>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar} className="no-print">
        <div style={s.sidebarHeader}>
          <div style={s.logoMark}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <polygon points="24,4 44,44 4,44" fill="#E8521A" opacity="0.2" />
              <polygon points="24,4 44,44 4,44" fill="none" stroke="#E8521A" strokeWidth="2" />
              <text x="24" y="34" textAnchor="middle" fill="#E8521A" fontSize="18"
                    fontWeight="800" fontFamily="Barlow Condensed">W</text>
            </svg>
          </div>
          <div>
            <div style={s.teamName}>WILDCATS SUD</div>
            <div style={s.season}>Moustique 2025</div>
          </div>
        </div>

        <div style={s.divider} />

        <div style={s.filterSection}>
          <div style={s.filterLabel}>NAVIGATION</div>
          <button style={s.filterBtn} onClick={() => onNavigate('playbook')}>
            Livre de Jeu
          </button>
          <button style={{ ...s.filterBtn, ...s.filterBtnActive }}>
            Ligne Offensive
          </button>
        </div>

        <div style={s.divider} />

        <div style={s.filterSection}>
          <div style={s.filterLabel}>SECTION</div>
          <div style={s.sectionChip}>Course à l'intérieur</div>
          <div style={s.sectionSub}>Dive — Gauche</div>
        </div>

        <div style={s.sidebarFooter}>
          <button style={s.lockBtn} onClick={onLock}>Verrouiller</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>

        {/* Page header */}
        <div style={s.pageHeader} className="no-print">
          <div>
            <h1 style={s.pageTitle}>Ligne Offensive</h1>
            <p style={s.pageSubtitle}>Dive — Courses à l'intérieur</p>
          </div>
        </div>

        {/* Concept box */}
        <div style={s.conceptBox}>
          <div style={s.conceptTitle}>Concept de base — Identification des GAPs</div>
          <p style={s.conceptText}>{CONCEPTS.intro}</p>
          <div style={s.gapRow}>
            {CONCEPTS.gaps.map(g => (
              <div key={g.code} style={{ ...s.gapCard, borderTopColor: GAP_COLORS[g.gap] }}>
                <div style={{ ...s.gapCode, color: GAP_COLORS[g.gap] }}>{g.code}</div>
                <div style={s.gapGap}>{g.gap}</div>
                <div style={s.gapDesc}>{g.desc}</div>
                {g.note && <div style={s.gapNote}>{g.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Situation toggle */}
        <div style={s.toggleRow} className="no-print">
          <span style={s.toggleLabel}>SITUATION :</span>
          <div style={s.toggleGroup}>
            {SITUATION_OPTS.map(opt => (
              <button
                key={opt.key}
                style={{ ...s.toggleBtn, ...(situation === opt.key ? s.toggleBtnActive : {}) }}
                onClick={() => setSituation(opt.key)}
              >
                {opt.label}
                {opt.key === 'blitz' && situation === 'blitz' && (
                  <span style={s.blitzDot} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme cards */}
        <div style={s.schemeGrid}>
          {schemes.map(scheme => (
            <div key={scheme.id} style={s.schemeCard}>
              <div style={s.cardHeader}>
                <span style={{ ...s.gapBadge, background: GAP_COLORS[scheme.gap] }}>
                  {scheme.gap}
                </span>
                <span style={s.codeBadge}>{scheme.code}</span>
                {situation === 'blitz' && <span style={s.blitzBadge}>BLITZ</span>}
              </div>

              <OLineDiagram scheme={scheme} />

              <div style={s.assignmentList}>
                {scheme.assignments.map((a, i) => (
                  <div key={i} style={s.assignmentRow}>
                    <span style={s.playerBadge}>{a.player}</span>
                    <span style={s.assignmentText}>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}

const s = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--surface)',
  },

  /* ── Sidebar ── */
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: 'var(--dark)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflow: 'auto',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem 1rem',
  },
  logoMark: { flexShrink: 0 },
  teamName: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.08em',
  },
  season: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.05em',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '0 1rem',
  },
  filterSection: {
    padding: '1rem 1rem 0.5rem',
  },
  filterLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '0.4rem',
  },
  filterBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    padding: '0.45rem 0.75rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.55)',
    cursor: 'pointer',
    marginBottom: '2px',
  },
  filterBtnActive: {
    background: 'rgba(232,82,26,0.2)',
    color: '#E8521A',
  },
  sectionChip: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.7)',
    padding: '0.3rem 0',
  },
  sectionSub: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.3)',
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: '1rem',
  },
  lockBtn: {
    display: 'block',
    width: '100%',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '0.5rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textAlign: 'center',
  },

  /* ── Main ── */
  main: {
    flex: 1,
    padding: '2rem',
    minWidth: 0,
  },
  pageHeader: {
    marginBottom: '1.5rem',
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--navy)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    lineHeight: 1,
  },
  pageSubtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },

  /* ── Concept box ── */
  conceptBox: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
  },
  conceptTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
  },
  conceptText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.88rem',
    color: 'var(--navy)',
    marginBottom: '1rem',
  },
  gapRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  gapCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderTop: '3px solid',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  gapCode: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    marginBottom: '0.15rem',
  },
  gapGap: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  gapDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    color: 'var(--navy)',
  },
  gapNote: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.72rem',
    color: 'var(--orange)',
    marginTop: '0.3rem',
    fontStyle: 'italic',
  },

  /* ── Toggle ── */
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  toggleLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  toggleGroup: {
    display: 'flex',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    padding: '0.45rem 1.1rem',
    fontFamily: 'var(--font-display)',
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  toggleBtnActive: {
    background: 'var(--navy)',
    color: '#fff',
  },
  blitzDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#FF3B30',
  },

  /* ── Scheme cards ── */
  schemeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
  },
  schemeCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem 0.6rem',
    borderBottom: '1px solid var(--border)',
  },
  gapBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#fff',
    padding: '0.2rem 0.55rem',
    borderRadius: '4px',
  },
  codeBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--navy)',
    letterSpacing: '0.04em',
    flex: 1,
  },
  blitzBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#FF3B30',
    border: '1px solid #FF3B30',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
  },
  assignmentList: {
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  assignmentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  playerBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    background: 'var(--navy)',
    color: '#fff',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    flexShrink: 0,
    marginTop: '1px',
  },
  assignmentText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    color: 'var(--navy)',
    lineHeight: 1.4,
  },
}
