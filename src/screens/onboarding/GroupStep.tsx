import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Users, ArrowLeft, MapPin, Calendar, Camera, ChevronRight } from 'lucide-react'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useTripStore } from '../../store/tripStore'
import { format, addDays } from 'date-fns'

interface GroupStepProps {
  onComplete: () => void
}

type View = 'choice' | 'create' | 'join'

const TRIP_TYPES = [
  { label: 'Adventure', emoji: '🏔️' },
  { label: 'City Break', emoji: '🏙️' },
  { label: 'Beach', emoji: '🏖️' },
  { label: 'Trek', emoji: '🥾' },
  { label: 'Road Trip', emoji: '🚗' },
  { label: 'Cultural', emoji: '🎭' },
]

export const GroupStep: React.FC<GroupStepProps> = ({ onComplete }) => {
  const [view, setView] = useState<View>('choice')
  const { character, userId, completeGroup } = useOnboardingStore()
  const { createTrip, joinTrip } = useTripStore()

  // Create Trip form
  const [tripName, setTripName] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 37), 'yyyy-MM-dd'))
  const [tripType, setTripType] = useState('')
  const [creating, setCreating] = useState(false)

  // Join Trip form
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  const handleCreate = async () => {
    if (!tripName || !destination || !tripType) return
    setCreating(true)
    await new Promise(r => setTimeout(r, 1000))
    const trip = createTrip(
      { name: tripName, destination, startDate, endDate, tripType, coverPhoto: '', privacy: 'public', currency: 'INR', ownerId: userId! },
      userId!,
      character.displayName || 'Traveller'
    )
    completeGroup(trip.id)
    setCreating(false)
    onComplete()
  }

  const handleJoin = async () => {
    if (joinCode.length !== 6) { setJoinError('Enter a 6-character join code'); return }
    setJoining(true)
    setJoinError('')
    await new Promise(r => setTimeout(r, 1000))
    const trip = joinTrip(joinCode, userId!, character.displayName || 'Traveller')
    if (!trip) {
      setJoinError('Invalid join code. Check the code and try again.')
      setJoining(false)
      return
    }
    completeGroup(trip.id)
    setJoining(false)
    onComplete()
  }

  return (
    <motion.div className="screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at bottom, rgba(255,77,0,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        {view !== 'choice' && (
          <button onClick={() => setView('choice')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        {view === 'choice' && (
          <>
            <p style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 6px' }}>Step 2 of 2</p>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#EFEFEF', margin: 0, lineHeight: 1.2 }}>
              Where are you headed?
            </h1>
            <p style={{ color: '#8A8A9A', fontSize: 14, margin: '8px 0 0' }}>
              Create a new trip or join a friend's adventure
            </p>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Choice screen */}
        {view === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ flex: 1, padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}
          >
            {/* Create card */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => setView('create')}
              style={{
                background: 'linear-gradient(135deg, rgba(255,77,0,0.15), rgba(255,77,0,0.05))',
                border: '1.5px solid rgba(255,77,0,0.4)',
                borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,77,0,0.08)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FF4D00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plane size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ color: '#EFEFEF', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Create a Trip</h3>
                  <p style={{ color: '#FF8C42', fontSize: 12, margin: '2px 0 0' }}>You become the Owner</p>
                </div>
                <ChevronRight size={20} color="#FF4D00" style={{ marginLeft: 'auto' }} />
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Set trip name, destination & dates', 'Get a 6-char join code to share', 'Full control over group settings'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8A8A9A', fontSize: 13 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4D00', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#3A3A44' }} />
              <span style={{ color: '#5A5A6E', fontSize: 13, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#3A3A44' }} />
            </div>

            {/* Join card */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => setView('join')}
              style={{
                background: '#242429', border: '1.5px solid #3A3A44',
                borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#2C2C33', border: '1.5px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} color="#FF8C42" />
                </div>
                <div>
                  <h3 style={{ color: '#EFEFEF', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Join a Trip</h3>
                  <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>Join as Editor</p>
                </div>
                <ChevronRight size={20} color="#8A8A9A" style={{ marginLeft: 'auto' }} />
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Enter a 6-char code from a friend', 'Preview trip before joining', 'Contribute photos, expenses & more'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8A8A9A', fontSize: 13 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8A8A9A', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.button>
          </motion.div>
        )}

        {/* Create Trip form */}
        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Create Your Trip</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Trip Name</label>
              <div style={{ position: 'relative' }}>
                <input className="input-base" placeholder="e.g. Bali Summer 2025" value={tripName} onChange={e => setTripName(e.target.value)} style={{ paddingLeft: 44 }} />
                <Plane size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
              </div>

              <label style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Destination</label>
              <div style={{ position: 'relative' }}>
                <input className="input-base" placeholder="City, Country" value={destination} onChange={e => setDestination(e.target.value)} style={{ paddingLeft: 44 }} />
                <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Start</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-base" type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      style={{ paddingLeft: 40, colorScheme: 'dark' }} />
                    <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>End</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-base" type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      style={{ paddingLeft: 40, colorScheme: 'dark' }} />
                    <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
                  </div>
                </div>
              </div>

              <label style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Trip Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TRIP_TYPES.map(t => (
                  <button key={t.label} onClick={() => setTripType(t.label)}
                    style={{
                      padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${tripType === t.label ? '#FF4D00' : '#3A3A44'}`,
                      background: tripType === t.label ? 'rgba(255,77,0,0.12)' : '#2C2C33',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                    }}>
                    <span style={{ fontSize: 20 }}>{t.emoji}</span>
                    <span style={{ fontSize: 11, color: tripType === t.label ? '#FF4D00' : '#8A8A9A', fontWeight: 500 }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={!tripName || !destination || !tripType || creating}
              style={{ marginTop: 8 }}
            >
              {creating ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <motion.div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                  Creating your trip...
                </span>
              ) : '🚀 Create Trip & Get Join Code'}
            </button>
          </motion.div>
        )}

        {/* Join Trip form */}
        {view === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Join a Trip</h2>

            <div style={{ background: '#242429', borderRadius: 16, border: '1px solid #3A3A44', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
              <p style={{ color: '#8A8A9A', fontSize: 14, margin: '0 0 20px' }}>
                Ask the trip owner for their 6-character join code
              </p>

              <input
                className="input-base"
                placeholder="ABC123"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 8, fontFamily: "'Outfit', sans-serif" }}
              />

              {joinError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#EF4444', fontSize: 13, marginTop: 12 }}>
                  {joinError}
                </motion.p>
              )}
            </div>

            <div style={{ background: 'rgba(255,140,66,0.08)', borderRadius: 12, border: '1px solid rgba(255,140,66,0.2)', padding: 16 }}>
              <p style={{ color: '#FF8C42', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                💡 <strong>Tip:</strong> Don't have a code? Create your own trip and invite friends to join you!
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleJoin}
              disabled={joinCode.length !== 6 || joining}
            >
              {joining ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <motion.div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                  Joining trip...
                </span>
              ) : 'Join Trip →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
