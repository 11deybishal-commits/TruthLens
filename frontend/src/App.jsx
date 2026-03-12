import React from 'react'
import Navbar from './components/Navbar.jsx'
import AnalyzerSection from './components/AnalyzerSection.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import About from './components/About.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div style={{ background: '#f5f0e8', minHeight: '100vh' }}>
      <Navbar />
      <AnalyzerSection />
      <HowItWorks />
      <About />
      <Footer />
    </div>
  )
}
