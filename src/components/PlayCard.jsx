import PlayDiagram from './PlayDiagram.jsx'

const TYPE_COLORS = {
  run: { bg: '#1B2A4A', label: 'COURSE' },
  pass: { bg: '#2D5A27', label: 'PASSE' },
}

export default function PlayCard({ play }) {
  const typeStyle = TYPE_COLORS[play.type] || TYPE_COLORS.run

  return (
    <div style={styles.card} className="play-card page-break">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.formation}>{play.formation}</span>
          <h2 style={styles.playName}>{play.name}</h2>
          <p style={styles.description}>{play.description}</p>
        </div>
        <div style={styles.meta}>
          <span style={{ ...styles.typeBadge, background: typeStyle.bg }}>
            {typeStyle.label}
          </span>
          <span style={styles.snapBadge}>
            SUR: <strong>DOWN</strong>
          </span>
        </div>
      </div>

      {/* Diagram + Assignments side by side */}
      <div style={styles.body}>
        <div style={styles.diagramWrap}>
          <PlayDiagram play={play} />
        </div>
        <div style={styles.assignments}>
          <h3 style={styles.assignTitle}>ASSIGNATIONS</h3>
          <ul style={styles.assignList}>
            {Object.entries(play.assignments || {})
              .filter(([, html]) => html && html !== '<p></p>')
              .map(([pos, html]) => (
                <li key={pos} style={styles.assignItem}>
                  <span style={styles.bullet} />
                  <span>
                    <strong style={styles.posKey}>{pos}</strong>
                    {' — '}
                    <span dangerouslySetInnerHTML={{ __html: html }} />
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid rgba(15,25,35,0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '2rem',
    breakInside: 'avoid',
  },
  header: {
    background: 'var(--navy)',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  formation: {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--orange)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '0.2rem',
  },
  playName: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    lineHeight: 1,
    marginBottom: '0.4rem',
  },
  description: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.4,
    maxWidth: '380px',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.4rem',
    flexShrink: 0,
  },
  typeBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  snapBadge: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.05em',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
  },
  diagramWrap: {
    borderRight: '1px solid rgba(15,25,35,0.08)',
    padding: '1rem',
    background: '#f8f8f5',
  },
  assignments: {
    padding: '1.25rem 1.5rem',
  },
  assignTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: 'var(--orange)',
    marginBottom: '0.75rem',
  },
  assignList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  assignItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
    fontSize: '0.8rem',
    lineHeight: 1.4,
    color: 'var(--text)',
  },
  posKey: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--navy)',
  },
  bullet: {
    display: 'block',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: 'var(--orange)',
    flexShrink: 0,
    marginTop: '0.35rem',
  },
}
