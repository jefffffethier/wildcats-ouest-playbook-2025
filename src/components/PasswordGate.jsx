import { useState } from 'react'

const CORRECT_PASSWORD = '2025'

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (value === CORRECT_PASSWORD) {
      localStorage.setItem('wc_auth', '1')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.card, animation: shake ? 'shake 0.4s ease' : 'none' }}>
        <div style={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 44,44 4,44" fill="#E8521A" opacity="0.15" />
            <polygon points="24,4 44,44 4,44" fill="none" stroke="#E8521A" strokeWidth="2" />
            <text x="24" y="34" textAnchor="middle" fill="#E8521A" fontSize="18" fontWeight="800" fontFamily="Barlow Condensed">W</text>
          </svg>
        </div>
        <h1 style={styles.title}>WILDCATS SUD</h1>
        <p style={styles.subtitle}>Livre de Jeu Offensif 2025</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false) }}
            style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
            autoFocus
          />
          {error && <p style={styles.error}>Mot de passe incorrect</p>}
          <button type="submit" style={styles.button}>
            ENTRER
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--dark)',
    padding: '2rem',
  },
  card: {
    background: '#161F2E',
    border: '1px solid rgba(232,82,26,0.3)',
    borderRadius: '16px',
    padding: '3rem 2.5rem',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
  },
  logo: {
    marginBottom: '1.5rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.06em',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '2rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'var(--font-body)',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#E8521A',
  },
  error: {
    color: '#E8521A',
    fontSize: '0.8rem',
    margin: '-0.25rem 0 0',
  },
  button: {
    background: '#E8521A',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s',
  },
}
