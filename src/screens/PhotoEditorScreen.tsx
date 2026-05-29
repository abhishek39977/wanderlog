import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Check, SlidersHorizontal, Film, Layers, Type, Sun } from 'lucide-react'

interface PhotoEditorProps {
  photoUrl?: string
  onBack: () => void
}

// Film filter presets
const FILM_FILTERS = [
  {
    id: 'original',
    name: 'Original',
    css: '',
    grain: 0,
    vignette: 0,
    lightLeak: null as string | null,
  },
  {
    id: 'kodak-gold',
    name: 'Kodak Gold',
    css: 'sepia(0.3) saturate(1.4) brightness(1.05) contrast(1.1) hue-rotate(-5deg)',
    grain: 0.3,
    vignette: 0.4,
    lightLeak: 'rgba(255,140,0,0.15)',
  },
  {
    id: 'fuji-velvia',
    name: 'Fuji Velvia',
    css: 'saturate(1.8) contrast(1.15) brightness(0.97) hue-rotate(5deg)',
    grain: 0.2,
    vignette: 0.35,
    lightLeak: null,
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    css: 'sepia(0.4) saturate(1.1) brightness(1.15) contrast(0.9)',
    grain: 0.4,
    vignette: 0.5,
    lightLeak: 'rgba(255,255,200,0.12)',
  },
  {
    id: 'cinestill',
    name: 'Cinestill',
    css: 'saturate(1.3) contrast(1.2) brightness(0.95) hue-rotate(-10deg)',
    grain: 0.5,
    vignette: 0.6,
    lightLeak: 'rgba(255,0,80,0.1)',
  },
  {
    id: 'lomo',
    name: 'Lomo',
    css: 'saturate(1.6) contrast(1.3) brightness(0.9) hue-rotate(15deg)',
    grain: 0.6,
    vignette: 0.7,
    lightLeak: 'rgba(0,200,255,0.08)',
  },
  {
    id: 'noir',
    name: 'Noir',
    css: 'grayscale(1) contrast(1.3) brightness(0.9)',
    grain: 0.5,
    vignette: 0.65,
    lightLeak: null,
  },
  {
    id: 'agfa',
    name: 'Agfa',
    css: 'sepia(0.5) saturate(0.8) contrast(1.1) brightness(1.02) hue-rotate(10deg)',
    grain: 0.35,
    vignette: 0.45,
    lightLeak: 'rgba(255,220,100,0.1)',
  },
  {
    id: 'kodachrome',
    name: 'Kodachrome',
    css: 'saturate(1.5) contrast(1.25) brightness(1.0) hue-rotate(-8deg) sepia(0.2)',
    grain: 0.25,
    vignette: 0.3,
    lightLeak: null,
  },
  {
    id: 'superia',
    name: 'Superia',
    css: 'saturate(1.2) contrast(1.05) brightness(1.05) hue-rotate(8deg)',
    grain: 0.2,
    vignette: 0.25,
    lightLeak: 'rgba(150,255,150,0.06)',
  },
  {
    id: 'ilford',
    name: 'Ilford HP5',
    css: 'grayscale(0.8) contrast(1.4) brightness(0.88)',
    grain: 0.7,
    vignette: 0.5,
    lightLeak: null,
  },
  {
    id: 'expired',
    name: 'Expired',
    css: 'sepia(0.6) saturate(0.7) contrast(0.85) brightness(0.95) hue-rotate(20deg)',
    grain: 0.8,
    vignette: 0.55,
    lightLeak: 'rgba(255,100,0,0.18)',
  },
  {
    id: 'slide',
    name: 'Slide',
    css: 'saturate(1.7) contrast(1.2) brightness(1.05)',
    grain: 0.15,
    vignette: 0.2,
    lightLeak: null,
  },
  {
    id: 'portra',
    name: 'Portra 400',
    css: 'sepia(0.15) saturate(1.1) contrast(1.05) brightness(1.08) hue-rotate(-3deg)',
    grain: 0.25,
    vignette: 0.3,
    lightLeak: 'rgba(255,240,200,0.08)',
  },
  {
    id: 'cross-process',
    name: 'Cross Process',
    css: 'saturate(2) contrast(1.4) hue-rotate(30deg) brightness(0.92)',
    grain: 0.45,
    vignette: 0.6,
    lightLeak: 'rgba(100,0,255,0.12)',
  },
]

