import { useState, useEffect } from 'react'
import PasswordGate from './components/PasswordGate.jsx'
import EditorPasswordGate from './components/EditorPasswordGate.jsx'
import PlaybookPage from './pages/PlaybookPage.jsx'
import OLinePage from './pages/OLinePage.jsx'
import EditorPage from './pages/EditorPage.jsx'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [page, setPage] = useState('playbook')

  useEffect(() => {
    if (localStorage.getItem('wc_auth') === '1') setUnlocked(true)
  }, [])

  function handleLock() {
    localStorage.removeItem('wc_auth')
    setUnlocked(false)
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  if (page === 'editor') {
    return (
      <EditorPasswordGate>
        <EditorPage onNavigate={setPage} />
      </EditorPasswordGate>
    )
  }

  return page === 'oline'
    ? <OLinePage onLock={handleLock} onNavigate={setPage} />
    : <PlaybookPage onLock={handleLock} onNavigate={setPage} />
}
