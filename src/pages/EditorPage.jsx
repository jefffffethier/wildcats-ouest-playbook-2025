export default function EditorPage({ onNavigate }) {
  return (
    <div style={styles.editorRoot}>
      <div style={styles.toolbar}>
        <div id="editor-toolbar-export" />
        <button
          style={styles.backBtn}
          onClick={() => onNavigate('playbook')}
        >
          ← Livre de Jeu
        </button>
      </div>
      <div style={styles.editorBody}>
        <div id="editor-sidebar" style={styles.sidebar}>
          {/* PlayListSidebar will render here */}
        </div>
        <div id="editor-canvas" style={styles.canvas}>
          {/* PlayCanvas will render here */}
        </div>
        <div id="editor-panel" style={styles.panel}>
          {/* PlayFormPanel will render here */}
        </div>
      </div>
    </div>
  )
}

const styles = {
  editorRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--surface)',
  },
  toolbar: {
    height: '48px',
    flexShrink: 0,
    background: 'var(--dark)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    gap: '0.75rem',
  },
  backBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: '0.35rem 0.85rem',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  editorBody: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '240px',
    flexShrink: 0,
    height: '100%',
    overflow: 'auto',
    background: 'var(--dark)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  },
  canvas: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    background: 'var(--surface)',
  },
  panel: {
    width: '320px',
    flexShrink: 0,
    height: '100%',
    overflow: 'auto',
    background: 'var(--dark)',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
  },
}
