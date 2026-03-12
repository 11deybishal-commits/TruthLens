import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      background: '#111120', padding: '40px',
      textAlign: 'center', borderTop: '1px solid #1e1e3a'
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 22, letterSpacing: 5, color: '#2a2a4a',
        marginBottom: 10
      }}>TRUTHLENS</div>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, color: '#2a2a4a', letterSpacing: 2
      }}>
        POWERED BY CLAUDE AI · ALWAYS VERIFY WITH PRIMARY SOURCES
      </p>
      <p style={{ color: '#2a2a4a', fontSize: 12, marginTop: 8 }}>
        Built to fight misinformation · MIT License
      </p>
    </footer>
  )
}
