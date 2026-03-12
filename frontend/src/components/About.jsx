import React from 'react'
import { motion } from 'framer-motion'

const stats = [
  { value: '6x', label: 'Faster spread of misinformation vs real news', color: '#e63946' },
  { value: '70%', label: 'Of people share articles without reading them', color: '#f4a261' },
  { value: '3B+', label: 'Fake news pieces shared daily on social media', color: '#2a9d8f' },
  { value: '59%', label: 'Adults cannot identify misinformation reliably', color: '#e76f51' },
]

export default function About() {
  return (
    <section id="about" style={{ background: '#1a1a2e', padding: '80px 40px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, color: '#f4a261', letterSpacing: 4,
            textTransform: 'uppercase',
            background: '#f4a26118', padding: '4px 14px', borderRadius: 20
          }}>Why This Matters</span>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 52, letterSpacing: 3,
            color: '#f5f0e8', marginTop: 14
          }}>THE MISINFORMATION CRISIS</h2>
          <p style={{ color: '#aaa', fontSize: 16, maxWidth: 500, margin: '10px auto 0', lineHeight: 1.7 }}>
            We built TruthLens because the ability to identify misinformation shouldn't require a journalism degree.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: '#12122a',
                border: `1px solid ${s.color}30`,
                borderTop: `3px solid ${s.color}`,
                borderRadius: 14, padding: '28px 22px',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 56, color: s.color, lineHeight: 1, letterSpacing: 2
              }}>{s.value}</div>
              <p style={{ color: '#aaa', fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 48, background: '#12122a',
            border: '1px solid #e6394630',
            borderRadius: 16, padding: '32px 36px',
            display: 'flex', gap: 24, alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ fontSize: 48 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28, letterSpacing: 2, color: '#f5f0e8', marginBottom: 8
            }}>OUR MISSION</h3>
            <p style={{ color: '#999', fontSize: 15, lineHeight: 1.7 }}>
              TruthLens uses Claude AI to give everyone the tools professional fact-checkers use —
              instantly, for free. We analyze writing style, source signals, emotional manipulation,
              and logical consistency so you can share with confidence.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
