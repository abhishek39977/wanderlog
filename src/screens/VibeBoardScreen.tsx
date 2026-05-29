import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Type, Image as ImageIcon, Trash2, Download, Palette, X } from 'lucide-react'

interface VibeBoardItem {
  id: string
  type: 'image' | 'text' | 'sticker'
  x: number
  y: number
  content: string
  fontSize?: number
  color?: string
  rotation?: number
  scale?: number
}

const STICKERS = ['✈️','🗺️','🌴','🏖️','⛰️','🌅','🍜','📸','🎒','🌍','🧳','🚂','🛵','🌺','💫','🔥','✨','🎭','🏄','🌊']
const TEXT_COLORS = ['#EFEFEF','#FF4D00','#FF8C42','#22C55E','#06B6D4','#8B5CF6','#F4C430','#EF4444']

const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/vibe1/300/200',
  'https://picsum.photos/seed/vibe2/300/200',
  'https://picsum.photos/seed/vibe3/300/200',
  'https://picsum.photos/seed/vibe4/200/300',
  'https://picsum.photos/seed/vibe5/300/200',
  'https://picsum.photos/seed/vibe6/300/200',
]

export const VibeBoardScreen: React.FC = () => {
  const [items, setItems] = useState<VibeBoardItem[]>([])
  const [tool, setTool] = useState<'select' | 'text' | 'sticker' | 'image'>('select')
  const [showPanel, setShowPanel] = useState<'stickers' | 'images' | 'text' | null>(null)
  const [textInput, setTextInput] = useState('')
  const [textColor, setTextColor] = useState('#EFEFEF')
  const [fontSize, setFontSize] = useState(18)
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const getId = () => Math.random().toString(36).substr(2, 9)

  const addText = () => {
    if (!textInput.trim()) return
    setItems(prev => [...prev, {
      id: getId(), type: 'text', x: 80 + Math.random() * 120, y: 80 + Math.random() * 200,
      content: textInput, fontSize, color: textColor, rotation: (Math.random() - 0.5) * 10, scale: 1,
    }])
    setTextInput('')
    setShowPanel(null)
  }

  const addSticker = (emoji: string) => {
    setItems(prev => [...prev, {
      id: getId(), type: 'sticker', x: 60 + Math.random() * 180, y: 60 + Math.random() * 300,
      content: emoji, fontSize: 36, rotation: (Math.random() - 0.5) * 20, scale: 1,
    }])
    setShowPanel(null)
  }

  const addImage = (url: string) => {
    setItems(prev => [...prev, {
      id: getId(), type: 'image', x: 20 + Math.random() * 100, y: 60 + Math.random() * 200,
      content: url, rotation: (Math.random() - 0.5) * 8, scale: 1,
    }])
    setShowPanel(null)
  }

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    setSelected(id)
    const item = items.find(i => i.id === id)
    if (!item) return
    setDragging({ id, startX: e.clientX, startY: e.clientY, itemX: item.x, itemY: item.y })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragging.startX
    const dy = e.clientY - dragging.startY
    setItems(prev => prev.map(i => i.id === dragging.id ? { ...i, x: dragging.itemX + dx, y: dragging.itemY + dy } : i))
  }

  const handlePointerUp = () => setDragging(null)

  const deleteSelected = () => {
    setItems(prev => prev.filter(i => i.id !== selected))
    setSelected(null)
  }

  const rotateSelected = (deg: number) => {
    setItems(prev => prev.map(i => i.id === selected ? { ...i, rotation: (i.rotation || 0) + deg } : i))
  }

  const scaleSelected = (factor: number) => {
    setItems(prev => prev.map(i => i.id === selected ? { ...i, scale: Math.max(0.3, Math.min(3, (i.scale || 1) * factor)) } : i))
  }

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Vibe Board</h1>
          <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>Your trip mood & inspiration canvas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected && (
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              onClick={deleteSelected}
              style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Trash2 size={15} color="#EF4444" />
            </motion.button>
          )}
          <button
            onClick={() => { setItems([]); setSelected(null) }}
            style={{ padding: '7px 12px', borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', color: '#8A8A9A', fontSize: 12, cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Selection controls */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ padding: '10px 20px 0', display: 'flex', gap: 8, flexShrink: 0, zIndex: 10 }}
          >
            {[
              { label: '↺ -15°', action: () => rotateSelected(-15) },
              { label: '↻ +15°', action: () => rotateSelected(15) },
              { label: '− Shrink', action: () => scaleSelected(0.85) },
              { label: '+ Grow', action: () => scaleSelected(1.15) },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)', color: '#FF8C42', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {btn.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas area */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => setSelected(null)}
        style={{
          flex: 1, position: 'relative', margin: '12px 16px 0',
          background: 'linear-gradient(135deg, #1A1A1F 0%, #242429 50%, #1A1A1F 100%)',
          border: '1px solid #3A3A44', borderRadius: 20, overflow: 'hidden',
          cursor: 'crosshair',
        }}
      >
        {/* Grid pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#FF4D00" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Empty state */}
        {items.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
            <div style={{ fontSize: 40 }}>🎨</div>
            <p style={{ color: '#3A3A44', fontSize: 14, fontWeight: 600, textAlign: 'center', margin: 0 }}>
              Tap the + buttons below<br />to build your vibe board
            </p>
          </div>
        )}

        {/* Canvas items */}
        {items.map(item => (
          <div
            key={item.id}
            onPointerDown={e => handlePointerDown(e, item.id)}
            style={{
              position: 'absolute',
              left: item.x, top: item.y,
              transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
              cursor: 'grab',
              outline: selected === item.id ? '2px solid #FF4D00' : 'none',
              outlineOffset: 4,
              borderRadius: 8,
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {item.type === 'image' && (
              <img
                src={item.content} alt=""
                style={{ width: 140, borderRadius: 10, display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                draggable={false}
              />
            )}
            {item.type === 'text' && (
              <p style={{
                color: item.color || '#EFEFEF',
                fontSize: item.fontSize || 18,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                margin: 0, whiteSpace: 'nowrap',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                {item.content}
              </p>
            )}
            {item.type === 'sticker' && (
              <span style={{ fontSize: item.fontSize || 36, lineHeight: 1 }}>{item.content}</span>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 10, flexShrink: 0, justifyContent: 'center' }}>
        {[
          { id: 'text' as const, icon: <Type size={18} />, label: 'Text', panel: 'text' as const },
          { id: 'sticker' as const, icon: <span style={{ fontSize: 18 }}>✨</span>, label: 'Sticker', panel: 'stickers' as const },
          { id: 'image' as const, icon: <ImageIcon size={18} />, label: 'Photo', panel: 'images' as const },
        ].map(btn => (
          <motion.button
            key={btn.id}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowPanel(showPanel === btn.panel ? null : btn.panel)}
            style={{
              flex: 1, padding: '12px 8px', borderRadius: 14,
              background: showPanel === btn.panel ? 'rgba(255,77,0,0.15)' : '#242429',
              border: `1px solid ${showPanel === btn.panel ? '#FF4D00' : '#3A3A44'}`,
              color: showPanel === btn.panel ? '#FF4D00' : '#8A8A9A',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            {btn.icon}
            <span style={{ fontSize: 10, fontWeight: 600 }}>{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Panels */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key={showPanel}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: '#1E1E24', borderRadius: '20px 20px 0 0',
              border: '1px solid #3A3A44', padding: '20px 20px 32px',
              maxHeight: '55vh', overflowY: 'auto', zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#EFEFEF', margin: 0, textTransform: 'capitalize' }}>
                Add {showPanel === 'stickers' ? 'Sticker' : showPanel === 'images' ? 'Photo' : 'Text'}
              </h3>
              <button onClick={() => setShowPanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}>
                <X size={18} />
              </button>
            </div>

            {/* Text panel */}
            {showPanel === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  className="input-base"
                  placeholder="Type something..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addText()}
                  autoFocus
                />
                <div>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Colour</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {TEXT_COLORS.map(c => (
                      <button key={c} onClick={() => setTextColor(c)}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `2px solid ${textColor === c ? '#FF4D00' : 'transparent'}`, cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Size — {fontSize}px</p>
                  <input type="range" min={12} max={48} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#FF4D00' }} />
                </div>
                <button className="btn-primary" onClick={addText} disabled={!textInput.trim()}>Add Text</button>
              </div>
            )}

            {/* Stickers panel */}
            {showPanel === 'stickers' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {STICKERS.map(emoji => (
                  <motion.button key={emoji} whileTap={{ scale: 0.85 }} onClick={() => addSticker(emoji)}
                    style={{ fontSize: 32, background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 12, padding: '10px 0', cursor: 'pointer' }}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Images panel */}
            {showPanel === 'images' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: '#5A5A6E', fontSize: 12, margin: 0 }}>Pick a sample photo or add your own URL</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {SAMPLE_IMAGES.map(url => (
                    <motion.div key={url} whileTap={{ scale: 0.95 }} onClick={() => addImage(url)}
                      style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1', border: '1px solid #3A3A44' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