// Light leak presets
const LIGHT_LEAKS = [
  { id: 'none', name: 'None', gradient: null as string | null },
  { id: 'warm-corner', name: 'Warm', gradient: 'radial-gradient(ellipse at top left, rgba(255,160,0,0.3) 0%, transparent 60%)' },
  { id: 'cool-edge', name: 'Cool', gradient: 'radial-gradient(ellipse at bottom right, rgba(0,160,255,0.25) 0%, transparent 60%)' },
  { id: 'pink-glow', name: 'Pink', gradient: 'radial-gradient(ellipse at top right, rgba(255,0,120,0.25) 0%, transparent 55%)' },
  { id: 'gold-bottom', name: 'Gold', gradient: 'linear-gradient(to top, rgba(255,200,0,0.3) 0%, transparent 40%)' },
  { id: 'purple-side', name: 'Purple', gradient: 'linear-gradient(to right, rgba(140,0,255,0.2) 0%, transparent 50%)' },
]

// Border presets
const BORDERS = [
  { id: 'none', name: 'None' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'instax', name: 'Instax' },
  { id: 'filmstrip', name: 'Film Strip' },
]

// Date stamp fonts
const DATE_FONTS = [
  { id: 'mono', name: 'Digital', font: "'Courier New', monospace", color: '#FF8C42' },
  { id: 'serif', name: 'Classic', font: 'Georgia, serif', color: '#FF8C42' },
  { id: 'stamp', name: 'Stamp', font: "'Courier New', monospace", color: '#E5383B' },
  { id: 'minimal', name: 'Minimal', font: "'Inter', sans-serif", color: '#EFEFEF' },
]

type TabId = 'filters' | 'adjust' | 'light' | 'frame'

// Sample travel photos for demo
const DEMO_PHOTOS = [
  'https://picsum.photos/seed/travel1/600/800',
  'https://picsum.photos/seed/travel2/600/400',
  'https://picsum.photos/seed/city1/600/600',
  'https://picsum.photos/seed/nature1/600/800',
  'https://picsum.photos/seed/food1/600/600',
]

