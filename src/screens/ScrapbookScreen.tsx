import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Trash2, Type, Image as ImageIcon, X, Download, BookOpen, Layers } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ScrapItem {
  id: string
  type: 'image' | 'text' | 'sticker' | 'stamp'
  x: number
  y: number
  content: string
  fontSize?: number
  color?: string
  rotation?: number
  scale?: number
  width?: number
}

interface ScrapPage {
  id: string
  title: string
  template: string
  items: ScrapItem[]
  bgColor: string
}

// ─── Template definitions ────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'dark-vintage',
    name: 'Dark Vintage',
    preview: '🎞️',
    bg: '#1A1410',
    accent: '#C9A84C',
    desc: 'Old film, warm tones',
  },
  {
    id: 'neon-wanderer',
    name: 'Neon Wanderer',
    preview: '🌃',
    bg: '#0D0D1A',
    accent: '#FF4D00',
    desc: 'Dark city, neon glow',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    preview: '🖤',
    bg: '#111114',
    accent: '#EFEFEF',
    desc: 'Clean, editorial style',
  },
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    preview: '🌊',
    bg: '#060E1A',
    accent: '#06B6D4',
    desc: 'Deep blue, coastal',
  },
  {
    id: 'forest-trek',
    name: 'Forest Trek',
    preview: '🌲',
    bg: '#0A130A',
    accent: '#22C55E',
    desc: 'Dark green, nature',
  },
  {
    id: 'sunset-blush',
    name: 'Sunset Blush',
    preview: '🌅',
    bg: '#1A0D0A',
    accent: '#FF8C42',
    desc: 'Warm amber hues',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    preview: '🌌',
    bg: '#0A0714',
    accent: '#8B5CF6',
    desc: 'Deep purple cosmos',
  },
  {
    id: 'polaroid-wall',
    name: 'Polaroid Wall',
    preview: '📸',
    bg: '#F5F0E8',
    accent: '#FF4D00',
    desc: 'Classic white border',
  },
  {
    id: 'night-city',
    name: 'Night City',
    preview: '🏙️',
    bg: '#080C10',
    accent: '#EC4899',
    desc: 'Pink neon city nights',
  },
  {
    id: 'desert-dust',
    name: 'Desert Dust',
    preview: '🏜️',
    bg: '#1A1208',
    accent: '#D97706',
    desc: 'Sandy warm palette',
  },
]

const STICKERS = ['✈️','🗺️','🌴','🏖️','⛰️','🌅','🍜','📸','🎒','🌍','🧳','🚂','🛵','🌺','💫','🔥','✨','🎭','🏄','🌊','🍣','🍕','🥂','🎡','🚢','🏔️','🌸','🌻','🦋','🦜']
const TRAVEL_STAMPS = ['🛂','🗼','🎌','🗽','🏰','🕌','⛩️','🏛️','🕍','🗿']
function genId() { return Math.random().toString(36).substr(2, 9) }

const createPage = (template: typeof TEMPLATES[0]): ScrapPage => ({
  id: genId(),
  title: 'New Page',
  template: template.id,
  items: [],
  bgColor: template.bg,
})

// ─── Component ───────────────────────────────────────────────────────────────
interface ScrapbookScreenProps {
  onNavigate?: (screen: string) => void
}

