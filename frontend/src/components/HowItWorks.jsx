import React from 'react'
import { motion } from 'framer-motion'

const steps = [
  {
    icon: '📋',
    title: 'Paste Content',
    desc: 'Copy any headline, article excerpt, tweet, or claim you want to verify.'
  },
  {
    icon: '🤖',
    title: 'AI Analysis',
    desc: 'Claude AI scans the text for bias patterns, logical fallacies, and emotional manipulation.'
  },
  {
    icon: '🔬',
    title: 'Claims Breakdown',
    desc: 'Every claim is individually assessed as Verified, Unverified, False, or Opinion.'
  },
  {
    icon: '📊',
    title: 'Get Your Report',
    desc: 'Receive a full credibility score, bias rating, red flags, and recommended action.'
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '80px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 52 }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: '#e63946', letterSpacing: 4,
          textTransform: 'uppercase',
          background: '#fde8ea', padding: '4px 14px', borderRadius: 20
        }}>How It Works</span>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 52, letterSpacing: 3,
          color: '#1a1a2e', marginTop: 14
        }}>FOUR STEPS TO CLARITY</h2>
        <p style={{ color: '#777', fontSize: 16, maxWidth: 460, margin: '10px auto 0', lineHeight: 1.7 }}>
          No sign-up, no fluff. Paste text and get an instant credibility verdict.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 24
      }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{
              background: '#fff',
              border: '1px solid #e8e0d4',
              borderRadius: 16,
              padding: '28px 24px',
              position: 'relative',
              boxShadow: '0 2px 20px #0000000a'
            }}
          >
            <div style={{
              position: 'absolute', top: -14, left: 24,
              background: '#e63946', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 13, letterSpacing: 2,
              padding: '2px 12px', borderRadius: 20
            }}>STEP {i + 1}</div>
            <div style={{ fontSize: 36, marginBottom: 14, marginTop: 8 }}>{step.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{step.title}</h3>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
