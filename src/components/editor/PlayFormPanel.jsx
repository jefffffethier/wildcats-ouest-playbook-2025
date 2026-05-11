import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { getPlay, updatePlay, subscribe } from '../../store/playbookStore.js'

const POSITION_KEYS = [
  'QB', 'RB', 'SB',
  'WR_L', 'WR_R', 'WR_M',
  'C', 'LG', 'RG', 'LT', 'RT',
  'TE_L', 'TE_R',
]

// ─── Per-position Tiptap editor ──────────────────────────────────────────────

function AssignmentEditor({ pos, html, onBlur }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: html || '',
    onBlur: ({ editor: e }) => {
      onBlur(pos, e.getHTML())
    },
  })

  // Sync content when the parent play changes (selectedId switch)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = html || ''
    if (current !== incoming) {
      editor.commands.setContent(incoming, false)
    }
  }, [html, editor])

  return (
    <div style={styles.assignmentRow}>
      <div style={styles.posLabel}>{pos}</div>
      <div style={styles.editorWrapper}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export default function PlayFormPanel({ selectedId }) {
  const [play, setPlay] = useState(null)

  // Load & subscribe
  useEffect(() => {
    if (!selectedId) {
      setPlay(null)
      return
    }
    setPlay(getPlay(selectedId) ?? null)

    const unsub = subscribe(() => {
      setPlay(getPlay(selectedId) ?? null)
    })
    return unsub
  }, [selectedId])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleNameBlur(e) {
    if (!play) return
    const name = e.target.value.trim()
    if (name !== play.name) updatePlay(play.id, { name })
  }

  function handleFormationBlur(e) {
    if (!play) return
    const formation = e.target.value.trim()
    if (formation !== play.formation) updatePlay(play.id, { formation })
  }

  function handleTypeChange(e) {
    if (!play) return
    updatePlay(play.id, { type: e.target.value })
  }

  function handleSnapChange(e) {
    if (!play) return
    updatePlay(play.id, { snap: e.target.value })
  }

  const handleAssignmentBlur = useCallback((pos, html) => {
    if (!play) return
    updatePlay(play.id, { assignments: { [pos]: html } })
  }, [play])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!selectedId || !play) {
    return (
      <div style={styles.placeholder}>
        <span style={styles.placeholderIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6M9 16h6M9 8h6M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
          </svg>
        </span>
        <p style={styles.placeholderText}>Sélectionnez un jeu</p>
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      {/* ── Play identity ─────────────────────────────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Identité du jeu</div>

        <label style={styles.fieldLabel}>Nom</label>
        <input
          key={`name-${play.id}`}
          style={styles.input}
          defaultValue={play.name}
          onBlur={handleNameBlur}
        />

        <div style={styles.row}>
          <div style={styles.halfField}>
            <label style={styles.fieldLabel}>Type</label>
            <select
              style={styles.select}
              value={play.type}
              onChange={handleTypeChange}
            >
              <option value="pass">Passe</option>
              <option value="run">Course</option>
            </select>
          </div>

          <div style={styles.halfField}>
            <label style={styles.fieldLabel}>Snap</label>
            <select
              style={styles.select}
              value={play.snap}
              onChange={handleSnapChange}
            >
              <option value="down">Down</option>
              <option value="sur2">Sur 2</option>
            </select>
          </div>
        </div>

        <label style={styles.fieldLabel}>Formation</label>
        <input
          key={`formation-${play.id}`}
          style={styles.input}
          defaultValue={play.formation}
          onBlur={handleFormationBlur}
        />
      </div>

      {/* ── Assignments ───────────────────────────────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Assignations</div>
        <div style={styles.tiptapGlobals} />
        {POSITION_KEYS.map(pos => (
          <AssignmentEditor
            key={`${play.id}-${pos}`}
            pos={pos}
            html={play.assignments?.[pos] ?? ''}
            onBlur={handleAssignmentBlur}
          />
        ))}
      </div>

      <style>{tiptapCSS}</style>
    </div>
  )
}

// ─── Tiptap content styles ────────────────────────────────────────────────────

const tiptapCSS = `
  .ProseMirror {
    outline: none;
    min-height: 2rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: rgba(255,255,255,0.85);
    line-height: 1.5;
  }
  .ProseMirror p {
    margin: 0;
  }
  .ProseMirror p + p {
    margin-top: 0.25rem;
  }
  .ProseMirror strong { color: #fff; }
  .ProseMirror em { color: rgba(255,255,255,0.7); }
`

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    background: 'var(--dark)',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'var(--font-body)',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '0.75rem',
    color: 'rgba(255,255,255,0.2)',
    background: 'var(--dark)',
  },
  placeholderIcon: {
    opacity: 0.4,
  },
  placeholderText: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.9rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  section: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    marginBottom: '0.75rem',
  },
  fieldLabel: {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '0.25rem',
    marginTop: '0.6rem',
  },
  input: {
    display: 'block',
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '0.45rem 0.65rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none',
  },
  select: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '0.45rem 0.65rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: '#fff',
    outline: 'none',
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  halfField: {
    flex: 1,
  },
  assignmentRow: {
    display: 'flex',
    gap: '0.65rem',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  posLabel: {
    flexShrink: 0,
    width: '48px',
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.4)',
    paddingTop: '0.35rem',
    textAlign: 'right',
  },
  editorWrapper: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '5px',
    padding: '0.3rem 0.6rem',
    minHeight: '2.2rem',
  },
}
