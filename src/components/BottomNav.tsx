import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calendar, DollarSign, User, Package, Image, Star, CheckSquare, BookOpen, X, AlertTriangle, MapPin, Users } from 'lucide-react'

interface SOSFABProps {
  onPress: () => void
}

interface BottomNavProps {
  activeScreen: string
  onNavigate: (screen: string) => void
}

// 5 primary tabs — SOS replaces Map
const PRIMARY_TABS = [
  { id: 'home',     icon: Home,          label: 'Home' },
  { id: 'expenses', icon: DollarSign,    label: 'Budget' },
  { id: 'splitwise',icon: Users,         label: 'Split' },
  { id: 'sos',      icon: AlertTriangle, label: 'SOS' },
  { id: 'profile',  icon: User,          label: 'Profile' },
]

// Secondary screens in the "More" drawer
const MORE_ITEMS = [
  { id: 'packing',   emoji: '🎒', label: 'Packing List',  color: '#FF8C42' },
  { id: 'gallery',   emoji: '📸', label: 'Gallery',       color: '#8B5CF6' },
  { id: 'wishlist',  emoji: '⭐', label: 'Wishlist',      color: '#F4C430' },
  { id: 'tickboard', emoji: '✅', label: 'Tick Board',    color: '#22C55E' },
  { id: 'map',       emoji: '🛰️', label: 'Live Map',      color: '#06B6D4' },
  { id: 'timeline',  emoji: '📅', label: 'Timeline',      color: '#22C55E' },
  { id: 'scrapbook', emoji: '📖', label: 'Scrapbook',     color: '#EC4899' },
]

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = MORE_ITEMS.some(i => i.id === activeScreen)

  const handleNavigate = (id: string) => {
    setShowMore(false)
    onNavigate(id)
  }

  return (
    <>
      {/* More drawer backdrop */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
              zIndex: 28,
            }}
          />
        )}
      </AnimatePresence>

      {/* More drawer */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            style={{
              position: 'absolute', bottom: 64, left: 0, right: 0, zIndex: 29,
              background: '#1A1A1F',
              borderRadius: '24px 24px 0 0',
              border: '1px solid #3A3A44',
              borderBottom: 'none',
              padding: '16px 20px 20px',
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#3A3A44', margin: '0 auto 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ color: '#8A8A9A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, margin: 0 }}>
                More
              </p>
              <button onClick={() => setShowMore(false)}
                style={{ background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#8A8A9A" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {MORE_ITEMS.map((item, i) => {
                const isActive = activeScreen === item.id
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleNavigate(item.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 6px', borderRadius: 14, cursor: 'pointer',
                      background: isActive ? `${item.color}14` : '#242429',
                      border: `1px solid ${isActive ? item.color + '50' : '#3A3A44'}`,
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {item.emoji}
                    </div>
                    <span style={{ fontSize: 10, color: isActive ? item.color : '#8A8A9A', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                      {item.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.15 }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
          background: 'rgba(20,20,25,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center',
          height: 64,
        }}
      >
        {/* Primary 4 tabs */}
        {PRIMARY_TABS.slice(0, 4).map(item => {
          const isActive = activeScreen === item.id
          const Icon = item.icon
          const isSOS = item.id === 'sos'
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => { setShowMore(false); onNavigate(item.id) }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px',
                position: 'relative', height: '100%', justifyContent: 'center',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 28, height: 3,
                    background: isSOS ? '#EF4444' : '#FF4D00',
                    borderRadius: '0 0 3px 3px',
                    boxShadow: `0 0 10px ${isSOS ? 'rgba(239,68,68,0.7)' : 'rgba(255,77,0,0.6)'}`,
                  }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  ...(isSOS && isActive ? {
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  } : {}),
                }}
              >
                <Icon
                  size={22}
                  color={isActive ? (isSOS ? '#EF4444' : '#FF4D00') : '#4A4A5A'}
                  style={isActive ? { filter: `drop-shadow(0 0 5px ${isSOS ? 'rgba(239,68,68,0.6)' : 'rgba(255,77,0,0.5)'})` } : undefined}
                />
              </motion.div>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 400,
                color: isActive ? (isSOS ? '#EF4444' : '#FF4D00') : '#4A4A5A',
                letterSpacing: isActive ? 0 : 0.2,
              }}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* More button */}
        <button
          id="nav-more"
          onClick={() => setShowMore(s => !s)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px',
            position: 'relative', height: '100%', justifyContent: 'center',
          }}
        >
          {(showMore || isMoreActive) && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 3, background: '#FF4D00',
                borderRadius: '0 0 3px 3px',
                boxShadow: '0 0 10px rgba(255,77,0,0.6)',
              }}
            />
          )}
          <motion.div
            animate={{ rotate: showMore ? 45 : 0, scale: showMore || isMoreActive ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 5px)', gap: '3px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: showMore || isMoreActive ? '#FF4D00' : '#4A4A5A',
                  boxShadow: showMore || isMoreActive ? '0 0 4px rgba(255,77,0,0.5)' : 'none',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
          </motion.div>
          <span style={{ fontSize: 10, color: showMore || isMoreActive ? '#FF4D00' : '#4A4A5A', fontWeight: showMore || isMoreActive ? 700 : 400 }}>
            More
          </span>
        </button>
      </motion.nav>
    </>
  )
}

export const SOSFAB: React.FC<SOSFABProps> = ({ onPress }) => {
  return (
    <motion.button
      id="sos-fab"
      onClick={onPress}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute',
        bottom: 76,
        left: 16,
        zIndex: 35,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
        border: '2px solid rgba(239,68,68,0.4)',
        boxShadow: '0 0 16px rgba(239,68,68,0.5), 0 4px 12px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2px solid rgba(239,68,68,0.5)',
          pointerEvents: 'none',
        }}
      />
      <AlertTriangle size={16} color="#fff" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
      <span style={{ fontSize: 7, fontWeight: 800, color: '#fff', letterSpacing: 0.5, lineHeight: 1 }}>SOS</span>
    </motion.button>
  )
}
