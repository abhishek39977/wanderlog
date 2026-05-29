import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, Package, X } from 'lucide-react'
import { useTripStore } from '../store/tripStore'

const CATEGORIES = ['Clothing', 'Electronics', 'Documents', 'Toiletries', 'Medications', 'Footwear', 'Accessories', 'Other']

const CATEGORY_EMOJI: Record<string, string> = {
  Clothing: '👕', Electronics: '📱', Documents: '📄', Toiletries: '🧴',
  Medications: '💊', Footwear: '👟', Accessories: '🎒', Other: '📦',
}

const QUICK_ADD: Record<string, string[]> = {
  Clothing: ['T-shirts', 'Jeans', 'Underwear', 'Socks', 'Jacket', 'Swimwear'],
  Electronics: ['Phone charger', 'Power bank', 'Camera', 'Laptop', 'Adaptor', 'Earphones'],
  Documents: ['Passport', 'Visa', 'Insurance', 'Tickets', 'Hotel bookings', 'ID card'],
  Toiletries: ['Shampoo', 'Sunscreen', 'Toothbrush', 'Deodorant', 'Moisturiser'],
  Medications: ['Pain relief', 'Allergy meds', 'Band-aids', 'Antidiarrheal'],
}

// Progress ring
const ProgressRing: React.FC<{ percent: number; size?: number }> = ({ percent, size = 56 }) => {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2C2C33" strokeWidth={4} fill="none" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} stroke="#FF4D00" strokeWidth={4} fill="none"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 4px rgba(255,77,0,0.6))' }}
      />
    </svg>
  )
}

export const PackingListScreen: React.FC = () => {
  const { packingItems, addPackingItem, togglePackingItem, removePackingItem } = useTripStore()
  const [activeCategory, setActiveCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('Clothing')

  const categories = ['All', ...CATEGORIES]
  const filtered = activeCategory === 'All' ? packingItems : packingItems.filter(i => i.category === activeCategory)
  const packedCount = packingItems.filter(i => i.packed).length
  const totalCount = packingItems.length
  const percent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0

  const handleAdd = () => {
    if (!newItem.trim()) return
    addPackingItem({ name: newItem.trim(), category: newCategory, packed: false })
    setNewItem('')
    setShowAdd(false)
  }

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, typeof packingItems>)

  if (activeCategory !== 'All') {
    groupedByCategory[activeCategory] = filtered
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <ProgressRing percent={percent} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(90deg)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FF4D00' }}>{percent}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Packing List</h1>
            <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>
              {packedCount}/{totalCount} items packed
            </p>
          </div>
          <Package size={20} color="#FF8C42" />
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#2C2C33', borderRadius: 2, marginTop: 16, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: '#FF4D00', borderRadius: 2 }}
            initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8 }} />
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: '16px 0', overflowX: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, paddingLeft: 20, paddingRight: 20 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: `1px solid ${activeCategory === cat ? '#FF4D00' : '#3A3A44'}`,
                background: activeCategory === cat ? 'rgba(255,77,0,0.15)' : '#242429',
                color: activeCategory === cat ? '#FF4D00' : '#8A8A9A',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}>
              {cat === 'All' ? cat : `${CATEGORY_EMOJI[cat]} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        {totalCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎒</div>
            <p style={{ color: '#5A5A6E', fontSize: 15 }}>Your packing list is empty.<br />Tap + to add items.</p>
            {/* Quick add suggestions */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ color: '#8A8A9A', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Quick add essentials</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {['Passport', 'Phone charger', 'Sunscreen', 'T-shirts', 'Comfortable shoes'].map(s => (
                  <button key={s} onClick={() => addPackingItem({ name: s, category: 'Other', packed: false })}
                    style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #3A3A44', background: '#242429', color: '#8A8A9A', fontSize: 12, cursor: 'pointer' }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          Object.entries(activeCategory === 'All' ? groupedByCategory : { [activeCategory]: filtered }).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{CATEGORY_EMOJI[cat]}</span>
                <span style={{ color: '#FF8C42', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</span>
                <span style={{ color: '#5A5A6E', fontSize: 12 }}>({items.filter(i => i.packed).length}/{items.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                        background: '#242429', borderRadius: 12, border: `1px solid ${item.packed ? 'rgba(34,197,94,0.2)' : '#3A3A44'}`,
                      }}>
                      <button onClick={() => togglePackingItem(item.id)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                          background: item.packed ? '#22C55E' : 'transparent',
                          border: `2px solid ${item.packed ? '#22C55E' : '#3A3A44'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                        }}>
                        {item.packed && <Check size={13} color="white" strokeWidth={3} />}
                      </button>
                      <span style={{
                        flex: 1, fontSize: 14, color: item.packed ? '#5A5A6E' : '#EFEFEF',
                        textDecoration: item.packed ? 'line-through' : 'none', transition: 'all 0.2s',
                      }}>
                        {item.name}
                      </span>
                      <button onClick={() => removePackingItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A6E', padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add item modal */}
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
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Item</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}>
                  <X size={20} />
                </button>
              </div>
              <input className="input-base" placeholder="Item name" value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setNewCategory(cat)}
                    style={{
                      padding: '6px 12px', borderRadius: 16, border: `1px solid ${newCategory === cat ? '#FF4D00' : '#3A3A44'}`,
                      background: newCategory === cat ? 'rgba(255,77,0,0.15)' : '#2C2C33',
                      color: newCategory === cat ? '#FF4D00' : '#8A8A9A', fontSize: 12, cursor: 'pointer',
                    }}>
                    {CATEGORY_EMOJI[cat]} {cat}
                  </button>
                ))}
              </div>
              {QUICK_ADD[newCategory] && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Quick add</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {QUICK_ADD[newCategory].map(s => (
                      <button key={s} onClick={() => { addPackingItem({ name: s, category: newCategory, packed: false }) }}
                        style={{ padding: '6px 12px', borderRadius: 16, border: '1px solid #3A3A44', background: '#2C2C33', color: '#8A8A9A', fontSize: 12, cursor: 'pointer' }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn-primary" onClick={handleAdd} disabled={!newItem.trim()}>Add to List</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="glow-orange"
        style={{
          position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%',
          background: '#FF4D00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40,
        }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
