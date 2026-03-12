import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(245,240,232,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #e0d8cc' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 40px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #e63946, #f4a261)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16
        }}>🔍</div>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24, letterSpacing: 3,
          color: '#1a1a2e'
        }}>TRUTHLENS</span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {['Analyzer', 'How It Works', 'About'].map((link) => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            style={{
              color: '#555', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', letterSpacing: 0.3,
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.target.style.color = '#e63946'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >
            {link}
          </a>
        ))}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#1a1a2e', color: '#fff',
            padding: '7px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            textDecoration: 'none', letterSpacing: 0.5,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.target.style.background = '#e63946'}
          onMouseLeave={e => e.target.style.background = '#1a1a2e'}
        >
          GitHub ↗
        </a>
      </div>
    </motion.nav>
  )
}
