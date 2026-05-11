import { useState } from 'react'
import PlayCard from '../components/PlayCard.jsx'
import plays from '../data/plays.js'

export default function PlaybookPage({ onLock, onNavigate }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activePlay, setActivePlay] = useState(null)

  const formations = [...new Set(plays.map(p => p.formation))]

  const filtered = plays.filter(p => {
    const matchType = filter === 'all' || p.type === filter || p.formation === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  function handlePrint() {
    window.print()
  }

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar} className="no-print">
        <div style={styles.sidebarHeader}>
          <div style={styles.logoMark}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <polygon points="24,4 44,44 4,44" fill="#E8521A" opacity="0.2" />
              <polygon points="24,4 44,44 4,44" fill="none" stroke="#E8521A" strokeWidth="2" />
              <text x="24" y="34" textAnchor="middle" fill="#E8521A" fontSize="18" fontWeight="800" fontFamily="Barlow Condensed">W</text>
            </svg>
          </div>
          <div>
            <div style={styles.teamName}>WILDCATS SUD</div>
            <div style={styles.season}>Moustique 2025</div>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>NAVIGATION</div>
          <button style={styles.filterBtn} onClick={() => onNavigate && onNavigate('editor')}>
            Éditeur
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>TYPE</div>
          {[
            { key: 'all', label: 'Tous les jeux' },
            { key: 'run', label: 'Jeux de course' },
            { key: 'pass', label: 'Jeux de passe' },
          ].map(f => (
            <button
              key={f.key}
              style={{ ...styles.filterBtn, ...(filter === f.key ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>FORMATION</div>
          {formations.map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <button style={styles.printBtn} onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimer / PDF
          </button>
          <button style={styles.lockBtn} onClick={onLock}>
            Verrouiller
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar} className="no-print">
          <div>
            <h1 style={styles.pageTitle}>
              {filter === 'all' ? 'Tous les jeux' : filter}
            </h1>
            <p style={styles.pageCount}>{filtered.length} jeu{filtered.length !== 1 ? 'x' : ''}</p>
          </div>
          <input
            type="text"
            placeholder="Rechercher un jeu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Print header (only shows on print) */}
        <div style={styles.printHeader}>
          <div style={styles.printTitle}>WILDCATS SUD — Livre de Jeu Offensif 2025</div>
          <div style={styles.printSubtitle}>Moustique • CONFIDENTIEL</div>
        </div>

        {/* Play cards */}
        <div style={styles.cards}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>Aucun jeu trouvé</div>
          ) : (
            filtered.map(play => (
              <PlayCard key={play.id} play={play} />
            ))
          )}
        </div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { margin: 0 !important; padding: 1rem !important; }
          .print-header { display: block !important; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--surface)',
  },
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
    transition: 'all 0.15s',
    marginBottom: '2px',
  },
  filterBtnActive: {
    background: 'rgba(232,82,26,0.2)',
    color: '#E8521A',
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--orange)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    cursor: 'pointer',
  },
  lockBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '0.5rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    padding: '2rem',
    minWidth: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    gap: '1rem',
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
  pageCount: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
  searchInput: {
    background: '#fff',
    border: '1px solid rgba(15,25,35,0.15)',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '220px',
  },
  printHeader: {
    display: 'none',
    marginBottom: '1.5rem',
    borderBottom: '3px solid var(--navy)',
    paddingBottom: '0.75rem',
  },
  printTitle: {
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--navy)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  printSubtitle: {
    fontSize: '0.8rem',
    color: '#888',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  cards: {},
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-body)',
  },
}
