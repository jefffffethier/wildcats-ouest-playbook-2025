import { useRef, useState } from 'react'
import { exportPlaybook, importPlaybook } from '../../store/playbookStore.js'

/**
 * ExportImportControls
 * Toolbar buttons for exporting the playbook to JSON and importing from JSON.
 * No props needed — reads/writes the playbook store directly.
 */
export default function ExportImportControls() {
  const fileInputRef = useRef(null)
  const [successMsg, setSuccessMsg] = useState('')

  // ── Export ───────────────────────────────────────────────────────────────

  function handleExport() {
    const json = exportPlaybook()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wildcats-playbook.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Import ───────────────────────────────────────────────────────────────

  function handleImportClick() {
    fileInputRef.current.value = ''   // reset so same file can be re-selected
    fileInputRef.current.click()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const confirmed = window.confirm(
      'Importer écrasera le livre de jeu actuel. Continuer ?'
    )
    if (!confirmed) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        importPlaybook(event.target.result)
        setSuccessMsg('Importation réussie !')
        setTimeout(() => setSuccessMsg(''), 3000)
      } catch (err) {
        alert('Erreur lors de l\'importation : ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      <button style={styles.btnExport} onClick={handleExport} title="Exporter le livre de jeu en JSON">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 5 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Exporter
      </button>

      <button style={styles.btnImport} onClick={handleImportClick} title="Importer un livre de jeu depuis un fichier JSON">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 5 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 5 17 10"/>
          <line x1="12" y1="5" x2="12" y2="17"/>
        </svg>
        Importer
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="import-file-input"
      />

      {/* Brief success message */}
      {successMsg && (
        <span style={styles.successMsg} role="status">
          {successMsg}
        </span>
      )}
    </div>
  )
}

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  border: 'none',
  borderRadius: '6px',
  padding: '0.35rem 0.75rem',
  fontSize: '0.78rem',
  fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
  fontWeight: 700,
  letterSpacing: '0.05em',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  lineHeight: 1,
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnExport: {
    ...btnBase,
    background: '#E8521A',       // orange
    color: '#fff',
  },
  btnImport: {
    ...btnBase,
    background: 'rgba(232,82,26,0.15)',
    color: '#E8521A',
    border: '1px solid rgba(232,82,26,0.4)',
  },
  successMsg: {
    fontSize: '0.75rem',
    color: '#3dba7a',
    fontFamily: 'var(--font-body, sans-serif)',
    marginLeft: '0.25rem',
  },
}
