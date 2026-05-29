import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Star, ExternalLink, Check } from 'lucide-react'
import { useTripStore } from '../store/tripStore'

const CATEGORIES = ['Food', 'Activities', 'Shopping', 'Stay', 'Other']
const CAT_EMOJI: Record<string, string> = {
  Food: '🍽️', Activities: '🎯', Shopping: '🛍️', Stay: '🏨', Other: '💫',
}
const CAT_COLORS: Record<string, string> = {
  Food: '#FF8C42', Activities: '#22C55E', Shopping: '#8B5CF6', Stay: '#06B6D4', Other: '#8A8A9A',
}

export const WishlistScreen: React.FC = () => {
  const { wishlistItems, addWishlistItem, toggleWishlistItem } = useTripStore()
  const [showAdd, setShowAdd] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [form, setForm] = useState({ title: '', category: 'Activities', url: '', priority: false })

  const filtered = activeCategory === 'All'
    ? wishlistItems
    : wishlistItems.filter(i => i.category === activeCategory)

  const active = filtered.filter(i => !i.completed)
  const done = filtered.filter(i => i.completed)

  const handleAdd = () => {
    if (!form.title.trim()) return
    addWishlistItem({ title: form.title, category: form.category, url: form.url, priority: form.priority, completed: false })
    setForm({ title: '', category: 'Activities', url: '', priority: false })
    setShowAdd(false)
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Wishlist</h1>
        <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>{active.length} things to do · {done.length} done</p>
      </div>

      {/* Category pills */}
      <div style={{ padding: '16px 0', overflowX: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, paddingLeft: 20, paddingRight: 20 }}>
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px', borderRadius: 20,
                border: `1px solid ${activeCategory === cat ? '#FF4D00' : '#3A3A44'}`,
                background: activeCategory === cat ? 'rgba(255,77,0,0.15)' : '#242429',
                color: activeCategory === cat ? '#FF4D00' : '#8A8A9A',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}>
              {cat === 'All' ? '✨ All' : `${CAT_EMOJI[cat]} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
            <p style={{ color: '#5A5A6E', fontSize: 15 }}>Your wishlist is empty.<br />Add places, food, and experiences you want to try.</p>
          </div>
        ) : (
          <>
            {/* Active items */}
            <AnimatePresence>
              {active.map((item, idx) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    background: '#242429', borderRadius: 16, border: '1px solid #3A3A44',
                    padding: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  {/* Category dot */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${CAT_COLORS[item.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {CAT_EMOJI[item.category]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {item.priority && <Star size={12} fill="#FF4D00" color="#FF4D00" />}
                      <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: `${CAT_COLORS[item.category]}20`, color: CAT_COLORS[item.category],
                      }}>
                        {item.category}
                      </span>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer"
                          style={{ color: '#8A8A9A', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
                          <ExternalLink size={11} /> Link
                        </a>
                      )}
                    </div>
                  </div>

                  <button onClick={() => toggleWishlistItem(item.id)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      background: 'transparent', border: '2px solid #3A3A44',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = '#22C55E'; (e.currentTarget).style.background = 'rgba(34,197,94,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = '#3A3A44'; (e.currentTarget).style.background = 'transparent' }}
                  >
                    <Check size={16} color="#3A3A44" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Completed */}
            {done.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
                  ✓ Done ({done.length})
                </p>
                {done.map(item => (
                  <div key={item.id} style={{
                    background: 'rgba(34,197,94,0.05)', borderRadius: 14, border: '1px solid rgba(34,197,94,0.15)',
                    padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7,
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={14} color="white" strokeWidth={3} />
                    </div>
                    <p style={{ color: '#5A5A6E', fontSize: 13, margin: 0, textDecoration: 'line-through', flex: 1 }}>{item.title}</p>
                    <button onClick={() => toggleWishlistItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A6E', fontSize: 11 }}>
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add to Wishlist</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input-base" placeholder="What do you want to try? *" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                <input className="input-base" placeholder="Link / URL (optional)" value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                      style={{
                        padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                        border: `1px solid ${form.category === cat ? CAT_COLORS[cat] : '#3A3A44'}`,
                        background: form.category === cat ? `${CAT_COLORS[cat]}20` : '#2C2C33',
                        color: form.category === cat ? CAT_COLORS[cat] : '#8A8A9A',
                      }}>
                      {CAT_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div onClick={() => setForm(f => ({ ...f, priority: !f.priority }))}
                    style={{
                      width: 20, height: 20, borderRadius: 5, border: `2px solid ${form.priority ? '#FF4D00' : '#3A3A44'}`,
                      background: form.priority ? '#FF4D00' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    }}>
                    {form.priority && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ color: '#8A8A9A', fontSize: 13 }}>Mark as priority ⭐</span>
                </label>
                <button className="btn-primary" onClick={handleAdd} disabled={!form.title.trim()} style={{ marginTop: 8 }}>
                  Add to Wishlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)}
        className="glow-orange"
        style={{ position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#FF4D00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