export const ScrapbookScreen: React.FC<ScrapbookScreenProps> = ({ onNavigate }) => {
  const [pages, setPages] = useState<ScrapPage[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [showTemplates, setShowTemplates] = useState(true)
  const [showAddPanel, setShowAddPanel] = useState<'stickers' | 'stamps' | 'images' | 'text' | null>(null)
  const [textInput, setTextInput] = useState('')
  const [textColor, setTextColor] = useState('#EFEFEF')
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const activePage = pages[pageIndex] || null
  const activeTemplate = TEMPLATES.find(t => t.id === activePage?.template) || TEMPLATES[0]

  // ── Page mutations ──
  const updatePage = (updater: (p: ScrapPage) => ScrapPage) => {
    setPages(prev => prev.map((p, i) => i === pageIndex ? updater(p) : p))
  }

  const addItem = (item: Omit<ScrapItem, 'id'>) => {
    updatePage(p => ({ ...p, items: [...p.items, { ...item, id: genId() }] }))
    setShowAddPanel(null)
  }

  const deleteSelected = () => {
    updatePage(p => ({ ...p, items: p.items.filter(i => i.id !== selected) }))
    setSelected(null)
  }

  const rotateSelected = (deg: number) => {
    updatePage(p => ({ ...p, items: p.items.map(i => i.id === selected ? { ...i, rotation: (i.rotation || 0) + deg } : i) }))
  }

  const scaleSelected = (factor: number) => {
    updatePage(p => ({ ...p, items: p.items.map(i => i.id === selected ? { ...i, scale: Math.max(0.3, Math.min(3, (i.scale || 1) * factor)) } : i) }))
  }

  // ── Drag ──
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    setSelected(id)
    const item = activePage?.items.find(i => i.id === id)
    if (!item) return
    setDragging({ id, startX: e.clientX, startY: e.clientY, itemX: item.x, itemY: item.y })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragging.startX
    const dy = e.clientY - dragging.startY
    updatePage(p => ({
      ...p,
      items: p.items.map(i => i.id === dragging.id ? { ...i, x: dragging.itemX + dx, y: dragging.itemY + dy } : i),
    }))
  }

  const handlePointerUp = () => setDragging(null)

  // ── Handle photo file upload ──
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const url = ev.target?.result as string
        setUploadedImages(prev => [...prev, url])
        // Immediately add to scrapbook canvas
        addItem({ type: 'image', x: 20 + Math.random() * 80, y: 20 + Math.random() * 100, content: url, rotation: (Math.random() - 0.5) * 10, scale: 1 })
      }
      reader.readAsDataURL(file)
    })
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  // ── Template picker ──
  if (showTemplates) {
    return (
      <div className="screen" style={{ overflowY: 'auto' }}>
        <div style={{ padding: '20px 20px 0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          {onNavigate && (
            <button onClick={() => onNavigate('home')}
              style={{ width: 36, height: 36, borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              title="Back to Home">
              🏠
            </button>
          )}
          {pages.length > 0 && (
            <button onClick={() => setShowTemplates(false)}
              style={{ width: 36, height: 36, borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={18} color="#8A8A9A" />
            </button>
          )}
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Scrapbook</h1>
            <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>
              {pages.length === 0 ? 'Choose a template to start' : `${pages.length} page${pages.length !== 1 ? 's' : ''} — add another`}
            </p>
          </div>
        </div>

        <div style={{ padding: '20px 20px 100px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {TEMPLATES.map((tmpl, i) => (
            <motion.button
              key={tmpl.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newPage = createPage(tmpl)
                if (pages.length === 0) {
                  setPages([newPage])
                  setPageIndex(0)
                } else {
                  setPages(prev => [...prev, newPage])
                  setPageIndex(pages.length)
                }
                setShowTemplates(false)
              }}
              style={{
                background: tmpl.bg, border: `1px solid ${tmpl.accent}30`,
                borderRadius: 16, padding: '20px 14px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Accent corner */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 60, height: 60,
                background: `radial-gradient(circle at top right, ${tmpl.accent}25 0%, transparent 70%)`,
              }} />
              <span style={{ fontSize: 32 }}>{tmpl.preview}</span>
              <p style={{ color: tmpl.accent, fontSize: 13, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                {tmpl.name}
              </p>
              <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0 }}>{tmpl.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  if (!activePage) return null

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { setShowTemplates(true); setSelected(null) }}
            style={{ width: 34, height: 34, borderRadius: 9, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <BookOpen size={15} color="#8A8A9A" />
          </button>
          <div>
            <p style={{ color: '#FF8C42', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, margin: 0 }}>
              Page {pageIndex + 1} of {pages.length}
            </p>
            <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>{activeTemplate.name}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {selected && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
              onClick={deleteSelected}
              style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Trash2 size={14} color="#EF4444" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => { setShowSaved(true); setTimeout(() => setShowSaved(false), 2000) }}
            style={{
              padding: '7px 14px', borderRadius: 18,
              background: showSaved ? '#22C55E' : '#FF4D00',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.3s',
            }}>
            <Download size={13} color="white" />
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{showSaved ? 'Saved!' : 'Export'}</span>
          </motion.button>
        </div>
      </div>

      {/* Page navigation */}
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={() => { setPageIndex(Math.max(0, pageIndex - 1)); setSelected(null) }}
          disabled={pageIndex === 0}
          style={{ width: 28, height: 28, borderRadius: 8, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pageIndex === 0 ? 'not-allowed' : 'pointer', opacity: pageIndex === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={14} color="#8A8A9A" />
        </button>

        <div style={{ flex: 1, display: 'flex', gap: 4, overflowX: 'auto' }}>
          {pages.map((p, i) => (
            <button key={p.id} onClick={() => { setPageIndex(i); setSelected(null) }}
              style={{
                width: 28, height: 20, borderRadius: 5, cursor: 'pointer', flexShrink: 0,
                background: i === pageIndex ? '#FF4D00' : '#242429',
                border: `1px solid ${i === pageIndex ? '#FF4D00' : '#3A3A44'}`,
                boxShadow: i === pageIndex ? '0 0 8px rgba(255,77,0,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            />
          ))}
          <button
            onClick={() => setShowTemplates(true)}
            style={{ width: 28, height: 20, borderRadius: 5, cursor: 'pointer', flexShrink: 0, background: 'transparent', border: '1px dashed #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={10} color="#5A5A6E" />
          </button>
        </div>

        <button onClick={() => { setPageIndex(Math.min(pages.length - 1, pageIndex + 1)); setSelected(null) }}
          disabled={pageIndex >= pages.length - 1}
          style={{ width: 28, height: 28, borderRadius: 8, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pageIndex >= pages.length - 1 ? 'not-allowed' : 'pointer', opacity: pageIndex >= pages.length - 1 ? 0.3 : 1 }}>
          <ChevronRight size={14} color="#8A8A9A" />
        </button>
      </div>

      {/* Selection controls */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ padding: '6px 16px 0', display: 'flex', gap: 6, flexShrink: 0 }}>
            {[
              { label: '↺', action: () => rotateSelected(-15) },
              { label: '↻', action: () => rotateSelected(15) },
              { label: '−', action: () => scaleSelected(0.85) },
              { label: '+', action: () => scaleSelected(1.15) },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)', color: '#FF8C42', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {btn.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => setSelected(null)}
        style={{
          flex: 1, margin: '8px 16px 0', borderRadius: 16, overflow: 'hidden',
          background: activePage.bgColor,
          border: `1px solid ${activeTemplate.accent}30`,
          position: 'relative',
          cursor: 'crosshair',
          boxShadow: `0 0 40px ${activeTemplate.accent}18`,
        }}
      >
        {/* Subtle texture pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
          <defs>
            <pattern id="scrap-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={activeTemplate.accent} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#scrap-grid)" />
        </svg>

        {/* Accent corner decoration */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 100, height: 100,
          background: `radial-gradient(circle at top right, ${activeTemplate.accent}12 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: 80, height: 80,
          background: `radial-gradient(circle at bottom left, ${activeTemplate.accent}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Empty state */}
        {activePage.items.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
            <span style={{ fontSize: 36, opacity: 0.3 }}>{activeTemplate.preview}</span>
            <p style={{ color: activeTemplate.accent, fontSize: 12, opacity: 0.4, margin: 0, textAlign: 'center' }}>
              Tap buttons below<br />to add content
            </p>
          </div>
        )}

        {/* Canvas items */}
        {activePage.items.map(item => (
          <div
            key={item.id}
            onPointerDown={e => handlePointerDown(e, item.id)}
            style={{
              position: 'absolute',
              left: item.x, top: item.y,
              transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
              cursor: 'grab',
              outline: selected === item.id ? `2px solid ${activeTemplate.accent}` : 'none',
              outlineOffset: 4,
              borderRadius: 6,
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {item.type === 'image' && (
              <img src={item.content} alt=""
                style={{ width: item.width || 130, borderRadius: 8, display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}
                draggable={false} />
            )}
            {item.type === 'text' && (
              <p style={{
                color: item.color || activeTemplate.accent,
                fontSize: item.fontSize || 16,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                margin: 0, whiteSpace: 'nowrap',
                textShadow: `0 2px 8px rgba(0,0,0,0.6)`,
              }}>{item.content}</p>
            )}
            {(item.type === 'sticker' || item.type === 'stamp') && (
              <span style={{ fontSize: item.fontSize || 36, lineHeight: 1, display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}>
                {item.content}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ padding: '8px 16px 10px', display: 'flex', gap: 8, flexShrink: 0 }}>
        {[
          { panel: 'text' as const, icon: <Type size={16} />, label: 'Text' },
          { panel: 'stickers' as const, icon: <span style={{ fontSize: 16 }}>✨</span>, label: 'Sticker' },
          { panel: 'stamps' as const, icon: <span style={{ fontSize: 16 }}>🛂</span>, label: 'Stamp' },
          { panel: 'images' as const, icon: <ImageIcon size={16} />, label: 'Photo' },
        ].map(btn => (
          <motion.button key={btn.panel} whileTap={{ scale: 0.93 }}
            onClick={() => setShowAddPanel(showAddPanel === btn.panel ? null : btn.panel)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 12, cursor: 'pointer',
              background: showAddPanel === btn.panel ? 'rgba(255,77,0,0.15)' : '#242429',
              border: `1px solid ${showAddPanel === btn.panel ? '#FF4D00' : '#3A3A44'}`,
              color: showAddPanel === btn.panel ? '#FF4D00' : '#8A8A9A',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
            {btn.icon}
            <span style={{ fontSize: 10, fontWeight: 600 }}>{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Add panels */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            key={showAddPanel}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: '#1E1E24', borderRadius: '20px 20px 0 0',
              border: '1px solid #3A3A44', padding: '16px 16px 28px',
              maxHeight: '50vh', overflowY: 'auto', zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: '#EFEFEF', margin: 0, textTransform: 'capitalize' }}>
                Add {showAddPanel === 'stickers' ? 'Sticker' : showAddPanel === 'stamps' ? 'Travel Stamp' : showAddPanel === 'images' ? 'Photo' : 'Text'}
              </h3>
              <button onClick={() => setShowAddPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}>
                <X size={18} />
              </button>
            </div>

            {showAddPanel === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="input-base" placeholder="Type something..." value={textInput}
                  onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && textInput.trim() && addItem({ type: 'text', x: 40 + Math.random() * 100, y: 40 + Math.random() * 100, content: textInput, fontSize: 18, color: textColor, rotation: (Math.random() - 0.5) * 10, scale: 1 })} autoFocus />
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#EFEFEF', activeTemplate.accent, '#FF8C42', '#22C55E', '#06B6D4', '#8B5CF6', '#F4C430', '#EF4444'].map(c => (
                    <button key={c} onClick={() => setTextColor(c)}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `2px solid ${textColor === c ? '#FF4D00' : 'transparent'}`, cursor: 'pointer' }} />
                  ))}
                </div>
                <button className="btn-primary" disabled={!textInput.trim()}
                  onClick={() => { if (!textInput.trim()) return; addItem({ type: 'text', x: 40 + Math.random() * 100, y: 40 + Math.random() * 100, content: textInput, fontSize: 18, color: textColor, rotation: (Math.random() - 0.5) * 10, scale: 1 }); setTextInput('') }}>
                  Add Text
                </button>
              </div>
            )}

            {showAddPanel === 'stickers' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {STICKERS.map(emoji => (
                  <motion.button key={emoji} whileTap={{ scale: 0.8 }}
                    onClick={() => addItem({ type: 'sticker', x: 60 + Math.random() * 150, y: 60 + Math.random() * 150, content: emoji, fontSize: 36, rotation: (Math.random() - 0.5) * 20, scale: 1 })}
                    style={{ fontSize: 28, background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 10, padding: '8px 0', cursor: 'pointer' }}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
            )}

            {showAddPanel === 'stamps' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {TRAVEL_STAMPS.map(stamp => (
                  <motion.button key={stamp} whileTap={{ scale: 0.85 }}
                    onClick={() => addItem({ type: 'stamp', x: 80 + Math.random() * 120, y: 60 + Math.random() * 120, content: stamp, fontSize: 40, rotation: (Math.random() - 0.5) * 25, scale: 1 })}
                    style={{ fontSize: 36, background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 10, padding: '10px 0', cursor: 'pointer' }}>
                    {stamp}
                  </motion.button>
                ))}
              </div>
            )}

            {showAddPanel === 'images' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* File upload button */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,77,0,0.1)', border: '2px dashed rgba(255,77,0,0.3)', color: '#FF4D00', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  📷 Upload Photo from Device
                </button>
                {uploadedImages.length > 0 && (
                  <>
                    <p style={{ color: '#5A5A6E', fontSize: 11, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Recent Uploads ({uploadedImages.length})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {uploadedImages.slice().reverse().map((url, i) => (
                        <motion.div key={i} whileTap={{ scale: 0.93 }}
                          onClick={() => addItem({ type: 'image', x: 20 + Math.random() * 80, y: 20 + Math.random() * 100, content: url, rotation: (Math.random() - 0.5) * 10, scale: 1 })}
                          style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1', border: '1px solid #3A3A44' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
                {uploadedImages.length === 0 && (
                  <p style={{ color: '#5A5A6E', fontSize: 13, textAlign: 'center', margin: '8px 0' }}>
                    Upload photos from your device to add them to the scrapbook
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
