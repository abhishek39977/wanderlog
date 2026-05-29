import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, Users, MapPin, X, Signal, SignalZero, Locate, RefreshCw } from 'lucide-react'
import { useTripStore } from '../store/tripStore'

interface MemberLocation {
  memberId: string
  memberName: string
  lat: number
  lng: number
  updatedAt: number
  isMe: boolean
}

const COLORS = ['#FF4D00', '#06B6D4', '#8B5CF6', '#22C55E', '#F59E0B', '#EC4899']
const getColor = (i: number) => COLORS[i % COLORS.length]
const initials = (name: string) =>
  name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)
const timeAgo = (ms: number) => {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export const MapScreen: React.FC = () => {
  const { activeTrip } = useTripStore()
  const members = activeTrip?.members ?? []

  const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [memberLocs, setMemberLocs] = useState<MemberLocation[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'live' | 'denied' | 'error'>('idle')
  const [selected, setSelected] = useState<MemberLocation | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const watchRef = useRef<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Build OpenStreetMap iframe URL
  const buildMapUrl = useCallback((lat: number, lng: number, zoom = 15) => {
    // Uses the standard OSM embed with a marker
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02},${lat - 0.02},${lng + 0.02},${lat + 0.02}&layer=mapnik&marker=${lat},${lng}`
  }, [])

  const [mapUrl, setMapUrl] = useState(
    // Default: show India center
    `https://www.openstreetmap.org/export/embed.html?bbox=68,8,97,37&layer=mapnik`
  )

  // Scatter other members near a position (demo simulation)
  const simulateMembers = useCallback((lat: number, lng: number) => {
    const others = members
      .filter(m => m.role !== 'owner')
      .map((m, i) => ({
        memberId: m.id,
        memberName: m.name,
        lat: lat + (Math.random() - 0.5) * 0.03,
        lng: lng + (Math.random() - 0.5) * 0.03,
        updatedAt: Date.now() - Math.floor(Math.random() * 4 * 60 * 1000),
        isMe: false,
      }))
    setMemberLocs(others)
  }, [members])

  const startTracking = () => {
    if (!navigator.geolocation) { setStatus('error'); return }
    setStatus('loading')

    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setMyLoc({ lat, lng })
        setStatus('live')
        setLastUpdate(new Date())
        setMapUrl(buildMapUrl(lat, lng, 15))
        simulateMembers(lat, lng)
      },
      err => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 8000 }
    )
  }

  const stopTracking = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    setStatus('idle')
  }

  const centerOnMe = () => {
    if (myLoc) setMapUrl(buildMapUrl(myLoc.lat, myLoc.lng, 16))
  }

  useEffect(() => () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
  }, [])

  const allLocs: MemberLocation[] = [
    ...(myLoc ? [{ memberId: 'me', memberName: 'You', lat: myLoc.lat, lng: myLoc.lng, updatedAt: Date.now(), isMe: true }] : []),
    ...memberLocs,
  ]

  const isLive = status === 'live'

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1A1A1F', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── MAP IFRAME — fills all space ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <iframe
          ref={iframeRef}
          src={mapUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            filter: 'invert(0.92) hue-rotate(180deg) brightness(0.9) saturate(1.3)',
          }}
          title="Live Map"
          loading="lazy"
        />
      </div>

      {/* ── GRADIENT TOP OVERLAY ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 10,
        background: 'linear-gradient(180deg, rgba(20,20,25,0.98) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── GRADIENT BOTTOM OVERLAY ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, zIndex: 10,
        background: 'linear-gradient(0deg, rgba(20,20,25,0.98) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── HEADER ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '18px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#EFEFEF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color="#FF4D00" /> Live Locations
            </h1>
            <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>
              {activeTrip?.name ?? 'No active trip'} · {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: isLive ? 'rgba(34,197,94,0.15)' : 'rgba(26,26,31,0.95)',
            border: `1px solid ${isLive ? 'rgba(34,197,94,0.5)' : '#3A3A44'}`,
            borderRadius: 20, padding: '6px 12px',
          }}>
            {status === 'live' && <><motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} /></motion.div><span style={{ color: '#22C55E', fontSize: 11, fontWeight: 700 }}>LIVE</span></>}
            {status === 'loading' && <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={12} color="#FF8C42" /></motion.div><span style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700 }}>Locating…</span></>}
            {status === 'denied' && <><SignalZero size={12} color="#EF4444" /><span style={{ color: '#EF4444', fontSize: 11, fontWeight: 700 }}>Blocked</span></>}
            {status === 'error' && <><SignalZero size={12} color="#EF4444" /><span style={{ color: '#EF4444', fontSize: 11, fontWeight: 700 }}>Error</span></>}
            {status === 'idle' && <><Signal size={12} color="#5A5A6E" /><span style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 700 }}>Offline</span></>}
          </div>
        </div>
      </div>

      {/* ── CENTER ON ME button ── */}
      {myLoc && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={centerOnMe}
          style={{
            position: 'absolute', right: 16, top: 80, zIndex: 20,
            width: 44, height: 44, borderRadius: 12,
            background: '#242429', border: '1px solid #3A3A44',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}>
          <Locate size={18} color="#FF4D00" />
        </motion.button>
      )}

      {/* ── MEMBER CHIPS (above bottom controls) ── */}
      {allLocs.length > 0 && (
        <div style={{
          position: 'absolute', bottom: isLive ? 155 : 115, left: 16, right: 16, zIndex: 20,
          background: 'rgba(20,20,25,0.95)', border: '1px solid #3A3A44', borderRadius: 18,
          padding: '10px 14px', display: 'flex', gap: 6, overflowX: 'auto',
          backdropFilter: 'blur(16px)',
        }}>
          {allLocs.map((loc, i) => (
            <motion.button key={loc.memberId} whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelected(loc)
                if (!loc.isMe) setMapUrl(buildMapUrl(loc.lat, loc.lng, 16))
              }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px 8px',
              }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: loc.isMe ? '#FF4D00' : getColor(i),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: 'white',
                border: loc.isMe ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.15)',
                boxShadow: loc.isMe ? '0 0 10px rgba(255,77,0,0.6)' : 'none',
              }}>
                {initials(loc.memberName)}
              </div>
              <span style={{ color: loc.isMe ? '#FF4D00' : '#8A8A9A', fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {loc.isMe ? 'You' : loc.memberName.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* ── LIVE STATUS BAR ── */}
      {isLive && (
        <div style={{
          position: 'absolute', bottom: 84, left: 16, right: 16, zIndex: 20,
          display: 'flex', gap: 8,
        }}>
          <div style={{
            flex: 1, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.9)' }} />
            </motion.div>
            <div>
              <p style={{ color: '#22C55E', fontSize: 12, fontWeight: 700, margin: 0 }}>Sharing live location</p>
              {lastUpdate && <p style={{ color: '#5A5A6E', fontSize: 10, margin: 0 }}>Updated {timeAgo(lastUpdate.getTime())}</p>}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.93 }} onClick={stopTracking}
            style={{ padding: '10px 14px', borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={15} color="#EF4444" />
            <span style={{ color: '#EF4444', fontSize: 12, fontWeight: 700 }}>Stop</span>
          </motion.button>
        </div>
      )}

      {/* ── START BUTTON (when not tracking) ── */}
      {!isLive && status !== 'loading' && (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={startTracking}
          style={{
            position: 'absolute', bottom: 84, left: 24, right: 24, zIndex: 20,
            padding: '16px', borderRadius: 24,
            background: status === 'denied'
              ? 'linear-gradient(135deg, #EF4444, #B91C1C)'
              : 'linear-gradient(135deg, #FF4D00, #FF8C42)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: `0 8px 24px ${status === 'denied' ? 'rgba(239,68,68,0.5)' : 'rgba(255,77,0,0.5)'}`,
          }}>
          <Navigation size={20} color="white" />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: 'white' }}>
            {status === 'denied' ? 'Location Blocked — Enable in Browser' : 'Share My Location'}
          </span>
        </motion.button>
      )}

      {/* ── SELECTED MEMBER CARD ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            style={{
              position: 'absolute', top: 76, left: 16, right: 16, zIndex: 30,
              background: '#242429', border: '1px solid #3A3A44', borderRadius: 20, padding: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                background: selected.isMe ? '#FF4D00' : '#8B5CF6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: 'white',
                boxShadow: `0 0 12px ${selected.isMe ? 'rgba(255,77,0,0.4)' : 'rgba(139,92,246,0.4)'}`,
              }}>
                {initials(selected.memberName)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#EFEFEF', fontSize: 15, fontWeight: 700, margin: 0 }}>
                  {selected.isMe ? 'Your Location' : selected.memberName}
                </p>
                <p style={{ color: '#5A5A6E', fontSize: 11, margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={10} />
                  {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
                </p>
                <p style={{ color: '#8A8A9A', fontSize: 11, margin: '2px 0 0' }}>
                  Updated {timeAgo(selected.updatedAt)}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#8A8A9A" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NO TRIP OVERLAY ── */}
      {!activeTrip && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 25,
          background: 'rgba(20,20,25,0.92)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 52 }}>🗺️</div>
          <p style={{ color: '#EFEFEF', fontSize: 17, fontWeight: 700, margin: 0 }}>No active trip</p>
          <p style={{ color: '#5A5A6E', fontSize: 13, margin: 0 }}>Create or join a trip to see member locations</p>
        </div>
      )}
    </div>
  )
}
