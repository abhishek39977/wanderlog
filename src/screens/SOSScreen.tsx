import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Mail, Plus, X, AlertTriangle, Trash2,
  MessageSquare, MapPin, Heart, Shield, Copy, Check,
  Siren, Ambulance, Flame, Navigation, Clock, ChevronDown
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  relation: string
}

interface MedicalInfo {
  bloodType: string
  allergies: string
  medications: string
  conditions: string
  doctorName: string
  doctorPhone: string
}

const COUNTRY_EMERGENCY: Record<string, { police: string; ambulance: string; fire: string; flag: string }> = {
  'India': { police: '100', ambulance: '108', fire: '101', flag: '🇮🇳' },
  'USA': { police: '911', ambulance: '911', fire: '911', flag: '🇺🇸' },
  'UK': { police: '999', ambulance: '999', fire: '999', flag: '🇬🇧' },
  'Australia': { police: '000', ambulance: '000', fire: '000', flag: '🇦🇺' },
  'Japan': { police: '110', ambulance: '119', fire: '119', flag: '🇯🇵' },
  'Germany': { police: '110', ambulance: '112', fire: '112', flag: '🇩🇪' },
  'France': { police: '17', ambulance: '15', fire: '18', flag: '🇫🇷' },
  'Thailand': { police: '191', ambulance: '1669', fire: '199', flag: '🇹🇭' },
  'Indonesia': { police: '110', ambulance: '118', fire: '113', flag: '🇮🇩' },
  'UAE': { police: '999', ambulance: '998', fire: '997', flag: '🇦🇪' },
  'Singapore': { police: '999', ambulance: '995', fire: '995', flag: '🇸🇬' },
  'Canada': { police: '911', ambulance: '911', fire: '911', flag: '🇨🇦' },
  'Italy': { police: '113', ambulance: '118', fire: '115', flag: '🇮🇹' },
  'Spain': { police: '091', ambulance: '112', fire: '080', flag: '🇪🇸' },
  'Malaysia': { police: '999', ambulance: '999', fire: '994', flag: '🇲🇾' },
  'Nepal': { police: '100', ambulance: '102', fire: '101', flag: '🇳🇵' },
  'Sri Lanka': { police: '118', ambulance: '110', fire: '111', flag: '🇱🇰' },
  'Bangladesh': { police: '999', ambulance: '199', fire: '199', flag: '🇧🇩' },
}

