import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Edit3, LogOut, Plane, Image as ImageIcon, ChevronRight, Award, X } from 'lucide-react'
import { useOnboardingStore } from '../store/onboardingStore'
import { useTripStore } from '../store/tripStore'
import { AvatarRenderer } from '../components/avatar/AvatarRenderer'
import { CharacterWizard } from './onboarding/CharacterWizard'

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { character, userEmail, logout, characterComplete } = useOnboardingStore()
  const { activeTrip, gallery, expenses, packingItems, myRole } = useTripStore()
  const [editingCharacter, setEditingCharacter] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const stats = [
    { label: 'Trips', value: activeTrip ? 1 : 0, icon: '✈️' },
    { label: 'Photos', value: gallery.filter(p => p.revealed).length, icon: '📸' },
    { label: 'Expenses', value: expenses.length, icon: '💰' },
    { label: 'Packed', value: packingItems.filter(i => i.packed).length, icon: '✅' },
  ]

  if (editingCharacter) {
    return (
      <CharacterWizard onComplete={() => setEditingCharacter(false)} />
    )
  }

  return (
    <div className="screen">
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at top, rgba(255,77,0,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>
          Profile
        </h1>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '7px 12px', color: '#EF4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      {/* Avatar hero card */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, #242429, #2C2C33)',
          border: '1px solid #3A3A44', borderRadius: 24, padding: '28px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative',
        }}>
          {/* Glow ring behind avatar */}
          <div style={{
            position: 'absolute', width: 130, height: 130, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,77,0,0.15) 0%, transparent 70%)',
            top: 14,
          }} />

          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            border: '3px solid #FF4D00',
            background: '#1A1A1F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 0 20px rgba(255,77,0,0.3)',
          }}>
            {characterComplete ? (
              <AvatarRenderer config={character} size={94} showGlow />
            ) : (
              <User size={40} color="#5A5A6E" />
            )}
          </div>

          {/* Name & email */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>
              {character.displayName || 'Traveller'}
            </h2>
            {character.pronouns && (
              <p style={{ color: '#FF8C42', fontSize: 12, margin: '4px 0 0' }}>{character.pronouns}</p>
            )}
            {userEmail && (
              <p style={{ color: '#5A5A6E', fontSize: 13, margin: '4px 0 0' }}>{userEmail}</p>
            )}
          </div>

          {/* Role badge */}
          <div style={{
            background: myRole === 'owner' ? 'rgba(255,77,0,0.12)' : 'rgba(139,92,246,0.12)',
            border: `1px solid ${myRole === 'owner' ? 'rgba(255,77,0,0.3)' : 'rgba(139,92,246,0.3)'}`,
            borderRadius: 20, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{myRole === 'owner' ? '👑' : myRole === 'editor' ? '✏️' : '👁️'}</span>
            <span style={{ color: '#EFEFEF', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
              {activeTrip ? `${myRole} · ${activeTrip.name}` : 'No active trip'}
            </span>
          </div>

          {/* Edit character button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setEditingCharacter(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: 16,
              background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
              color: '#FF4D00', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Edit3 size={15} /> Edit My Character
          </motion.button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <p style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          Your Stats
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ background: '#242429', borderRadius: 14, border: '1px solid #3A3A44', padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: '#FF4D00', margin: 0 }}>{stat.value}</p>
              <p style={{ color: '#5A5A6E', fontSize: 10, margin: '2px 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active trip info */}
      {activeTrip && (
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          <p style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
            Active Trip
          </p>
          <div style={{ background: '#242429', borderRadius: 16, border: '1px solid #3A3A44', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,77,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                ✈️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#EFEFEF', fontSize: 15, fontWeight: 700, margin: 0 }}>{activeTrip.name}</p>
                <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>📍 {activeTrip.destination}</p>
              </div>
              {myRole === 'owner' && onNavigate && (
                <button
                  onClick={() => onNavigate('settings')}
                  style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)', borderRadius: 10, padding: '8px 12px', color: '#FF4D00', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Settings <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Character summary */}
      <div style={{ padding: '20px 20px 32px', flexShrink: 0 }}>
        <p style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          My Character
        </p>
        <div style={{ background: '#242429', borderRadius: 16, border: '1px solid #3A3A44', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Style', value: character.outfit || '—' },
            { label: 'Expression', value: character.expression || '—' },
            { label: 'Hair', value: character.hairStyle && character.hairColour ? `${character.hairStyle} · ${character.hairColour}` : '—' },
            { label: 'Accessories', value: character.accessories?.join(', ') || 'None' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#5A5A6E', fontSize: 13 }}>{item.label}</span>
              <span style={{ color: '#EFEFEF', fontSize: 13, fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>  {/* end character summary */}
      </div>  {/* end scrollable content */}

      {/* Logout confirm modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '28px 20px 40px', border: '1px solid #3A3A44' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Sign Out?</h3>
                <button onClick={() => setShowLogoutConfirm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>
              <p style={{ color: '#8A8A9A', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                You'll need to sign in again. Your trip data is saved locally and will still be there when you return.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={logout} style={{ flex: 1, padding: '14px', borderRadius: 24, background: '#EF4444', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
