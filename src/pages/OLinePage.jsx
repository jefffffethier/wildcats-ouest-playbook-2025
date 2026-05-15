import { useState } from 'react'
import OLineDiagram from '../components/OLineDiagram.jsx'
import GapConceptDiagram from '../components/GapConceptDiagram.jsx'
import { DIVE_SCHEMES, CONCEPTS } from '../data/olineSchemes.js'
import './OLinePage.css'

const CONCEPTS_REGISTRY = [
  { id: 'dive', label: 'Dive', schemes: DIVE_SCHEMES },
]

const DIRECTION_OPTS = [
  { key: 'left',  label: 'Gauche' },
  { key: 'right', label: 'Droite' },
]

const SITUATION_OPTS = [
  { key: 'normal', label: 'Normal' },
  { key: 'blitz',  label: 'Blitz'  },
]

const GAP_FILTER_OPTS = [
  { key: 'a', label: 'Alpha', color: '#E8521A' },
  { key: 'b', label: 'Bob',   color: '#A08840' },
  { key: 'c', label: 'Charlie', color: '#3B9EE8' },
]

const GAP_COLORS = {
  'A GAP': '#E8521A',
  'B GAP': '#A08840',
  'C GAP': '#3B9EE8',
}

const PREFS_KEY = 'wc_oline_prefs'

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY))
    if (saved && saved.concept && saved.direction && saved.situation) {
      return {
        concept: saved.concept,
        direction: saved.direction,
        situation: saved.situation,
        diagramDirection: saved.diagramDirection || 'left',
        gap: GAP_FILTER_OPTS.some(o => o.key === saved.gap) ? saved.gap : 'a',
      }
    }
  } catch {}
  return { concept: CONCEPTS_REGISTRY[0].id, direction: 'left', situation: 'normal', diagramDirection: 'left', gap: 'a' }
}

