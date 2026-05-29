import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Package, Map, DollarSign, Image, Calendar, AlertTriangle, Settings, Users } from 'lucide-react'
import { differenceInDays, format, isPast } from 'date-fns'
import { useOnboardingStore } from '../store/onboardingStore'
import { useTripStore } from '../store/tripStore'
import { AvatarRenderer } from '../components/avatar/AvatarRenderer'

interface HomeScreenProps {
  onNavigate: (screen: string) => void
}

// Countdown ring
const CountdownRing: React.FC<{ days: number; totalDays: number; label: string }> = ({ days, totalDays, label }) => {
  const radius = 80
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = totalDays > 0 ? Math.max(0, 1 - days / totalDays) : 1
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={radius * 2} height={radius * 2} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={radius} cy={radius} r={normalizedRadius} stroke="#2C2C33" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={radius} cy={radius} r={normalizedRadius}
          stroke="#FF4D00" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,77,0,0.7))' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: days > 99 ? 28 : 36, fontWeight: 900, color: '#EFEFEF', margin: 0, lineHeight: 1 }}>
          {days < 0 ? '🎉' : days}
        </p>
        <p style={{ fontSize: 11, color: '#8A8A9A', margin: '4px 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

// Quick nav tile
const NavTile: React.FC<{ icon: React.ReactNode; label: string; color: string; onClick: () => void; badge?: number }> = ({ icon, label, color, onClick, badge }) => (
  <motion.button
    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
    onClick={onClick}
    style={{
      background: '#242429', border: '1px solid #3A3A44', borderRadius: 16,
      padding: '18px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10, position: 'relative', transition: 'border-color 0.2s',
    }}
    onHoverStart={(e) => { (e.target as HTMLElement).style.borderColor = color }}
    onHoverEnd={(e) => { (e.target as HTMLElement).style.borderColor = '#3A3A44' }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${color}18`, border: `1px solid ${color}30`,
    }}>
      {icon}
    </div>
    <span style={{ fontSize: 12, color: '#8A8A9A', fontWeight: 500, textAlign: 'center' }}>{label}</span>
    {badge != null && badge > 0 && (
      <div style={{
        position: 'absolute', top: 8, right: 8, background: '#FF4D00',
        borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{badge}</span>
      </div>
    )}
  </motion.button>
)

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { character } = useOnboardingStore()
  const { activeTrip, packingItems, expenses, myRole, challenges } = useTripStore()

  const daysUntilTrip = useMemo(() => {
    if (!activeTrip) return 0
    return differenceInDays(new Date(activeTrip.startDate), new Date())
  }, [activeTrip])

  const tripInProgress = daysUntilTrip <= 0 && activeTrip && !isPast(new Date(activeTrip.endDate))

  const packingPercent = packingItems.length > 0 ? Math.round((packingItems.filter(i => i.packed).length / packingItems.length) * 100) : 0
  const totalBudget = activeTrip?.budget || 0
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  const tickPercent = challenges.length > 0
    ? Math.round((challenges.filter(c => c.completed).length / challenges.length) * 100)
    : 0

  const navTiles = [
    { id: 'packing',   icon: <Package size={20} color="#FF8C42" />,       label: 'Packing',    color: '#FF8C42', badge: packingItems.filter(i => !i.packed).length },
    { id: 'timeline',  icon: <Calendar size={20} color="#22C55E" />,      label: 'Timeline',   color: '#22C55E' },
    { id: 'expenses',  icon: <DollarSign size={20} color="#FF4D00" />,    label: 'Budget',     color: '#FF4D00' },
    { id: 'gallery',   icon: <Image size={20} color="#8B5CF6" />,         label: 'Gallery',    color: '#8B5CF6' },
    { id: 'map',       icon: <Map size={20} color="#06B6D4" />,           label: 'Map',        color: '#06B6D4' },
    { id: 'wishlist',  icon: <span style={{fontSize:18}}>⭐</span>,        label: 'Wishlist',   color: '#F4C430' },
    { id: 'tickboard', icon: <span style={{fontSize:18}}>✅</span>,        label: 'Tick Board', color: '#22C55E' },
    { id: 'scrapbook', icon: <span style={{fontSize:18}}>📖</span>,        label: 'Scrapbook',  color: '#EC4899' },
    { id: 'sos',       icon: <AlertTriangle size={20} color="#EF4444" />, label: 'SOS',        color: '#EF4444' },
  ]

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at top right, rgba(255,77,0,0.07) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ color: '#8A8A9A', fontSize: 13, margin: 0 }}>
            {format(new Date(), 'EEEE, MMM d')}
          </p>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: '4px 0 0', letterSpacing: '-0.5px' }}>
            Hey, {character.displayName?.split(' ')[0] || 'Traveller'} 👋
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {myRole === 'owner' && (
            <button onClick={() => onNavigate('settings')}
              style={{ width: 40, height: 40, borderRadius: 12, background: '#242429', border: '1px solid #3A3A44', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={18} color="#8A8A9A" />
            </button>
          )}
          <button onClick={() => onNavigate('profile')}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#242429', border: '2px solid #FF4D00', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AvatarRenderer config={character} size={36} />
          </button>
        </div>
      </div>

      {/* Trip hero card */}
      {activeTrip && (
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, #242429, #2C2C33)',
            border: '1px solid #3A3A44', borderRadius: 24, overflow: 'hidden', position: 'relative',
          }}>
            {/* Trip header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 4px' }}>
                  {tripInProgress ? '🟢 In Progress' : daysUntilTrip < 0 ? '✅ Completed' : '📅 Upcoming'}
                </p>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>
                  {activeTrip.name}
                </h2>
                <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 {activeTrip.destination}
                </p>
              </div>

              <CountdownRing
                days={Math.max(0, daysUntilTrip)}
                totalDays={differenceInDays(new Date(activeTrip.endDate), new Date()) + Math.max(0, daysUntilTrip)}
                label={daysUntilTrip <= 0 ? 'days in' : 'days left'}
              />
            </div>

            {/* Stats row */}
            <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 12 }}>
              {[
                { label: 'Packing', value: `${packingPercent}%`, color: '#FF8C42' },
                { label: 'Budget', value: totalBudget > 0 ? `${budgetPercent}%` : 'No cap', color: '#22C55E' },
                { label: 'Members', value: `${activeTrip.members.length}`, color: '#8B5CF6' },
              ].map(stat => (
                <div key={stat.label} style={{
                  flex: 1, background: '#1A1A1F', borderRadius: 12, padding: '10px 12px', textAlign: 'center',
                }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
                  <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trip Health mini-rings (P1) */}
      {activeTrip && (
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{
            background: '#242429', borderRadius: 16, border: '1px solid #3A3A44',
            padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          }}>
            {[
              { label: 'Packing', percent: packingPercent, color: '#FF8C42' },
              { label: 'Budget',  percent: budgetPercent,  color: budgetPercent >= 100 ? '#EF4444' : '#22C55E' },
              { label: 'Tick Board', percent: tickPercent,  color: '#8B5CF6' },
            ].map(ring => {
              const r = 20, stroke = 4
              const c = 2 * Math.PI * r
              const offset = c - (Math.min(ring.percent, 100) / 100) * c
              return (
                <div key={ring.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative', width: 52, height: 52 }}>
                    <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={26} cy={26} r={r} stroke="#2C2C33" strokeWidth={stroke} fill="none" />
                      <motion.circle cx={26} cy={26} r={r} stroke={ring.color} strokeWidth={stroke} fill="none"
                        strokeLinecap="round" strokeDasharray={c}
                        initial={{ strokeDashoffset: c }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ filter: `drop-shadow(0 0 4px ${ring.color}80)` }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: ring.color }}>{ring.percent}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: '#5A5A6E', fontWeight: 500 }}>{ring.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Join code banner (owner only) */}
      {activeTrip && myRole === 'owner' && (
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{
            background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
            borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Join Code</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: '#FF4D00', letterSpacing: 4, margin: '2px 0 0' }}>
                {activeTrip.joinCode}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(activeTrip.joinCode)}
              style={{ background: '#FF4D00', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Member strip */}
      {activeTrip && activeTrip.members.length > 1 && (
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Users size={14} color="#8A8A9A" />
            <p style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Crew</p>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {activeTrip.members.map((member) => (
              <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#242429',
                  border: `2px solid ${member.role === 'owner' ? '#FF4D00' : '#3A3A44'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  <span style={{ fontSize: 20 }}>{member.role === 'owner' ? '👑' : '👤'}</span>
                </div>
                <span style={{ fontSize: 10, color: '#5A5A6E', maxWidth: 48, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick nav tiles */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <p style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Quick Access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {navTiles.map(tile => (
            <NavTile key={tile.id} icon={tile.icon} label={tile.label} color={tile.color}
              onClick={() => onNavigate(tile.id)} badge={tile.badge} />
          ))}
        </div>
      </div>

      {/* Dates row */}
      {activeTrip && (
        <div style={{ padding: '16px 20px 32px', flexShrink: 0 }}>
          <div style={{ background: '#242429', borderRadius: 16, border: '1px solid #3A3A44', padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0 }}>Departure</p>
              <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: '4px 0 0' }}>{format(new Date(activeTrip.startDate), 'MMM d, yyyy')}</p>
            </div>
            <div style={{ width: 1, background: '#3A3A44' }} />
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0 }}>Return</p>
              <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: '4px 0 0' }}>{format(new Date(activeTrip.endDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
