import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer'
import { useOnboardingStore } from '../../store/onboardingStore'

interface CharacterRevealProps {
  onComplete: () => void
}

export const CharacterReveal: React.FC<CharacterRevealProps> = ({ onComplete }) => {
  const { character } = useOnboardingStore()

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,77,0,0.2) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p style={{ color: '#FF8C42', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>
          Meet Your Traveller
        </p>

        {/* Glowing ring + avatar */}
        <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Animated orange ring */}
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: '3px solid #FF4D00',
              boxShadow: '0 0 30px rgba(255,77,0,0.6), 0 0 60px rgba(255,77,0,0.3)',
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
          {/* Outer ring */}
          <motion.div
            style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: '1px solid rgba(255,77,0,0.3)',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          />
          {/* Dashed ring */}
          <motion.div
            style={{
              position: 'absolute', inset: -24,
              borderRadius: '50%',
              border: '1px dashed rgba(255,77,0,0.15)',
            }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          />

          {/* Avatar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <AvatarRenderer config={character} size={160} />
          </motion.div>
        </div>

        {/* Name */}
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 28, fontWeight: 800, color: '#EFEFEF', margin: 0,
          }}>
            {character.displayName || 'Traveller'}
          </h1>
          {character.pronouns && (
            <p style={{ color: '#8A8A9A', fontSize: 14, margin: '4px 0 0' }}>{character.pronouns}</p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            {[character.outfit, character.expression, ...(character.accessories || [])].filter(Boolean).slice(0, 3).map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,77,0,0.12)', border: '1px solid rgba(255,77,0,0.3)',
                borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#FF8C42',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <button className="btn-primary" onClick={onComplete} style={{ fontSize: 16 }}>
            Looks good! Let's go 🚀
          </button>
          <button
            className="btn-ghost"
            onClick={() => window.history.back()}
            style={{ fontSize: 14, padding: '10px' }}
          >
            Edit character
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
