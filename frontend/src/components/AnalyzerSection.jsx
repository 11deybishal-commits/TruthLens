import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VERDICT_CONFIG = {
  CREDIBLE:          { color: '#2a9d8f', bg: '#2a9d8f12', label: 'Credible',          icon: '✓', border: '#2a9d8f40' },
  LIKELY_CREDIBLE:   { color: '#52b788', bg: '#52b78812', label: 'Likely Credible',   icon: '~', border: '#52b78840' },
  UNCERTAIN:         { color: '#e9c46a', bg: '#e9c46a12', label: 'Uncertain',         icon: '?', border: '#e9c46a40' },
  LIKELY_MISLEADING: { color: '#f4a261', bg: '#f4a26112', label: 'Likely Misleading', icon: '!', border: '#f4a26140' },
  MISLEADING:        { color: '#e63946', bg: '#e6394612', label: 'Misleading',        icon: '✗', border: '#e6394640' },
}

const BIAS_COLORS = {
  FAR_LEFT: '#4e8ef7', LEFT: '#6faef9', CENTER_LEFT: '#90c4fa',
  CENTER: '#888', CENTER_RIGHT: '#f9b490', RIGHT: '#f97d6f',
  FAR_RIGHT: '#e63946', UNKNOWN: '#aaa'
}

const ASSESSMENT_COLORS = {
  VERIFIED: '#2a9d8f', UNVERIFIED: '#e9c46a',
  FALSE: '#e63946', MISLEADING: '#f4a261', OPINION: '#9b72cf'
}

function ScoreRing({ score, color }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let start = null
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / 1200, 1)
      setDisplayed(Math.round(progress * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  return (
    <div style={{ position: 'relative', width: 136, height: 136, flexShrink: 0 }}>
      <svg width="136" height="136" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="68" cy="68" r={radius} fill="none" stroke="#e8e0d4" strokeWidth="10" />
        <motion.circle
          cx="68" cy="68" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (displayed / 100) * circ }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color, lineHeight: 1 }}>{displayed}</span>
        <span style={{ fontSize: 10, color: '#aaa', letterSpacing: 2, textTransform: 'uppercase' }}>Score</span>
      </div>
    </div>
  )
}

function BiasBar({ rating }) {
  const positions = { FAR_LEFT: 4, LEFT: 16, CENTER_LEFT: 30, CENTER: 50, CENTER_RIGHT: 70, RIGHT: 84, FAR_RIGHT: 96, UNKNOWN: 50 }
  const pos = positions[rating] ?? 50
  const color = BIAS_COLORS[rating] ?? '#888'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: '#aaa', letterSpacing: 1 }}>
        <span>LEFT</span><span>CENTER</span><span>RIGHT</span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'linear-gradient(to right, #4e8ef7, #ddd, #e63946)' }}>
        <motion.div
          initial={{ left: '50%' }} animate={{ left: `${pos}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)',
            width: 16, height: 16, borderRadius: '50%',
            background: color, border: '3px solid #fff',
            boxShadow: `0 0 10px ${color}88`
          }}
        />
      </div>
      <div style={{
        textAlign: 'center', marginTop: 10, fontSize: 12,
        color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1
      }}>
        {rating?.replace(/_/g, ' ')}
      </div>
    </div>
  )
}

function ClaimCard({ claim, index }) {
  const color = ASSESSMENT_COLORS[claim.assessment] ?? '#888'
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: '#fff', border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`, borderRadius: 10,
        padding: '14px 18px', marginBottom: 10,
        boxShadow: '0 2px 8px #0000000a'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#333', lineHeight: 1.5, flex: 1 }}>"{claim.claim}"</p>
        <span style={{
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          color, background: `${color}15`, padding: '3px 10px',
          borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: 1
        }}>{claim.assessment}</span>
      </div>
      <p style={{ fontSize: 12, color: '#999', marginTop: 6, lineHeight: 1.5 }}>{claim.explanation}</p>
    </motion.div>
  )
}