export const PhotoEditorScreen: React.FC<PhotoEditorProps> = ({ photoUrl, onBack }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(photoUrl || DEMO_PHOTOS[0])
  const [selectedFilter, setSelectedFilter] = useState(FILM_FILTERS[0])
  const [activeTab, setActiveTab] = useState<TabId>('filters')
  const [showSaved, setShowSaved] = useState(false)

  // Adjustment sliders
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,    // -50 to +50
    vignette: 0,       // 0–100
    grain: 0,          // 0–100
  })

  // Light leak & border
  const [selectedLeak, setSelectedLeak] = useState(LIGHT_LEAKS[0])
  const [selectedBorder, setSelectedBorder] = useState(BORDERS[0])
  const [showDateStamp, setShowDateStamp] = useState(false)
  const [selectedDateFont, setSelectedDateFont] = useState(DATE_FONTS[0])

  const today = new Date()
  const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`

  // Build composite CSS filter string
  const buildFilter = () => {
    const base = selectedFilter.css
    const adjBrightness = adjustments.brightness / 100
    const adjContrast = adjustments.contrast / 100
    const adjSaturation = adjustments.saturation / 100
    const tempHue = adjustments.temperature > 0
      ? `hue-rotate(${adjustments.temperature * 0.3}deg) sepia(${adjustments.temperature * 0.003})`
      : `hue-rotate(${adjustments.temperature * 0.2}deg)`

    const filterParts = [
      base,
      `brightness(${adjBrightness})`,
      `contrast(${adjContrast})`,
      `saturate(${adjSaturation})`,
    ].filter(Boolean)

    return filterParts.join(' ')
  }

  // Vignette intensity
  const vignetteStrength = Math.max(selectedFilter.vignette, adjustments.vignette / 100)
  const grainStrength = Math.max(selectedFilter.grain, adjustments.grain / 100)

  // Border wrapper styles
  const getBorderStyle = (): React.CSSProperties => {
    switch (selectedBorder.id) {
      case 'polaroid':
        return {
          padding: '12px 12px 40px',
          background: '#F5F0E8',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }
      case 'instax':
        return {
          padding: '8px 8px 24px',
          background: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }
      case 'filmstrip':
        return {
          padding: '12px 6px',
          background: '#111',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
          position: 'relative',
        }
      default:
        return {}
    }
  }

  const handleSave = () => {
    // For locally uploaded images (data: URLs), use anchor download
    if (selectedPhoto.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = selectedPhoto
      link.download = `wanderlog-photo-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For external URLs, open in new tab (user can save with right-click)
      window.open(selectedPhoto, '_blank')
    }
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)
  }

  const tabs: { id: TabId; icon: React.ReactNode; label: string }[] = [
    { id: 'filters', icon: <Film size={16} />, label: 'Filters' },
    { id: 'adjust', icon: <SlidersHorizontal size={16} />, label: 'Adjust' },
    { id: 'light', icon: <Sun size={16} />, label: 'Light' },
    { id: 'frame', icon: <Layers size={16} />, label: 'Frame' },
  ]

  return (
    <div className="screen" style={{ overflow: 'hidden', background: '#111114' }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 10,
      }}>
        <button onClick={onBack}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#8A8A9A" />
        </button>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>
          Photo Editor
        </h1>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleSave}
          style={{
            padding: '8px 16px', borderRadius: 20,
            background: showSaved ? '#22C55E' : '#FF4D00',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.3s',
          }}>
          {showSaved ? <Check size={15} color="white" /> : <Download size={15} color="white" />}
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
            {showSaved ? 'Saved!' : 'Save'}
          </span>
        </motion.button>
      </div>

      {/* Photo preview */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', display: 'inline-block', ...getBorderStyle() }}>
          {/* Filmstrip sprockets */}
          {selectedBorder.id === 'filmstrip' && (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={`l${i}`} style={{
                  position: 'absolute', left: 1, top: `${10 + i * 16}%`,
                  width: 4, height: '8%', background: '#333', borderRadius: 1,
                }} />
              ))}
              {[...Array(6)].map((_, i) => (
                <div key={`r${i}`} style={{
                  position: 'absolute', right: 1, top: `${10 + i * 16}%`,
                  width: 4, height: '8%', background: '#333', borderRadius: 1,
                }} />
              ))}
            </>
          )}

          {/* Main image with filters */}
          <div style={{ position: 'relative', borderRadius: selectedBorder.id !== 'none' ? 2 : 0, overflow: 'hidden' }}>
            <img
              src={selectedPhoto}
              alt="Edit"
              style={{
                maxHeight: 260,
                maxWidth: '100%',
                display: 'block',
                filter: buildFilter(),
                objectFit: 'cover',
              }}
            />

            {/* Vignette overlay */}
            {vignetteStrength > 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at center, transparent ${Math.round((1 - vignetteStrength) * 80)}%, rgba(0,0,0,${vignetteStrength * 0.85}) 100%)`,
                pointerEvents: 'none',
              }} />
            )}

            {/* Light leak overlay from filter preset */}
            {selectedFilter.lightLeak && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at top right, ${selectedFilter.lightLeak} 0%, transparent 60%)`,
                pointerEvents: 'none',
              }} />
            )}

            {/* Custom light leak */}
            {selectedLeak.gradient && (
              <div style={{
                position: 'absolute', inset: 0,
                background: selectedLeak.gradient,
                pointerEvents: 'none',
              }} />
            )}

            {/* Grain overlay */}
            {grainStrength > 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                opacity: grainStrength * 0.6,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '128px 128px',
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
              }} />
            )}

            {/* Date stamp */}
            {showDateStamp && (
              <div style={{
                position: 'absolute', bottom: 10, right: 12,
                fontFamily: selectedDateFont.font,
                fontSize: 13,
                fontWeight: 700,
                color: selectedDateFont.color,
                letterSpacing: 1.5,
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
              }}>
                {dateStr}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', background: '#242429', borderRadius: 12, padding: 3, border: '1px solid #3A3A44' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '8px 4px', border: 'none', borderRadius: 9, cursor: 'pointer',
                background: activeTab === tab.id ? '#FF4D00' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#8A8A9A',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}>
              {tab.icon}
              <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flexShrink: 0, overflowY: 'auto', maxHeight: 200, paddingBottom: 8 }}>
        <AnimatePresence mode="wait">

          {/* Filters tab */}
          {activeTab === 'filters' && (
            <motion.div key="filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: 10, padding: '4px 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {FILM_FILTERS.map(filter => (
                <motion.button
                  key={filter.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${selectedFilter.id === filter.id ? '#FF4D00' : '#3A3A44'}`,
                    boxShadow: selectedFilter.id === filter.id ? '0 0 10px rgba(255,77,0,0.5)' : 'none',
                    position: 'relative',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}>
                    <img src={selectedPhoto} alt={filter.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filter.css }} />
                    {/* Mini vignette */}
                    {filter.vignette > 0 && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${filter.vignette * 0.7}) 100%)`,
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: selectedFilter.id === filter.id ? '#FF4D00' : '#8A8A9A',
                    whiteSpace: 'nowrap',
                  }}>
                    {filter.name}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Adjust tab */}
          {activeTab === 'adjust' && (
            <motion.div key="adjust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '4px 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'brightness' as const, label: 'Brightness', min: 50, max: 150, unit: '' },
                { key: 'contrast' as const, label: 'Contrast', min: 50, max: 200, unit: '' },
                { key: 'saturation' as const, label: 'Saturation', min: 0, max: 250, unit: '' },
                { key: 'temperature' as const, label: 'Temperature', min: -50, max: 50, unit: '' },
                { key: 'vignette' as const, label: 'Vignette', min: 0, max: 100, unit: '%' },
                { key: 'grain' as const, label: 'Grain', min: 0, max: 100, unit: '%' },
              ].map(({ key, label, min, max, unit }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#8A8A9A', fontSize: 12, width: 78, flexShrink: 0 }}>{label}</span>
                  <input
                    type="range" min={min} max={max} value={adjustments[key]}
                    onChange={e => setAdjustments(a => ({ ...a, [key]: Number(e.target.value) }))}
                    style={{ flex: 1, accentColor: '#FF4D00', height: 4, cursor: 'pointer' }}
                  />
                  <span style={{ color: '#5A5A6E', fontSize: 11, width: 28, textAlign: 'right', flexShrink: 0 }}>
                    {key === 'temperature' ? (adjustments[key] > 0 ? `+${adjustments[key]}` : adjustments[key]) : adjustments[key]}{unit}
                  </span>
                </div>
              ))}
              <button onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100, temperature: 0, vignette: 0, grain: 0 })}
                style={{ padding: '7px', borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', color: '#8A8A9A', fontSize: 12, cursor: 'pointer' }}>
                Reset Adjustments
              </button>
            </motion.div>
          )}

          {/* Light leaks tab */}
          {activeTab === 'light' && (
            <motion.div key="light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '4px 16px 12px' }}>
              <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Light Leak</p>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 16 }}>
                {LIGHT_LEAKS.map(leak => (
                  <button key={leak.id} onClick={() => setSelectedLeak(leak)}
                    style={{
                      width: 52, height: 52, borderRadius: 10, flexShrink: 0, cursor: 'pointer',
                      border: `2px solid ${selectedLeak.id === leak.id ? '#FF4D00' : '#3A3A44'}`,
                      background: leak.gradient || '#242429',
                      overflow: 'hidden', position: 'relative',
                    }}>
                    {!leak.gradient && <span style={{ fontSize: 18, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚫</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {LIGHT_LEAKS.map(l => (
                  <span key={l.id} style={{ fontSize: 10, color: selectedLeak.id === l.id ? '#FF4D00' : '#5A5A6E', flex: 1, textAlign: 'center' }}>{l.name}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Frame tab */}
          {activeTab === 'frame' && (
            <motion.div key="frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '4px 16px 12px' }}>
              {/* Border selector */}
              <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Border Style</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {BORDERS.map(b => (
                  <button key={b.id} onClick={() => setSelectedBorder(b)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      border: `1px solid ${selectedBorder.id === b.id ? '#FF4D00' : '#3A3A44'}`,
                      background: selectedBorder.id === b.id ? 'rgba(255,77,0,0.15)' : '#242429',
                      color: selectedBorder.id === b.id ? '#FF4D00' : '#8A8A9A',
                    }}>
                    {b.name}
                  </button>
                ))}
              </div>

              {/* Date stamp */}
              <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Date Stamp</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <button onClick={() => setShowDateStamp(s => !s)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none',
                    background: showDateStamp ? '#FF4D00' : '#3A3A44',
                    position: 'relative', transition: 'background 0.2s',
                  }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3,
                    left: showDateStamp ? 22 : 3,
                    transition: 'left 0.2s',
                  }} />
                </button>
                <span style={{ color: '#8A8A9A', fontSize: 13 }}>Show date stamp</span>
              </div>

              {showDateStamp && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {DATE_FONTS.map(font => (
                    <button key={font.id} onClick={() => setSelectedDateFont(font)}
                      style={{
                        flex: 1, padding: '7px 4px', borderRadius: 10, cursor: 'pointer', fontSize: 10,
                        fontFamily: font.font, fontWeight: 700,
                        border: `1px solid ${selectedDateFont.id === font.id ? '#FF4D00' : '#3A3A44'}`,
                        background: selectedDateFont.id === font.id ? 'rgba(255,77,0,0.15)' : '#242429',
                        color: selectedDateFont.id === font.id ? '#FF4D00' : font.color,
                      }}>
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Photo picker strip at bottom */}
      <div style={{ padding: '4px 16px 12px', flexShrink: 0, borderTop: '1px solid #2C2C33' }}>
        <p style={{ color: '#5A5A6E', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Photos</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {DEMO_PHOTOS.map((url, i) => (
            <motion.div key={i} whileTap={{ scale: 0.9 }} onClick={() => setSelectedPhoto(url)}
              style={{
                width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${selectedPhoto === url ? '#FF4D00' : 'transparent'}`,
                boxShadow: selectedPhoto === url ? '0 0 8px rgba(255,77,0,0.5)' : 'none',
              }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
