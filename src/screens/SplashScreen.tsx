import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'glow' | 'fade'>('glow')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fade'), 2000)
    const t2 = setTimeout(() => onComplete(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'fade' ? (
        <motion.div
          key="splash"
          className="screen items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background radial glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(255,77,0,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}
          >
            {/* Compass icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="logo-pulse"
              style={{ width: 80, height: 80 }}
            >
              <svg viewBox="0 0 80 80" width="80" height="80">
                <circle cx="40" cy="40" r="36" fill="#242429" stroke="#FF4D00" strokeWidth="2" />
                <circle cx="40" cy="40" r="28" fill="#1A1A1F" />
                {/* Compass needle */}
                <polygon points="40,16 44,40 40,38 36,40" fill="#FF4D00" />
                <polygon points="40,64 44,40 40,42 36,40" fill="#5A5A6E" />
                <circle cx="40" cy="40" r="4" fill="#FF4D00" />
                {/* Cardinal directions */}
                <text x="40" y="13" textAnchor="middle" fill="#FF4D00" fontSize="8" fontFamily="Inter" fontWeight="700">N</text>
                <text x="40" y="70" textAnchor="middle" fill="#8A8A9A" fontSize="8" fontFamily="Inter">S</text>
                <text x="68" y="43" textAnchor="middle" fill="#8A8A9A" fontSize="8" fontFamily="Inter">E</text>
                <text x="12" y="43" textAnchor="middle" fill="#8A8A9A" fontSize="8" fontFamily="Inter">W</text>
              </svg>
            </motion.div>

            <div style={{ textAlign: 'center' }}>
              <motion.h1
                className="text-glow-orange"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#EFEFEF',
                  letterSpacing: '-1px',
                  margin: 0,
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Wander<span style={{ color: '#FF4D00' }}>Log</span>
              </motion.h1>
              <motion.p
                style={{ color: '#8A8A9A', fontSize: 14, margin: '6px 0 0', letterSpacing: '3px', textTransform: 'uppercase' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Travel Companion
              </motion.p>
            </div>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            style={{ position: 'absolute', bottom: 60, display: 'flex', gap: 8 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{ width: 6, height: 6, borderRadius: 3, background: '#FF4D00' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div key="fade" className="screen" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />
      )}
    </AnimatePresence>
  )
}