function ScanningAnimation() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 24px' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            style={{
              position: 'absolute', inset: i * 10, borderRadius: '50%',
              border: `2px solid #e63946${['ff', '66', '22'][i]}`
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔍</div>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#e63946', letterSpacing: 3 }}
      >ANALYZING CONTENT...</motion.p>
      <p style={{ fontSize: 12, color: '#bbb', marginTop: 6 }}>Cross-referencing claims & detecting patterns</p>
    </div>
  )
}

const EXAMPLES = [
  'BREAKING: Scientists have discovered a cure for all cancers using household ingredients',
  'Government quietly passes law allowing mass surveillance of all citizens without warrant',
  'Study shows that 5G towers are linked to increased rates of illness in nearby residents',
]

export default function AnalyzerSection() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const resultRef = useRef(null)

  const analyze = async () => {
    if (!text.trim() || text.length < 10) return
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const verdict = result ? (VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG['UNCERTAIN']) : null

  return (
    <section id="analyzer" style={{ padding: '100px 40px 80px', maxWidth: 900, margin: '0 auto' }}>

      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: '#e63946', letterSpacing: 4, textTransform: 'uppercase',
            background: '#fde8ea', padding: '4px 16px', borderRadius: 20,
            display: 'inline-block', marginBottom: 20
          }}
        >AI-Powered Credibility Analysis</motion.span>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(70px, 11vw, 110px)',
          letterSpacing: 5, lineHeight: 0.9,
          color: '#1a1a2e', marginBottom: 20
        }}>
          TRUTH<span style={{ color: '#e63946' }}>LENS</span>
        </h1>

        <p style={{ fontSize: 17, color: '#777', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontWeight: 400 }}>
          Paste any headline or article. Get an instant{' '}
          <strong style={{ color: '#1a1a2e', fontWeight: 600 }}>credibility autopsy</strong>{' '}
          — bias detection, claim breakdown & manipulation analysis.
        </p>
      </motion.div>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: '#fff', border: '1px solid #e0d8cc',
          borderRadius: 20, padding: 28,
          boxShadow: '0 4px 40px #0000000d', marginBottom: 28
        }}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555', letterSpacing: 0.5, display: 'block', marginBottom: 10 }}>
          PASTE HEADLINE OR ARTICLE TEXT
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. BREAKING: Scientists discover that drinking coffee causes instant weight loss, study shows 100% success rate..."
          rows={5}
          style={{
            width: '100%', background: '#fafaf8',
            border: '1.5px solid #e0d8cc', borderRadius: 12,
            padding: '14px 16px', color: '#1a1a2e',
            fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1.6,
            resize: 'vertical', outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#e63946'}
          onBlur={e => e.target.style.borderColor = '#e0d8cc'}
        />

        {/* Example pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0' }}>
          <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>Try an example:</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setText(ex)}
              style={{
                background: '#f5f0e8', border: '1px solid #e0d8cc',
                borderRadius: 20, padding: '4px 14px', color: '#777',
                fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s', maxWidth: 200,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#e63946'; e.target.style.color = '#e63946' }}
              onMouseLeave={e => { e.target.style.borderColor = '#e0d8cc'; e.target.style.color = '#777' }}
            >
              Example {i + 1} →
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#ccc' }}>
            {text.length} characters
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={analyze}
            disabled={loading || text.length < 10}
            style={{
              background: text.length >= 10 && !loading
                ? 'linear-gradient(135deg, #e63946, #f4a261)'
                : '#e8e0d4',
              border: 'none', borderRadius: 12, padding: '13px 32px',
              color: text.length >= 10 && !loading ? '#fff' : '#bbb',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3,
              cursor: text.length >= 10 && !loading ? 'pointer' : 'not-allowed',
              boxShadow: text.length >= 10 && !loading ? '0 4px 20px #e6394640' : 'none',
              transition: 'all 0.3s'
            }}
          >
            {loading ? 'SCANNING...' : 'ANALYZE →'}
          </motion.button>
        </div>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 20, boxShadow: '0 4px 20px #0000000a' }}>
            <ScanningAnimation />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            background: '#fff5f5', border: '1px solid #e6394640',
            borderRadius: 12, padding: '16px 20px', color: '#e63946', fontSize: 14
          }}>
          ⚠ {error}
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div ref={resultRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Verdict Banner */}
            <div style={{
              background: verdict.bg, border: `1.5px solid ${verdict.border}`,
              borderRadius: 20, padding: '28px 30px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
              boxShadow: `0 4px 30px ${verdict.color}18`
            }}>
              <ScoreRing score={result.credibilityScore} color={verdict.color} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 44, color: verdict.color, lineHeight: 1, letterSpacing: 2
                  }}>{verdict.label.toUpperCase()}</span>
                  <span style={{ fontSize: 26, color: verdict.color }}>{verdict.icon}</span>
                </div>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, maxWidth: 500 }}>{result.summary}</p>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, background: '#f5f0e8', border: '1px solid #e0d8cc', borderRadius: 20, padding: '3px 12px', color: '#777' }}>
                    🎭 {result.emotionalTone}
                  </span>
                  <span style={{ fontSize: 12, background: '#f5f0e8', border: '1px solid #e0d8cc', borderRadius: 20, padding: '3px 12px', color: '#777' }}>
                    ⚖️ {result.biasRating?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 18 }}>

              {/* Bias */}
              <div style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 12px #0000000a' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#aaa', marginBottom: 18 }}>POLITICAL BIAS</h3>
                <BiasBar rating={result.biasRating} />
              </div>

              {/* Red Flags */}
              <div style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 12px #0000000a' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#aaa', marginBottom: 16 }}>RED FLAGS</h3>
                {result.redFlags?.length > 0 ? result.redFlags.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>▲</span>
                    <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{f}</span>
                  </div>
                )) : <p style={{ color: '#ccc', fontSize: 13 }}>No significant red flags found.</p>}
              </div>

              {/* Positives */}
              <div style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 12px #0000000a' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#aaa', marginBottom: 16 }}>POSITIVE SIGNALS</h3>
                {result.positives?.length > 0 ? result.positives.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#2a9d8f', fontSize: 13, marginTop: 2 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{p}</span>
                  </div>
                )) : <p style={{ color: '#ccc', fontSize: 13 }}>No strong positive signals found.</p>}
              </div>

              {/* Manipulation Techniques */}
              <div style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 16, padding: '22px 24px', boxShadow: '0 2px 12px #0000000a' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#aaa', marginBottom: 16 }}>MANIPULATION TACTICS</h3>
                {result.writingTechniques?.length > 0 ? result.writingTechniques.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#f4a261', fontSize: 13, marginTop: 2 }}>◆</span>
                    <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{t}</span>
                  </div>
                )) : <p style={{ color: '#ccc', fontSize: 13 }}>No manipulation techniques detected.</p>}
              </div>
            </div>

            {/* Claims Breakdown */}
            {result.claimsBreakdown?.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e0d8cc', borderRadius: 16, padding: '24px', marginBottom: 18, boxShadow: '0 2px 12px #0000000a' }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: '#aaa', marginBottom: 16 }}>CLAIMS BREAKDOWN</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {Object.entries(ASSESSMENT_COLORS).map(([k, v]) => (
                    <span key={k} style={{ fontSize: 11, color: v, background: `${v}12`, border: `1px solid ${v}30`, borderRadius: 20, padding: '3px 12px', fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
                  ))}
                </div>
                {result.claimsBreakdown.map((c, i) => <ClaimCard key={i} claim={c} index={i} />)}
              </div>
            )}

            {/* Recommended Action */}
            {result.recommendedAction && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{
                  background: 'linear-gradient(135deg, #fff9ee, #fff5f0)',
                  border: '1.5px solid #f4a26140', borderRadius: 16,
                  padding: '22px 26px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  marginBottom: 24
                }}
              >
                <span style={{ fontSize: 28 }}>💡</span>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, color: '#f4a261', marginBottom: 6 }}>RECOMMENDED ACTION</p>
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{result.recommendedAction}</p>
                </div>
              </motion.div>
            )}

            {/* Analyze Another */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => { setResult(null); setText(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  background: 'transparent', border: '1.5px solid #e0d8cc',
                  borderRadius: 12, padding: '12px 28px', color: '#aaa',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#e63946'; e.target.style.color = '#e63946' }}
                onMouseLeave={e => { e.target.style.borderColor = '#e0d8cc'; e.target.style.color = '#aaa' }}
              >
                ← ANALYZE ANOTHER
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