const SAFE_CHECKLIST = [
  { id: 'passport', label: 'I have my passport / ID', icon: '🛂' },
  { id: 'phone', label: 'Phone charged & working', icon: '📱' },
  { id: 'money', label: 'Emergency cash accessible', icon: '💵' },
  { id: 'location', label: 'I know my current address', icon: '📍' },
  { id: 'embassy', label: 'Embassy number saved', icon: '🏛️' },
  { id: 'insurance', label: 'Travel insurance active', icon: '🛡️' },
]

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown']

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export const SOSScreen: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: '', allergies: '', medications: '', conditions: '', doctorName: '', doctorPhone: '',
  })
  const [showAdd, setShowAdd] = useState(false)
  const [showMedical, setShowMedical] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', relation: 'Family' })
  const [medForm, setMedForm] = useState(medicalInfo)
  const [sosActive, setSosActive] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [smsSent, setSmsSent] = useState(false)
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('India')
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [copiedLocation, setCopiedLocation] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState<string | null>('sos')

  // ── Hold SOS ──
  const handleHoldStart = () => {
    let p = 0
    holdRef.current = setInterval(() => {
      p += 100 / 25   // 2.5 seconds
      setHoldProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(holdRef.current!)
        triggerSOS()
      }
    }, 100)
  }

  const handleHoldEnd = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      setHoldProgress(0)
    }
  }

  const triggerSOS = () => {
    setSosActive(true)
    setHoldProgress(0)
    setGettingLocation(true)

    const onLocationSuccess = (lat: number, lng: number) => {
      setLocationCoords({ lat, lng })
      setGettingLocation(false)
      if (contacts.length > 0) {
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`
        const medLine = medicalInfo.bloodType ? `\n🩸 Blood: ${medicalInfo.bloodType}${medicalInfo.allergies ? ` | ⚠️ Allergies: ${medicalInfo.allergies}` : ''}` : ''
        const message = encodeURIComponent(
          `🚨 EMERGENCY ALERT 🚨\nI need IMMEDIATE help!\n📍 My location: ${mapsUrl}\nCoords: ${lat.toFixed(5)}, ${lng.toFixed(5)}${medLine}\nPlease contact authorities or come NOW!`
        )
        const phoneNumbers = contacts.map(c => c.phone.replace(/\s/g, '')).join(',')
        window.location.href = `sms:${phoneNumbers}?body=${message}`
        setSmsSent(true)
      }
    }

    const onLocationFail = () => {
      setGettingLocation(false)
      if (contacts.length > 0) {
        const message = encodeURIComponent(
          `🚨 EMERGENCY ALERT 🚨\nI need IMMEDIATE help!\n⚠️ Could not get my exact location — please track my phone.\nContact authorities and come to me NOW!`
        )
        const phoneNumbers = contacts.map(c => c.phone.replace(/\s/g, '')).join(',')
        window.location.href = `sms:${phoneNumbers}?body=${message}`
        setSmsSent(true)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => onLocationSuccess(pos.coords.latitude, pos.coords.longitude),
        onLocationFail,
        { timeout: 8000, enableHighAccuracy: true }
      )
    } else {
      onLocationFail()
    }
  }

  const handleSaveContact = () => {
    if (!form.name || !form.phone) return
    setContacts(c => [...c, { ...form, id: generateId() }])
    setForm({ name: '', phone: '', email: '', relation: 'Family' })
    setShowAdd(false)
  }

  const handleShareLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
      const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
      if (navigator.share) {
        navigator.share({ title: '📍 My Live Location — WanderLog SOS', text: `I'm at: ${coords}`, url })
      } else {
        navigator.clipboard?.writeText(`${url}\n(${coords})`).then(() => {
          setCopiedLocation(true)
          setTimeout(() => setCopiedLocation(false), 2500)
        })
      }
    })
  }

  const handleSaveMedical = () => {
    setMedicalInfo(medForm)
    setShowMedical(false)
  }

  const toggleSection = (id: string) => setActiveSection(s => s === id ? null : id)

  const emergencyNums = COUNTRY_EMERGENCY[selectedCountry] || COUNTRY_EMERGENCY['India']
  const checklistDone = Object.values(checklist).filter(Boolean).length
  const hasMedInfo = medicalInfo.bloodType || medicalInfo.allergies || medicalInfo.medications

  return (
    <div className="screen">
      {/* ── SOS ACTIVE OVERLAY ── */}
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 100,
              background: 'rgba(15,0,0,0.92)', backdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24,
            }}
          >
            {/* Pulsing SOS ring */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '3px solid #EF4444' }}
              />
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{
                  width: 110, height: 110, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  boxShadow: '0 0 60px rgba(239,68,68,0.7)',
                }}
              >
                <AlertTriangle size={40} color="white" />
                <span style={{ color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>SOS</span>
              </motion.div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: '#EF4444', margin: '0 0 10px' }}>
                SOS ACTIVATED
              </h2>
              <p style={{ color: '#EFEFEF', fontSize: 14, margin: '0 0 6px', lineHeight: 1.6 }}>
                {gettingLocation
                  ? '📡 Getting GPS coordinates...'
                  : locationCoords
                    ? `📍 ${locationCoords.lat.toFixed(4)}, ${locationCoords.lng.toFixed(4)}`
                    : '⚠️ Location unavailable'}
              </p>
              {contacts.length > 0 ? (
                <p style={{ color: '#FF8C42', fontSize: 13 }}>
                  {smsSent
                    ? `✅ SMS opened — tap Send to alert ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`
                    : `📱 Preparing message for ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}...`}
                </p>
              ) : (
                <p style={{ color: '#EF4444', fontSize: 13 }}>⚠️ No contacts saved — add emergency contacts below</p>
              )}
            </div>

            {/* Emergency call buttons during SOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%' }}>
              {[
                { label: 'Police', num: emergencyNums.police, color: '#3B82F6', emoji: '👮' },
                { label: 'Ambulance', num: emergencyNums.ambulance, color: '#22C55E', emoji: '🚑' },
                { label: 'Fire', num: emergencyNums.fire, color: '#EF4444', emoji: '🚒' },
              ].map(e => (
                <a key={e.label} href={`tel:${e.num}`}
                  style={{ background: `${e.color}20`, border: `1px solid ${e.color}60`, borderRadius: 14, padding: '12px 8px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                  <span style={{ fontSize: 22 }}>{e.emoji}</span>
                  <p style={{ color: e.color, fontSize: 16, fontWeight: 800, margin: '4px 0 0', fontFamily: "'Outfit', sans-serif" }}>{e.num}</p>
                  <p style={{ color: '#5A5A6E', fontSize: 10, margin: 0 }}>{e.label}</p>
                </a>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSosActive(false); setSmsSent(false); setLocationCoords(null) }}
              style={{
                padding: '16px 40px', borderRadius: 30,
                background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E',
                color: '#22C55E', fontSize: 16, fontWeight: 800, cursor: 'pointer',
              }}
            >
              ✓ I'm Safe — Cancel SOS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>
          SOS & Safety
        </h1>
        <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''} saved
          {hasMedInfo ? ' · Medical info set ✅' : ''}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>

        {/* ── SOS BUTTON SECTION ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            {contacts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 16px', marginBottom: 16, display: 'inline-block' }}>
                <p style={{ color: '#EF4444', fontSize: 12, margin: 0 }}>⚠️ Add emergency contacts first for SMS alerts</p>
              </motion.div>
            )}

            {/* Hold button */}
            <p style={{ color: '#5A5A6E', fontSize: 12, margin: '0 0 16px' }}>Hold for 2.5 seconds to trigger SOS alert</p>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={140} height={140} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx={70} cy={70} r={62} stroke="#2C2C33" strokeWidth={6} fill="none" />
                <motion.circle cx={70} cy={70} r={62} stroke="#EF4444" strokeWidth={6} fill="none"
                  strokeLinecap="round" strokeDasharray={390}
                  animate={{ strokeDashoffset: 390 - (holdProgress / 100) * 390 }}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' }} />
              </svg>
              <motion.button
                onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd}
                onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                animate={holdProgress > 0 ? { scale: 0.93 } : { scale: 1 }}
                style={{
                  width: 118, height: 118, borderRadius: '50%',
                  background: holdProgress > 0
                    ? 'linear-gradient(135deg, #DC2626, #991B1B)'
                    : 'linear-gradient(135deg, #EF4444, #B91C1C)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 1,
                  boxShadow: `0 0 ${holdProgress > 0 ? 50 : 30}px rgba(239,68,68,${holdProgress > 0 ? 0.8 : 0.45})`,
                  transition: 'box-shadow 0.1s',
                }}
              >
                <AlertTriangle size={32} color="white" />
                <span style={{ color: 'white', fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>
                  {holdProgress > 0 ? `${Math.round(holdProgress)}%` : 'HOLD SOS'}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Quick action row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleShareLocation}
              style={{
                flex: 1, padding: '13px', borderRadius: 16, cursor: 'pointer',
                background: 'rgba(255,140,66,0.1)', border: '1px solid rgba(255,140,66,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
              {copiedLocation ? <Check size={20} color="#22C55E" /> : <Navigation size={20} color="#FF8C42" />}
              <span style={{ color: copiedLocation ? '#22C55E' : '#FF8C42', fontSize: 11, fontWeight: 700 }}>
                {copiedLocation ? 'Copied!' : 'Share Location'}
              </span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
              style={{
                flex: 1, padding: '13px', borderRadius: 16, cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
              <Plus size={20} color="#EF4444" />
              <span style={{ color: '#EF4444', fontSize: 11, fontWeight: 700 }}>Add Contact</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setMedForm(medicalInfo); setShowMedical(true) }}
              style={{
                flex: 1, padding: '13px', borderRadius: 16, cursor: 'pointer',
                background: hasMedInfo ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                border: `1px solid ${hasMedInfo ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.3)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
              <Heart size={20} color={hasMedInfo ? '#22C55E' : '#8B5CF6'} />
              <span style={{ color: hasMedInfo ? '#22C55E' : '#8B5CF6', fontSize: 11, fontWeight: 700 }}>Medical ID</span>
            </motion.button>
          </div>
        </div>

        {/* ── MEDICAL INFO DISPLAY (when set) ── */}
        {hasMedInfo && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#242429', borderRadius: 16, border: '1px solid rgba(34,197,94,0.3)', padding: '16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Heart size={16} color="#22C55E" />
              <p style={{ color: '#22C55E', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Medical ID</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {medicalInfo.bloodType && (
                <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '4px 10px', color: '#EF4444', fontSize: 12, fontWeight: 700 }}>
                  🩸 {medicalInfo.bloodType}
                </span>
              )}
              {medicalInfo.allergies && (
                <span style={{ background: 'rgba(255,140,66,0.1)', border: '1px solid rgba(255,140,66,0.2)', borderRadius: 8, padding: '4px 10px', color: '#FF8C42', fontSize: 12 }}>
                  ⚠️ {medicalInfo.allergies}
                </span>
              )}
              {medicalInfo.medications && (
                <span style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: '4px 10px', color: '#06B6D4', fontSize: 12 }}>
                  💊 {medicalInfo.medications}
                </span>
              )}
            </div>
            {medicalInfo.doctorPhone && (
              <a href={`tel:${medicalInfo.doctorPhone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: '#8A8A9A', fontSize: 12, textDecoration: 'none' }}>
                <Phone size={12} /> Dr. {medicalInfo.doctorName} — {medicalInfo.doctorPhone}
              </a>
            )}
          </motion.div>
        )}

        {/* ── EMERGENCY CONTACTS ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ color: '#FF8C42', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
              Emergency Contacts ({contacts.length})
            </h3>
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowAdd(true)}
              style={{ background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)', borderRadius: 20, padding: '6px 14px', color: '#FF4D00', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Add
            </motion.button>
          </div>

          {contacts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(239,68,68,0.06)', borderRadius: 16, border: '1px dashed rgba(239,68,68,0.3)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📵</div>
              <p style={{ color: '#EF4444', fontSize: 14, fontWeight: 600, margin: 0 }}>No contacts saved</p>
              <p style={{ color: '#8A8A9A', fontSize: 12, margin: '6px 0 16px', lineHeight: 1.6 }}>
                WanderLog will SMS your contacts with your GPS location when SOS is triggered.
              </p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
                style={{ padding: '10px 24px', borderRadius: 20, background: '#EF4444', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                + Add First Contact
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.map(contact => (
                <motion.div key={contact.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: '#242429', borderRadius: 16, border: '1px solid #3A3A44', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,77,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {contact.relation === 'Family' ? '👨‍👩‍👧' : contact.relation === 'Friend' ? '👥' : '🤝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>{contact.name}</p>
                      <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 8px' }}>{contact.relation}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <a href={`tel:${contact.phone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          <Phone size={11} /> Call
                        </a>
                        <a href={`sms:${contact.phone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#06B6D4', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          <MessageSquare size={11} /> SMS
                        </a>
                        {contact.email && (
                          <a href={`mailto:${contact.email}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            <Mail size={11} /> Email
                          </a>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setContacts(c => c.filter(x => x.id !== contact.id))}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <Trash2 size={13} color="#EF4444" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── EMERGENCY NUMBERS ── */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: '#FF8C42', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
            Local Emergency Numbers
          </h3>
          {/* Country selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
            {Object.entries(COUNTRY_EMERGENCY).map(([country, nums]) => (
              <motion.button key={country} whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedCountry(country)}
                style={{
                  flexShrink: 0, padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${selectedCountry === country ? '#FF4D00' : '#3A3A44'}`,
                  background: selectedCountry === country ? 'rgba(255,77,0,0.12)' : '#242429',
                  color: selectedCountry === country ? '#FF4D00' : '#8A8A9A',
                }}>
                {nums.flag} {country}
              </motion.button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Police', num: emergencyNums.police, emoji: '👮', color: '#3B82F6' },
              { label: 'Ambulance', num: emergencyNums.ambulance, emoji: '🚑', color: '#22C55E' },
              { label: 'Fire', num: emergencyNums.fire, emoji: '🔥', color: '#EF4444' },
            ].map(em => (
              <a key={em.label} href={`tel:${em.num}`}
                style={{
                  background: `${em.color}12`, borderRadius: 16, border: `1px solid ${em.color}40`,
                  padding: '18px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none',
                }}>
                <span style={{ fontSize: 28 }}>{em.emoji}</span>
                <span style={{ color: em.color, fontSize: 20, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{em.num}</span>
                <span style={{ color: '#5A5A6E', fontSize: 11 }}>{em.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── SAFETY CHECKLIST ── */}
        <div style={{ marginBottom: 16 }}>
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => setShowChecklist(s => !s)}
            style={{ width: '100%', background: '#242429', border: `1px solid ${checklistDone === SAFE_CHECKLIST.length ? 'rgba(34,197,94,0.4)' : '#3A3A44'}`, borderRadius: 16, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
            <Shield size={20} color={checklistDone === SAFE_CHECKLIST.length ? '#22C55E' : '#8B5CF6'} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>Safety Checklist</p>
              <p style={{ color: '#5A5A6E', fontSize: 12, margin: '2px 0 0' }}>{checklistDone}/{SAFE_CHECKLIST.length} complete</p>
            </div>
            <motion.div animate={{ rotate: showChecklist ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} color="#5A5A6E" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showChecklist && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: '#1E1E25', borderRadius: '0 0 16px 16px', border: '1px solid #2C2C33', borderTop: 'none', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {SAFE_CHECKLIST.map(item => (
                    <motion.button key={item.id} whileTap={{ scale: 0.97 }}
                      onClick={() => setChecklist(s => ({ ...s, [item.id]: !s[item.id] }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                        background: checklist[item.id] ? 'rgba(34,197,94,0.08)' : '#242429',
                        border: `1px solid ${checklist[item.id] ? 'rgba(34,197,94,0.3)' : '#3A3A44'}`,
                        textAlign: 'left',
                      }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <span style={{ flex: 1, color: checklist[item.id] ? '#22C55E' : '#EFEFEF', fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: checklist[item.id] ? '#22C55E' : 'transparent',
                        border: `2px solid ${checklist[item.id] ? '#22C55E' : '#3A3A44'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {checklist[item.id] && <Check size={12} color="white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── ADD CONTACT MODAL ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Emergency Contact</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input-base" placeholder="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="input-base" placeholder="Phone * (with country code, e.g. +91 98765 43210)" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <input className="input-base" placeholder="Email (optional)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Family', 'Friend', 'Work'].map(r => (
                    <button key={r} onClick={() => setForm(f => ({ ...f, relation: r }))}
                      style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1px solid ${form.relation === r ? '#EF4444' : '#3A3A44'}`, background: form.relation === r ? 'rgba(239,68,68,0.12)' : '#2C2C33', color: form.relation === r ? '#EF4444' : '#8A8A9A', fontSize: 13, cursor: 'pointer' }}>
                      {r}
                    </button>
                  ))}
                </div>
                <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                  💡 When SOS triggers, the SMS app opens with your GPS coordinates pre-filled for this contact.
                </p>
                <button className="btn-primary" onClick={handleSaveContact} disabled={!form.name || !form.phone}>
                  Save Contact
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MEDICAL INFO MODAL ── */}
      <AnimatePresence>
        {showMedical && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowMedical(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Medical ID</h3>
                  <p style={{ color: '#5A5A6E', fontSize: 12, margin: '4px 0 0' }}>Sent with SOS alerts to help first responders</p>
                </div>
                <button onClick={() => setShowMedical(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Blood type picker */}
                <div>
                  <p style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>🩸 Blood Type</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {BLOOD_TYPES.map(bt => (
                      <button key={bt} onClick={() => setMedForm(f => ({ ...f, bloodType: bt }))}
                        style={{
                          padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          border: `1px solid ${medForm.bloodType === bt ? '#EF4444' : '#3A3A44'}`,
                          background: medForm.bloodType === bt ? 'rgba(239,68,68,0.12)' : '#2C2C33',
                          color: medForm.bloodType === bt ? '#EF4444' : '#8A8A9A',
                        }}>{bt}</button>
                    ))}
                  </div>
                </div>

                <input className="input-base" placeholder="⚠️ Allergies (e.g. Penicillin, Nuts, Latex)"
                  value={medForm.allergies} onChange={e => setMedForm(f => ({ ...f, allergies: e.target.value }))} />
                <input className="input-base" placeholder="💊 Current medications"
                  value={medForm.medications} onChange={e => setMedForm(f => ({ ...f, medications: e.target.value }))} />
                <input className="input-base" placeholder="❤️ Medical conditions (e.g. Diabetic, Asthma)"
                  value={medForm.conditions} onChange={e => setMedForm(f => ({ ...f, conditions: e.target.value }))} />
                <input className="input-base" placeholder="👨‍⚕️ Doctor's name"
                  value={medForm.doctorName} onChange={e => setMedForm(f => ({ ...f, doctorName: e.target.value }))} />
                <input className="input-base" placeholder="📞 Doctor's phone number" type="tel"
                  value={medForm.doctorPhone} onChange={e => setMedForm(f => ({ ...f, doctorPhone: e.target.value }))} />

                <button className="btn-primary" onClick={handleSaveMedical}>
                  <Heart size={16} style={{ display: 'inline', marginRight: 8 }} /> Save Medical ID
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
