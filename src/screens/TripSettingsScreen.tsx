import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Users, Trash2, Globe, Lock, Archive,
  ChevronDown, X, Shield, ArrowLeft, Copy, Check,
  Wallet, Calendar, MapPin,
} from 'lucide-react'
import { useTripStore } from '../store/tripStore'
import { useOnboardingStore } from '../store/onboardingStore'
import type { MemberRole } from '../store/tripStore'

interface TripSettingsProps {
  onBack: () => void
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD', 'THB', 'IDR', 'AED', 'MXN']

const SectionCard: React.FC<{
  id: string
  icon: React.ReactNode
  iconBg: string
  label: string
  desc: string
  danger?: boolean
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}> = ({ icon, iconBg, label, desc, danger, open, onToggle, children }) => (
  <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${open ? (danger ? 'rgba(239,68,68,0.5)' : 'rgba(255,77,0,0.4)') : '#2C2C33'}` }}>
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onToggle}
      style={{
        width: '100%', background: '#242429', border: 'none',
        padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: danger ? '#EF4444' : '#EFEFEF', fontSize: 15, fontWeight: 700, margin: 0 }}>{label}</p>
        <p style={{ color: '#5A5A6E', fontSize: 12, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</p>
      </div>
      <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown size={18} color="#5A5A6E" />
      </motion.div>
    </motion.button>

    <AnimatePresence>
      {open && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ background: '#1E1E25', borderTop: '1px solid #2C2C33', padding: '18px 18px 20px' }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

export const TripSettingsScreen: React.FC<TripSettingsProps> = ({ onBack }) => {
  const {
    activeTrip, updateTripSettings, updateMemberRole, removeMember,
    myRole, trips, expenses, gallery, packingItems, wishlistItems,
    dayChapters, places, challenges, reminders,
  } = useTripStore()
  const { userId } = useOnboardingStore()

  const [openSection, setOpenSection] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: activeTrip?.name || '',
    destination: activeTrip?.destination || '',
    startDate: activeTrip?.startDate || '',
    endDate: activeTrip?.endDate || '',
    budget: String(activeTrip?.budget || ''),
    currency: activeTrip?.currency || 'INR',
    privacy: activeTrip?.privacy || 'public',
  })
  const [saved, setSaved] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)

  const toggle = (id: string) => setOpenSection(s => s === id ? null : id)

  const showSaved = (key: string) => {
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  if (!activeTrip) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Settings size={48} color="#3A3A44" />
        <p style={{ color: '#5A5A6E', fontSize: 15 }}>No active trip</p>
        <button className="btn-ghost" onClick={onBack} style={{ width: 'auto', padding: '12px 28px' }}>Go Back</button>
      </div>
    )
  }

  if (myRole !== 'owner') {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Shield size={48} color="#3A3A44" />
        <p style={{ color: '#5A5A6E', fontSize: 15 }}>Only the trip owner can access settings</p>
        <button className="btn-ghost" onClick={onBack} style={{ width: 'auto', padding: '12px 28px' }}>Go Back</button>
      </div>
    )
  }

  const handleSaveDetails = () => {
    updateTripSettings({
      name: form.name.trim() || activeTrip.name,
      destination: form.destination.trim() || activeTrip.destination,
      startDate: form.startDate || activeTrip.startDate,
      endDate: form.endDate || activeTrip.endDate,
    })
    showSaved('details')
  }

  const handleSaveBudget = () => {
    updateTripSettings({
      budget: form.budget ? parseFloat(form.budget) : undefined,
      currency: form.currency,
    })
    showSaved('budget')
  }

  const handleSavePrivacy = () => {
    updateTripSettings({ privacy: form.privacy as 'public' | 'private' | 'archived' })
    showSaved('privacy')
  }

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeTrip.joinCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  const handleDeleteTrip = () => {
    if (deleteConfirm !== 'DELETE') return
    // Clear all trip-related state from the store
    useTripStore.setState(state => ({
      trips: state.trips.filter(t => t.id !== activeTrip.id),
      activeTrip: null,
      expenses: [],
      packingItems: [],
      wishlistItems: [],
      dayChapters: [],
      places: [],
      gallery: [],
      challenges: [],
      reminders: [],
      settledPairs: new Set<string>(),
    }))
    onBack()
  }

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 12, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#8A8A9A" />
        </button>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Trip Settings</h1>
          <p style={{ color: '#FF8C42', fontSize: 12, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={11} /> Owner · {activeTrip.name}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── TRIP DETAILS ── */}
        <SectionCard
          id="details" open={openSection === 'details'} onToggle={() => toggle('details')}
          icon={<MapPin size={20} color="#FF4D00" />} iconBg="rgba(255,77,0,0.12)"
          label="Trip Details" desc={`${activeTrip.destination} · ${activeTrip.startDate} → ${activeTrip.endDate}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Trip Name</label>
              <input className="input-base" placeholder="Trip name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Destination</label>
              <input className="input-base" placeholder="Destination" value={form.destination}
                onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Start</label>
                <input className="input-base" type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={{ colorScheme: 'dark' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>End</label>
                <input className="input-base" type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleSaveDetails}>
              {saved === 'details' ? <><Check size={15} style={{ display: 'inline', marginRight: 6 }} />Saved!</> : 'Save Trip Details'}
            </button>
          </div>
        </SectionCard>

        {/* ── BUDGET & CURRENCY ── */}
        <SectionCard
          id="budget" open={openSection === 'budget'} onToggle={() => toggle('budget')}
          icon={<Wallet size={20} color="#22C55E" />} iconBg="rgba(34,197,94,0.12)"
          label="Budget & Currency"
          desc={form.budget ? `${form.currency} ${form.budget} budget` : `${form.currency} · No budget cap`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Currency</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, currency: c }))}
                    style={{
                      padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${form.currency === c ? '#22C55E' : '#3A3A44'}`,
                      background: form.currency === c ? 'rgba(34,197,94,0.12)' : '#242429',
                      color: form.currency === c ? '#22C55E' : '#8A8A9A',
                    }}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: '#5A5A6E', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Total Budget (optional)</label>
              <input className="input-base" type="number" placeholder="e.g. 50000"
                value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setForm(f => ({ ...f, budget: '' })); }}>
                Remove Limit
              </button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleSaveBudget}>
                {saved === 'budget' ? <><Check size={15} style={{ display: 'inline', marginRight: 6 }} />Saved!</> : 'Save Budget'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── PRIVACY & JOIN CODE ── */}
        <SectionCard
          id="privacy" open={openSection === 'privacy'} onToggle={() => toggle('privacy')}
          icon={<Globe size={20} color="#06B6D4" />} iconBg="rgba(6,182,212,0.12)"
          label="Privacy & Join Code"
          desc={`${form.privacy} · Code: ${activeTrip.joinCode}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { value: 'public', label: 'Public', desc: 'Anyone with join code can join', icon: <Globe size={16} /> },
              { value: 'private', label: 'Private', desc: 'Invite only', icon: <Lock size={16} /> },
              { value: 'archived', label: 'Archived', desc: 'Read-only, no new joins', icon: <Archive size={16} /> },
            ].map(opt => (
              <button key={opt.value}
                onClick={() => setForm(f => ({ ...f, privacy: opt.value as 'public' | 'private' | 'archived' }))}
                style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${form.privacy === opt.value ? '#06B6D4' : '#3A3A44'}`,
                  background: form.privacy === opt.value ? 'rgba(6,182,212,0.1)' : '#242429',
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                }}>
                <span style={{ color: form.privacy === opt.value ? '#06B6D4' : '#5A5A6E' }}>{opt.icon}</span>
                <div>
                  <p style={{ color: form.privacy === opt.value ? '#06B6D4' : '#EFEFEF', fontSize: 14, fontWeight: 600, margin: 0 }}>{opt.label}</p>
                  <p style={{ color: '#5A5A6E', fontSize: 12, margin: '2px 0 0' }}>{opt.desc}</p>
                </div>
              </button>
            ))}

            {/* Join code */}
            <div style={{ background: '#242429', borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #3A3A44' }}>
              <div>
                <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Join Code</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#FF4D00', letterSpacing: 6, margin: '2px 0 0' }}>
                  {activeTrip.joinCode}
                </p>
              </div>
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleCopyCode}
                style={{ padding: '10px 16px', borderRadius: 12, background: codeCopied ? 'rgba(34,197,94,0.12)' : 'rgba(255,77,0,0.1)', border: `1px solid ${codeCopied ? 'rgba(34,197,94,0.3)' : 'rgba(255,77,0,0.3)'}`, color: codeCopied ? '#22C55E' : '#FF4D00', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                {codeCopied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>

            <button className="btn-primary" onClick={handleSavePrivacy}>
              {saved === 'privacy' ? <><Check size={15} style={{ display: 'inline', marginRight: 6 }} />Saved!</> : 'Save Privacy'}
            </button>
          </div>
        </SectionCard>

        {/* ── MEMBERS ── */}
        <SectionCard
          id="members" open={openSection === 'members'} onToggle={() => toggle('members')}
          icon={<Users size={20} color="#8B5CF6" />} iconBg="rgba(139,92,246,0.12)"
          label="Members"
          desc={`${activeTrip.members.length} member${activeTrip.members.length !== 1 ? 's' : ''}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeTrip.members.map(member => (
              <div key={member.id}
                style={{ background: '#242429', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #2C2C33' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: member.role === 'owner' ? 'rgba(255,77,0,0.15)' : '#2C2C33',
                  border: `2px solid ${member.role === 'owner' ? '#FF4D00' : '#3A3A44'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {member.role === 'owner' ? '👑' : '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                  <p style={{ color: member.role === 'owner' ? '#FF8C42' : '#5A5A6E', fontSize: 11, margin: '2px 0 0', textTransform: 'capitalize' }}>{member.role}</p>
                </div>
                {member.role !== 'owner' && member.id !== userId && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {(['editor', 'viewer'] as MemberRole[]).map(role => (
                      <button key={role} onClick={() => updateMemberRole(member.id, role)}
                        style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                          border: `1px solid ${member.role === role ? '#8B5CF6' : '#3A3A44'}`,
                          background: member.role === role ? 'rgba(139,92,246,0.15)' : '#2C2C33',
                          color: member.role === role ? '#8B5CF6' : '#5A5A6E',
                        }}>{role}</button>
                    ))}
                    <button onClick={() => removeMember(member.id)}
                      style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {activeTrip.members.length === 1 && (
              <p style={{ color: '#3A3A44', fontSize: 13, textAlign: 'center', margin: '8px 0 0' }}>
                Share the join code to invite people to this trip.
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── DELETE TRIP ── */}
        <SectionCard
          id="danger" open={openSection === 'danger'} onToggle={() => toggle('danger')}
          icon={<Trash2 size={20} color="#EF4444" />} iconBg="rgba(239,68,68,0.12)"
          label="Delete Trip" desc="Permanently delete all trip data"
          danger
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 12, padding: '14px', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>⚠️ This cannot be undone</p>
              <p style={{ color: '#8A8A9A', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Deleting this trip will permanently remove all expenses ({expenses.length}), photos ({gallery.length}), packing items ({packingItems.length}), places ({places.length}), and all other trip data.
              </p>
            </div>

            <div>
              <label style={{ color: '#8A8A9A', fontSize: 12, margin: '0 0 8px', display: 'block' }}>
                Type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm:
              </label>
              <input
                className="input-base"
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value.toUpperCase())}
                style={{ borderColor: deleteConfirm === 'DELETE' ? '#EF4444' : '#3A3A44' }}
              />
            </div>

            <motion.button
              whileTap={deleteConfirm === 'DELETE' ? { scale: 0.97 } : {}}
              disabled={deleteConfirm !== 'DELETE'}
              onClick={handleDeleteTrip}
              style={{
                width: '100%', padding: '16px', borderRadius: 20,
                background: deleteConfirm === 'DELETE' ? '#EF4444' : '#2C2C33',
                border: `1px solid ${deleteConfirm === 'DELETE' ? '#EF4444' : '#3A3A44'}`,
                color: deleteConfirm === 'DELETE' ? 'white' : '#3A3A44',
                fontSize: 15, fontWeight: 800, cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              <Trash2 size={16} style={{ display: 'inline', marginRight: 8 }} />
              Delete Trip Forever
            </motion.button>
          </div>
        </SectionCard>

      </div>
    </div>
  )
}
