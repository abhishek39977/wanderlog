import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, MapPin, ExternalLink, Trash2, Check, Search } from 'lucide-react'
import { useTripStore } from '../store/tripStore'

const PLACE_CATEGORIES = [
  { value: 'Visited',  emoji: '✅', color: '#22C55E', label: 'Been There' },
  { value: 'Planned',  emoji: '📍', color: '#FF4D00', label: 'Must Visit' },
  { value: 'Food',     emoji: '🍜', color: '#FF8C42', label: 'Food & Drink' },
  { value: 'Stay',     emoji: '🏨', color: '#8B5CF6', label: 'Accommodation' },
  { value: 'Activity', emoji: '🎯', color: '#06B6D4', label: 'Activity' },
  { value: 'Hidden',   emoji: '💎', color: '#F4C430', label: 'Hidden Gem' },
]

const CAT_MAP = Object.fromEntries(PLACE_CATEGORIES.map(c => [c.value, c]))

export const PlacesScreen: React.FC = () => {
  const { places, addPlace, removePlace } = useTripStore()
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ name: '', notes: '', category: 'Planned', rating: 0 })
  const [search, setSearch] = useState('')

  const filtered = places.filter(p => {
    const matchCat = filter === 'All' || p.category === filter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.notes.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleAdd = () => {
    if (!form.name.trim()) return
    addPlace({ name: form.name.trim(), lat: 0, lng: 0, category: form.category, rating: form.rating, notes: form.notes, photos: [] })
    setForm({ name: '', notes: '', category: 'Planned', rating: 0 })
    setShowAdd(false)
  }

  const openGoogleMaps = (name: string) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}`, '_blank')
  }

  const stats = {
    total: places.length,
    visited: places.filter(p => p.category === 'Visited').length,
    planned: places.filter(p => p.category === 'Planned').length,
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>
            Places
          </h1>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>✅ {stats.visited}</span>
            </div>
            <div style={{ background: 'rgba(255,77,0,0.12)', border: '1px solid rgba(255,77,0,0.25)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#FF4D00', fontWeight: 700 }}>📍 {stats.planned}</span>
            </div>
          </div>
        </div>
        <p style={{ color: '#8A8A9A', fontSize: 13, margin: 0 }}>{stats.total} places · Powered by Google Maps</p>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
          <input
            className="input-base"
            placeholder="Search places..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38, height: 42 }}
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div style={{ padding: '10px 0', overflowX: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, paddingLeft: 20, paddingRight: 20 }}>
          {['All', ...PLACE_CATEGORIES.map(c => c.value)].map(cat => {
            const meta = cat === 'All' ? null : CAT_MAP[cat]
            const isActive = filter === cat
            return (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '7px 14px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                border: `1px solid ${isActive ? (meta?.color || '#FF4D00') : '#3A3A44'}`,
                background: isActive ? `${meta?.color || '#FF4D00'}18` : '#242429',
                color: isActive ? (meta?.color || '#FF4D00') : '#8A8A9A', transition: 'all 0.2s',
              }}>
                {cat === 'All' ? '🗺️ All' : `${meta?.emoji} ${meta?.label}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Places list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 100px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🗺️</div>
            <p style={{ color: '#5A5A6E', fontSize: 15, lineHeight: 1.6 }}>
              {places.length === 0
                ? 'No places yet.\nAdd spots you\'ve visited or plan to go!'
                : 'No places match your filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((place, idx) => {
              const meta = CAT_MAP[place.category] || PLACE_CATEGORIES[1]
              return (
                <motion.div key={place.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  style={{
                    background: '#242429', borderRadius: 16,
                    border: `1px solid ${place.category === 'Visited' ? 'rgba(34,197,94,0.2)' : '#3A3A44'}`,
                    padding: '16px',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Category icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>
                      {meta.emoji}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ color: '#EFEFEF', fontSize: 15, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {place.name}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: meta.color, fontWeight: 600, background: `${meta.color}15`, padding: '2px 8px', borderRadius: 8 }}>
                        {meta.label}
                      </span>
                      {place.notes && (
                        <p style={{ color: '#8A8A9A', fontSize: 12, margin: '6px 0 0', lineHeight: 1.4 }}>{place.notes}</p>
                      )}
                      {place.rating > 0 && (
                        <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                          {'⭐'.repeat(place.rating)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => openGoogleMaps(place.name)}
                        style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ExternalLink size={13} color="#06B6D4" />
                      </button>
                      <button onClick={() => removePlace(place.id)}
                        style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={13} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Place modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#1E1E24', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44', maxHeight: '90vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Place</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="#8A8A9A" />
                </button>
              </div>

              {/* Place name */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <MapPin size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
                <input className="input-base" placeholder="Place name *" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus style={{ paddingLeft: 38 }} />
              </div>

              {/* Category */}
              <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Category</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {PLACE_CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    style={{
                      padding: '10px 6px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${form.category === cat.value ? cat.color : '#3A3A44'}`,
                      background: form.category === cat.value ? `${cat.color}18` : '#2C2C33',
                      color: form.category === cat.value ? cat.color : '#8A8A9A',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}>
                    <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Rating */}
              <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Rating (optional)</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, rating: f.rating === n ? 0 : n }))}
                    style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', opacity: form.rating >= n ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                    ⭐
                  </button>
                ))}
              </div>

              {/* Notes */}
              <textarea className="input-base" placeholder="Notes (optional)" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ marginBottom: 20, resize: 'none', height: 80 }} />

              <button className="btn-primary" onClick={handleAdd} disabled={!form.name.trim()}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <MapPin size={16} /> Add Place
                </span>
              </button>
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