export default function OLinePage({ onLock, onNavigate }) {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function updatePrefs(patch) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  }

  const activeEntry = CONCEPTS_REGISTRY.find(c => c.id === prefs.concept) || CONCEPTS_REGISTRY[0]
  const schemes = activeEntry.schemes[prefs.direction][prefs.situation]
  const filteredSchemes = schemes.filter(s => s.gap === `${prefs.gap.toUpperCase()} GAP`)

  const dirLabel = DIRECTION_OPTS.find(d => d.key === prefs.direction)?.label ?? ''

  return (
    <div className="ol-root">

      {/* ── Sidebar ── */}
      <aside className={`ol-sidebar no-print${sidebarOpen ? '' : ' ol-sidebar--collapsed'}`}>
        <button className="ol-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} title={sidebarOpen ? 'Réduire' : 'Ouvrir'}>
          {sidebarOpen ? '‹' : '›'}
        </button>

        {sidebarOpen && <>
          <div className="ol-sidebar-header">
            <div className="ol-logo-mark">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <polygon points="24,4 44,44 4,44" fill="#E8521A" opacity="0.2" />
                <polygon points="24,4 44,44 4,44" fill="none" stroke="#E8521A" strokeWidth="2" />
                <text x="24" y="34" textAnchor="middle" fill="#E8521A" fontSize="18"
                      fontWeight="800" fontFamily="Barlow Condensed">W</text>
              </svg>
            </div>
            <div>
              <div className="ol-team-name">WILDCATS SUD</div>
              <div className="ol-season">Moustique 2025</div>
            </div>
          </div>

          <div className="ol-divider" />

          <div className="ol-filter-section">
            <div className="ol-filter-label">NAVIGATION</div>
            <button className="ol-filter-btn ol-filter-btn--active">
              Ligne Offensive
            </button>
            <button className="ol-filter-btn" onClick={() => onNavigate('playbook')}>
              Livre de Jeu
            </button>
          </div>

          <div className="ol-divider" />

          <div className="ol-filter-section">
            <div className="ol-filter-label">SECTION</div>
            <div className="ol-section-chip">Course à l'intérieur</div>
            <div className="ol-section-sub">{activeEntry.label} — {dirLabel}</div>
          </div>

          <div className="ol-sidebar-footer">
            <button className="ol-lock-btn" onClick={onLock}>Verrouiller</button>
          </div>
        </>}
      </aside>

      {/* ── Main ── */}
      <main className="ol-main">

        {/* Page header */}
        <div className="ol-page-header no-print">
          <div>
            <h1 className="ol-page-title">Ligne Offensive</h1>
            <p className="ol-page-subtitle">{activeEntry.label} — Courses à l'intérieur — {dirLabel}</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="ol-concept-box">
          <h2 className="ol-concept-title">Concept de base — Identification des GAPs</h2>
          <div className="ol-concept-text" dangerouslySetInnerHTML={{ __html: CONCEPTS.intro }} />
          <h2 className="ol-concept-title">CODES</h2>
          <div className="ol-gap-row">
            {CONCEPTS.gaps.map(g => (
              <div key={g.code} className="ol-gap-card" style={{ borderTopColor: GAP_COLORS[g.gap] }}>
                <div className="ol-gap-code" style={{ color: GAP_COLORS[g.gap] }}>{g.code}</div>
                <div className="ol-gap-gap">On court dans le <b>{g.gap}</b></div>
                <div className="ol-gap-desc">{g.desc}</div>
                {g.note && <div className="ol-gap-note">{g.note}</div>}
              </div>
            ))}
          </div>
          <div className="ol-diagram-header">
            <span className="ol-toggle-label">COURSE CÔTÉ :</span>
            <div className="ol-toggle-group">
              {DIRECTION_OPTS.map(opt => (
                <button
                  key={opt.key}
                  className={`ol-toggle-btn${prefs.diagramDirection === opt.key ? ' ol-toggle-btn--active' : ''}`}
                  onClick={() => updatePrefs({ diagramDirection: opt.key })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <GapConceptDiagram direction={prefs.diagramDirection} />
        </div>

        {/* Concept tabs + Direction + Situation togglers */}
        <div className="ol-control-bar no-print">

          {/* Concept tabs */}
          <div className="ol-concept-row">
            <span className="ol-toggle-label">Jeu :</span>
            <div className="ol-toggle-group">
              {CONCEPTS_REGISTRY.map(c => (
                <button
                  key={c.id}
                  className={`ol-toggle-btn${prefs.concept === c.id ? ' ol-toggle-btn--active' : ''}`}
                  onClick={() => updatePrefs({ concept: c.id })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direction + Gap filter + Situation on the same row */}
          <div className="ol-toggle-row">
            <span className="ol-toggle-label">DIRECTION :</span>
            <div className="ol-toggle-group">
              {DIRECTION_OPTS.map(opt => (
                <button
                  key={opt.key}
                  className={`ol-toggle-btn${prefs.direction === opt.key ? ' ol-toggle-btn--active' : ''}`}
                  onClick={() => updatePrefs({ direction: opt.key })}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="ol-toggle-label ol-toggle-label--spaced">GAP :</span>
            <div className="ol-toggle-group">
              {GAP_FILTER_OPTS.map(opt => (
                <button
                  key={opt.key}
                  className="ol-toggle-btn"
                  style={prefs.gap === opt.key ? { background: opt.color, color: '#fff' } : undefined}
                  onClick={() => updatePrefs({ gap: opt.key })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
{/* 
            <span className="ol-toggle-label ol-toggle-label--spaced">SITUATION :</span>
            <div className="ol-toggle-group">
              {SITUATION_OPTS.map(opt => (
                <button
                  key={opt.key}
                  className={`ol-toggle-btn${prefs.situation === opt.key ? ' ol-toggle-btn--active' : ''}`}
                  onClick={() => updatePrefs({ situation: opt.key })}
                >
                  {opt.label}
                  {opt.key === 'blitz' && prefs.situation === 'blitz' && (
                    <span className="ol-blitz-dot" />
                  )}
                </button>
              ))}
            </div> */}
          </div>

        </div>

        {/* Scheme cards */}
        <div
          className="ol-scheme-grid"
          style={{ gridTemplateColumns: `repeat(${Math.max(filteredSchemes.length, 1)}, 1fr)` }}
        >
          {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="ol-scheme-card">
              <div className="ol-card-header">
                <span className="ol-gap-badge" style={{ background: GAP_COLORS[scheme.gap] }}>
                  {scheme.gap}
                </span>
                <span className="ol-code-badge">{scheme.code}</span>
                {prefs.situation === 'blitz' && <span className="ol-blitz-badge">BLITZ</span>}
              </div>

              <OLineDiagram scheme={scheme} />

              <div className="ol-assignment-list">
                {scheme.assignments.map((a, i) => (
                  <div key={i} className="ol-assignment-row">
                    <span className="ol-player-badge">{a.player}</span>
                    <span className="ol-assignment-text">{a.text}</span>
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
