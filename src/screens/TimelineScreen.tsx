import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useTripStore } from '../store/tripStore'
import type { DayChapter, TimelineEvent } from '../store/tripStore'
import { format, parseISO } from 'date-fns'

const EVENT_TYPES = [
  { type: 'flight', emoji: '✈️', color: '#06B6D4' },
  { type: 'hotel', emoji: '🏨', color: '#8B5CF6' },
  { type: 'food', emoji: '🍽️', color: '#FF8C42' },
  { type: 'activity', emoji: '🎯', color: '#22C55E' },
  { type: 'transport', emoji: '🚗', color: '#FF4D00' },
  { type: 'explore', emoji: '🗺️', color: '#06B6D4' },
]

const MOODS = ['😊', '🤩', '😌', '😴', '🌧️', '🔥', '❤️', '🤔']

const EventCard: React.FC<{ event: TimelineEvent }> = ({ event }) => {
  const typeData = EVENT_TYPES.find(t => t.type === event.type) || EVENT_TYPES[3]
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 14px', background: '#2C2C33',
      borderRadius: 12, border: `1px solid #3A3A44`, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ width: 3, background: typeData.color, borderRadius: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>{typeData.emoji}</span>
          <span style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600 }}>{event.title}</span>
        </div>
        {event.time && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8A8A9A', fontSize: 12 }}>
            <Clock size={11} /> {event.time}
          </div>
        )}
        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8A8A9A', fontSize: 12, marginTop: 2 }}>
            <MapPin size={11} /> {event.location}
          </div>
        )}
        {event.description && (
          <p style={{ color: '#5A5A6E', fontSize: 12, margin: '6px 0 0', lineHeight: 1.5 }}>{event.description}</p>
        )}
      </div>
    </div>
  )
}

const DayCard: React.FC<{ chapter: DayChapter; dayNum: number; onAddEvent: (chapterId: string) => void; onUpdateChapter: (c: DayChapter) => void }> = ({ chapter, dayNum, onAddEvent, onUpdateChapter }) => {
  const [expanded, setExpanded] = useState(dayNum === 1)

  return (
    <motion.div
      layout
      style={{ background: '#242429', borderRadius: 20, border: '1px solid #3A3A44', overflow: 'hidden', marginBottom: 14 }}
    >
      {/* Day header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #FF4D00, #FF8C42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>D{dayNum}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#EFEFEF', fontSize: 15, fontWeight: 600, margin: 0 }}>{chapter.title}</p>
          <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>
            {format(parseISO(chapter.date), 'EEEE, MMM d')} · {chapter.events.length} events
          </p>
        </div>
        {chapter.mood && <span style={{ fontSize: 20 }}>{chapter.mood}</span>}
        {expanded ? <ChevronUp size={16} color="#5A5A6E" /> : <ChevronDown size={16} color="#5A5A6E" />}
      </button>

      {/* Timeline line + events */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 16px', borderTop: '1px solid #3A3A44' }}>
              {/* Mood picker */}
              <div style={{ display: 'flex', gap: 6, paddingTop: 12, marginBottom: 12 }}>
                <span style={{ color: '#5A5A6E', fontSize: 11, alignSelf: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>Mood</span>
                {MOODS.map(m => (
                  <button key={m} onClick={() => onUpdateChapter({ ...chapter, mood: m })}
                    style={{
                      fontSize: 18, background: chapter.mood === m ? 'rgba(255,77,0,0.15)' : 'transparent',
                      border: `1px solid ${chapter.mood === m ? '#FF4D00' : 'transparent'}`,
                      borderRadius: 8, width: 32, height: 32, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                {chapter.events.length > 0 && (
                  <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #FF4D00, transparent)', borderRadius: 1 }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: chapter.events.length > 0 ? 16 : 0 }}>
                  {chapter.events.map(ev => <EventCard key={ev.id} event={ev} />)}
                </div>
                <button onClick={() => onAddEvent(chapter.id)}
                  style={{
                    padding: '10px', borderRadius: 12, border: '1px dashed #3A3A44', background: 'transparent',
                    color: '#5A5A6E', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = '#FF4D00'; (e.currentTarget).style.color = '#FF4D00' }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = '#3A3A44'; (e.currentTarget).style.color = '#5A5A6E' }}
                >
                  <Plus size={14} /> Add Event
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const TimelineScreen: React.FC = () => {
  const { dayChapters, updateDayChapter } = useTripStore()
  const [showAddEvent, setShowAddEvent] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState({ title: '', time: '', location: '', description: '', type: 'activity' })

  const handleSaveEvent = () => {
    if (!newEvent.title || !showAddEvent) return
    const chapter = dayChapters.find(d => d.id === showAddEvent)
    if (!chapter) return
    const event: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      dayIndex: dayChapters.indexOf(chapter),
      ...newEvent,
    }
    updateDayChapter({ ...chapter, events: [...chapter.events, event] })
    setNewEvent({ title: '', time: '', location: '', description: '', type: 'activity' })
    setShowAddEvent(null)
  }

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Timeline</h1>
        <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>{dayChapters.length} day{dayChapters.length !== 1 ? 's' : ''} planned</p>
      </div>

      {/* Day chapters */}
      <div style={{ padding: '0 20px 100px', overflowY: 'auto', flex: 1 }}>
        {dayChapters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <p style={{ color: '#5A5A6E', fontSize: 15 }}>No days planned yet.<br />Create a trip first to unlock your timeline.</p>
          </div>
        ) : (
          dayChapters.map((chapter, idx) => (
            <DayCard key={chapter.id} chapter={chapter} dayNum={idx + 1}
              onAddEvent={setShowAddEvent}
              onUpdateChapter={updateDayChapter} />
          ))
        )}
      </div>

      {/* Add event modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAddEvent(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Event</h3>
                <button onClick={() => setShowAddEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>

              {/* Event type */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
                {EVENT_TYPES.map(t => (
                  <button key={t.type} onClick={() => setNewEvent(e => ({ ...e, type: t.type }))}
                    style={{
                      padding: '8px 14px', borderRadius: 20, border: `1px solid ${newEvent.type === t.type ? t.color : '#3A3A44'}`,
                      background: newEvent.type === t.type ? `${t.color}20` : '#2C2C33',
                      cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13,
                    }}>
                    {t.emoji} {t.type}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input-base" placeholder="Event title *" value={newEvent.title} onChange={e => setNewEvent(ev => ({ ...ev, title: e.target.value }))} />
                <input className="input-base" type="time" value={newEvent.time} onChange={e => setNewEvent(ev => ({ ...ev, time: e.target.value }))} style={{ colorScheme: 'dark' }} />
                <input className="input-base" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent(ev => ({ ...ev, location: e.target.value }))} />
                <textarea className="input-base" placeholder="Notes (optional)" value={newEvent.description}
                  onChange={e => setNewEvent(ev => ({ ...ev, description: e.target.value }))}
                  style={{ minHeight: 80, resize: 'none' }} />
              </div>

              <button className="btn-primary" onClick={handleSaveEvent} disabled={!newEvent.title} style={{ marginTop: 20 }}>Add Event</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
