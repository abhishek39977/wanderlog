import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Bell, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO, addMonths, subMonths } from 'date-fns'
import { useTripStore } from '../store/tripStore'

const REMINDER_CATEGORIES = ['General', 'Visa', 'Insurance', 'Packing', 'Check-in', 'Flight', 'Hotel']
const CAT_COLORS: Record<string, string> = {
  General: '#8A8A9A', Visa: '#8B5CF6', Insurance: '#06B6D4',
  Packing: '#FF8C42', 'Check-in': '#22C55E', Flight: '#FF4D00', Hotel: '#F4C430',
}
const CAT_EMOJI: Record<string, string> = {
  General: '🔔', Visa: '🛂', Insurance: '🛡️', Packing: '🎒', 'Check-in': '✅', Flight: '✈️', Hotel: '🏨',
}

export const CalendarScreen: React.FC = () => {
  const { activeTrip, reminders, addReminder } = useTripStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00', category: 'General', repeat: 'none',
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad to full week rows
  const startPad = monthStart.getDay()
  const totalCells = Math.ceil((startPad + days.length) / 7) * 7
  const allCells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
    ...Array(totalCells - startPad - days.length).fill(null),
  ]

  const tripStart = activeTrip ? parseISO(activeTrip.startDate) : null
  const tripEnd = activeTrip ? parseISO(activeTrip.endDate) : null

  const isTripDay = (d: Date) =>
    tripStart && tripEnd
      ? isWithinInterval(d, { start: tripStart, end: tripEnd })
      : false

  const isTripStartDay = (d: Date) => tripStart ? isSameDay(d, tripStart) : false
  const isTripEndDay = (d: Date) => tripEnd ? isSameDay(d, tripEnd) : false

  const remindersOnDay = (d: Date) =>
    reminders.filter(r => isSameDay(parseISO(r.date), d))

  const selectedReminders = selectedDay ? remindersOnDay(selectedDay) : []
  const allUpcoming = [...reminders].sort((a, b) => a.date.localeCompare(b.date))

  const handleAdd = () => {
    if (!form.title.trim()) return
    addReminder({ title: form.title, date: form.date, time: form.time, category: form.category, repeat: form.repeat })
    setForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', category: 'General', repeat: 'none' })
    setShowAdd(false)
  }

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>
          Calendar
        </h1>
        <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>
          {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} set
        </p>
      </div>

      {/* Month nav */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={18} color="#8A8A9A" />
        </button>
        <motion.h2 key={format(currentMonth, 'MMM yyyy')}
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h2>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronRight size={18} color="#8A8A9A" />
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ background: '#242429', borderRadius: 20, border: '1px solid #3A3A44', overflow: 'hidden' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px 0', color: '#5A5A6E', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {allCells.map((day, idx) => {
              if (!day) return <div key={idx} style={{ height: 44 }} />
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
              const isCurrent = isSameMonth(day, currentMonth)
              const tripDay = isTripDay(day)
              const startDay = isTripStartDay(day)
              const endDay = isTripEndDay(day)
              const hasReminders = remindersOnDay(day).length > 0

              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2, background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
                    borderRadius: 10,
                  }}
                >
                  {/* Trip range highlight */}
                  {tripDay && !startDay && !endDay && (
                    <div style={{ position: 'absolute', inset: '6px 0', background: 'rgba(255,77,0,0.12)' }} />
                  )}
                  {startDay && (
                    <div style={{ position: 'absolute', inset: '6px 0 6px 50%', background: 'rgba(255,77,0,0.12)', borderRadius: '0' }} />
                  )}
                  {endDay && (
                    <div style={{ position: 'absolute', inset: '6px 50% 6px 0', background: 'rgba(255,77,0,0.12)', borderRadius: '0' }} />
                  )}

                  {/* Day number bubble */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 1,
                    background: isSelected ? '#FF4D00' : isToday ? 'rgba(255,77,0,0.2)' : (startDay || endDay) ? 'rgba(255,77,0,0.3)' : 'transparent',
                    border: isToday && !isSelected ? '1.5px solid #FF4D00' : 'none',
                    boxShadow: isSelected ? '0 0 10px rgba(255,77,0,0.5)' : 'none',
                  }}>
                    <span style={{
                      fontSize: 12, fontWeight: isSelected || isToday || tripDay ? 700 : 400,
                      color: isSelected ? 'white' : isCurrent ? (tripDay ? '#FF8C42' : '#EFEFEF') : '#3A3A44',
                    }}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Reminder dot */}
                  {hasReminders && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E', position: 'relative', zIndex: 1 }} />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #3A3A44', display: 'flex', gap: 16 }}>
            {activeTrip && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,77,0,0.3)' }} />
                <span style={{ color: '#5A5A6E', fontSize: 11 }}>Trip days</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: '#5A5A6E', fontSize: 11 }}>Reminder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected day reminders */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '16px 16px 0', overflow: 'hidden', flexShrink: 0 }}
          >
            <div style={{ background: '#2C2C33', borderRadius: 16, border: '1px solid #3A3A44', padding: '14px 16px' }}>
              <p style={{ color: '#FF8C42', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
                {format(selectedDay, 'EEEE, MMMM d')}
              </p>
              {selectedReminders.length === 0 ? (
                <p style={{ color: '#5A5A6E', fontSize: 13, margin: 0 }}>No reminders on this day</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedReminders.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{CAT_EMOJI[r.category] || '🔔'}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#EFEFEF', fontSize: 13, fontWeight: 600, margin: 0 }}>{r.title}</p>
                        <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0' }}>{r.time} · {r.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming reminders */}
      <div style={{ padding: '20px 16px 100px', flexShrink: 0 }}>
        <p style={{ color: '#8A8A9A', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          All Reminders
        </p>
        {allUpcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <p style={{ color: '#5A5A6E', fontSize: 14 }}>No reminders yet.<br />Tap + to add one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allUpcoming.map(r => (
              <motion.div key={r.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                style={{ background: '#242429', borderRadius: 14, border: '1px solid #3A3A44', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${CAT_COLORS[r.category] || '#8A8A9A'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {CAT_EMOJI[r.category] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                  <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>
                    {format(parseISO(r.date), 'MMM d')} at {r.time} · {r.category}
                  </p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${CAT_COLORS[r.category] || '#8A8A9A'}20`, color: CAT_COLORS[r.category] || '#8A8A9A', flexShrink: 0 }}>
                  {r.repeat !== 'none' ? r.repeat : 'once'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add reminder modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Reminder</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input-base" placeholder="Reminder title *" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Date</p>
                    <input className="input-base" type="date" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Time</p>
                    <input className="input-base" type="time" value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>

                <div>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Category</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {REMINDER_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                        style={{
                          padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                          border: `1px solid ${form.category === cat ? CAT_COLORS[cat] : '#3A3A44'}`,
                          background: form.category === cat ? `${CAT_COLORS[cat]}20` : '#2C2C33',
                          color: form.category === cat ? CAT_COLORS[cat] : '#8A8A9A',
                        }}>
                        {CAT_EMOJI[cat]} {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Repeat</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['none', 'daily', 'weekly'].map(r => (
                      <button key={r} onClick={() => setForm(f => ({ ...f, repeat: r }))}
                        style={{
                          flex: 1, padding: '9px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                          border: `1px solid ${form.repeat === r ? '#FF4D00' : '#3A3A44'}`,
                          background: form.repeat === r ? 'rgba(255,77,0,0.15)' : '#2C2C33',
                          color: form.repeat === r ? '#FF4D00' : '#8A8A9A',
                        }}>
                        {r === 'none' ? 'Once' : r}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" onClick={handleAdd} disabled={!form.title.trim()} style={{ marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Bell size={16} /> Set Reminder
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="glow-orange"
        style={{ position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#FF4D00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
