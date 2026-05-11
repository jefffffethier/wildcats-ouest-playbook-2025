import { useState, useEffect } from 'react'
import PasswordGate from './components/PasswordGate.jsx'
import PlaybookPage from './pages/PlaybookPage.jsx'
import OLinePage from './pages/OLinePage.jsx'

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

  return page === 'oline'
    ? <OLinePage    onLock={handleLock} onNavigate={setPage} />
    : <PlaybookPage onLock={handleLock} onNavigate={setPage} />
}
