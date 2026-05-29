import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '../store/tripStore'
import { useOnboardingStore } from '../store/onboardingStore'
import { Plus, X, Trash2 } from 'lucide-react'

const DIFFICULTIES = [
  { label: 'Easy', emoji: '🌶️', color: '#22C55E' },
  { label: 'Medium', emoji: '🔥', color: '#FF8C42' },
  { label: 'Hard', emoji: '💎', color: '#8B5CF6' },
  { label: 'Legendary', emoji: '🌙', color: '#FF4D00' },
]

// Burst animation for completing a challenge
const BurstRing: React.FC<{ active: boolean }> = ({ active }) => (
  <AnimatePresence>
    {active && (
      <>
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: 1, opacity: 0,
              x: Math.cos((i / 8) * Math.PI * 2) * 40,
              y: Math.sin((i / 8) * Math.PI * 2) * 40,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#FF4D00',
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10,
            }}
          />
        ))}
      </>
    )}
  </AnimatePresence>
)

const CircleRing: React.FC<{ completed: boolean; size?: number }> = ({ completed, size = 56 }) => {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2C2C33" strokeWidth={4} fill="none" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={completed ? '#22C55E' : '#FF4D00'} strokeWidth={4} fill="none"
        strokeLinecap="round" strokeDasharray={c}
        animate={{ strokeDashoffset: completed ? 0 : c * 0.85 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 4px ${completed ? '#22C55E' : '#FF4D00'}80)` }}
      />
    </svg>
  )
}

export const TickBoardScreen: React.FC = () => {
  const { challenges, toggleChallenge, addChallenge, removeChallenge } = useTripStore()
  const { userId, character } = useOnboardingStore()
  const [recentBurst, setRecentBurst] = useState<string | null>(null)
  const [filterDiff, setFilterDiff] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', difficulty: 'Easy' })

  const completed = challenges.filter(c => c.completed)
  const percent = challenges.length > 0 ? Math.round((completed.length / challenges.length) * 100) : 0

  const filtered = filterDiff === 'All' ? challenges : challenges.filter(c => c.difficulty.includes(filterDiff))

  const handleToggle = (id: string, isCompleted: boolean) => {
    toggleChallenge(id, userId || 'me')
    if (!isCompleted) {
      setRecentBurst(id)
      setTimeout(() => setRecentBurst(null), 700)
    }
  }

  const handleAdd = () => {
    if (!form.title.trim()) return
    const diff = DIFFICULTIES.find(d => d.label === form.difficulty)!
    addChallenge({ title: form.title.trim(), difficulty: `${diff.emoji} ${diff.label}`, completed: false })
    setForm({ title: '', difficulty: 'Easy' })
    setShowAdd(false)
  }

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <CircleRing completed={percent === 100} size={60} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(90deg)' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: percent === 100 ? '#22C55E' : '#FF4D00' }}>{percent}%</span>
            </div>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Tick Board</h1>
            <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>{completed.length}/{challenges.length} completed</p>
          </div>
        </div>
      </div>

      {/* Difficulty filter */}
      <div style={{ padding: '16px 0', overflowX: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, paddingLeft: 20, paddingRight: 20 }}>
          {['All', ...DIFFICULTIES.map(d => d.label)].map(diff => {
            const d = DIFFICULTIES.find(x => x.label === diff)
            return (
              <button key={diff} onClick={() => setFilterDiff(diff)}
                style={{
                  padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  border: `1px solid ${filterDiff === diff ? (d?.color || '#FF4D00') : '#3A3A44'}`,
                  background: filterDiff === diff ? `${d?.color || '#FF4D00'}20` : '#242429',
                  color: filterDiff === diff ? (d?.color || '#FF4D00') : '#8A8A9A', transition: 'all 0.2s',
                }}>
                {d ? `${d.emoji} ${d.label}` : '⚡ All'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Challenge cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 120px' }}>
        {challenges.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,77,0,0.04)', borderRadius: 20, border: '1px dashed rgba(255,77,0,0.2)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>No Ticks Yet</h3>
            <p style={{ color: '#5A5A6E', fontSize: 14, margin: '8px 0 0', lineHeight: 1.6 }}>
              Create your own travel challenges!<br />Tap the + button to add your first tick.
            </p>
            <button onClick={() => setShowAdd(true)}
              style={{ marginTop: 20, padding: '12px 24px', borderRadius: 24, background: '#FF4D00', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              + Add First Challenge
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((challenge, idx) => {
              const diff = DIFFICULTIES.find(d => challenge.difficulty.includes(d.label)) || DIFFICULTIES[0]
              return (
                <motion.div key={challenge.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  style={{
                    background: challenge.completed ? 'rgba(34,197,94,0.06)' : '#242429',
                    borderRadius: 18, border: `1px solid ${challenge.completed ? 'rgba(34,197,94,0.25)' : '#3A3A44'}`,
                    padding: '16px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
                  }}
                >
                  <BurstRing active={recentBurst === challenge.id} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Ring */}
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleToggle(challenge.id, challenge.completed)}>
                      <CircleRing completed={challenge.completed} size={52} />
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: 'rotate(90deg)', fontSize: 18,
                      }}>
                        {challenge.completed ? '✅' : diff.emoji}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: challenge.completed ? '#5A5A6E' : '#EFEFEF', fontSize: 15, fontWeight: 600, margin: 0,
                        textDecoration: challenge.completed ? 'line-through' : 'none',
                      }}>
                        {challenge.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: `${diff.color}20`, color: diff.color,
                        }}>
                          {challenge.difficulty}
                        </span>
                        {challenge.completed && challenge.completedBy && (
                          <span style={{ color: '#5A5A6E', fontSize: 11 }}>
                            by {challenge.completedBy === userId ? character.displayName || 'You' : challenge.completedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {/* Tick button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggle(challenge.id, challenge.completed)}
                        style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0, cursor: 'pointer',
                          background: challenge.completed ? '#22C55E' : 'rgba(255,77,0,0.1)',
                          border: `1.5px solid ${challenge.completed ? '#22C55E' : 'rgba(255,77,0,0.3)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                        }}>
                        <span style={{ fontSize: 18 }}>{challenge.completed ? '✓' : '+'}</span>
                      </motion.button>
                      {/* Delete button */}
                      <button onClick={() => removeChallenge(challenge.id)}
                        style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, cursor: 'pointer', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Completion celebration */}
        {completed.length === challenges.length && challenges.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(255,77,0,0.08)', borderRadius: 20, border: '1px solid rgba(255,77,0,0.2)', marginTop: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#FF4D00', margin: 0 }}>Legend!</h3>
            <p style={{ color: '#8A8A9A', fontSize: 14, margin: '8px 0 0' }}>You completed all challenges on this trip!</p>
          </motion.div>
        )}
      </div>

      {/* Add challenge modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#1E1E24', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Challenge</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="#8A8A9A" />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  className="input-base"
                  placeholder="What's the challenge? (e.g. Try street food)"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  autoFocus
                />
                <div>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Difficulty</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DIFFICULTIES.map(d => (
                      <button key={d.label} onClick={() => setForm(f => ({ ...f, difficulty: d.label }))}
                        style={{
                          flex: 1, padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.difficulty === d.label ? d.color : '#3A3A44'}`,
                          background: form.difficulty === d.label ? `${d.color}18` : '#2C2C33',
                          color: form.difficulty === d.label ? d.color : '#8A8A9A',
                          fontSize: 11, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        }}>
                        <span style={{ fontSize: 18 }}>{d.emoji}</span>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAdd} disabled={!form.title.trim()}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Plus size={18} /> Add Challenge
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="glow-orange"
        style={{ position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#FF4D00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
