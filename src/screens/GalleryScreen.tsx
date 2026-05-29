import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Film, Upload, Wand2, Download, ImageDown, Share2, CheckCircle, Lock } from 'lucide-react'
import { useTripStore } from '../store/tripStore'

interface GalleryScreenProps {
  onNavigate?: (screen: string, opts?: { photoUrl?: string }) => void
}

// ─── Save to device helper ────────────────────────────────────────────────────
async function saveToDevice(url: string, filename: string): Promise<'shared' | 'downloaded' | 'failed'> {
  // Try Web Share API with file (supported on mobile PWA)
  if (url.startsWith('data:') && navigator.canShare) {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const file = new File([blob], `${filename}.jpg`, { type: 'image/jpeg' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return 'shared'
      }
    } catch {
      // fall through to download
    }
  }
  // Fallback: anchor download
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename || 'wanderlog-photo'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}

// ─── Animated film strip header ───────────────────────────────────────────────
const FilmStripDecor: React.FC = () => (
  <div style={{
    height: 24, background: '#111', borderRadius: 4,
    display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6, overflow: 'hidden',
  }}>
    {Array.from({ length: 16 }).map((_, i) => (
      <div key={i} style={{ width: 10, height: 14, background: '#2C2C33', borderRadius: 2, flexShrink: 0 }} />
    ))}
  </div>
)

// ─── Develop button with dramatic animation ────────────────────────────────────
const FilmRevealBtn: React.FC<{ count: number; onReveal: () => void }> = ({ count, onReveal }) => {
  const [phase, setPhase] = useState<'idle' | 'developing' | 'done'>('idle')

  const handleReveal = async () => {
    if (count === 0 || phase !== 'idle') return
    setPhase('developing')
    await new Promise(r => setTimeout(r, 2200))
    onReveal()
    setPhase('done')
    await new Promise(r => setTimeout(r, 1400))
    setPhase('idle')
  }

  return (
    <motion.button
      whileTap={phase === 'idle' && count > 0 ? { scale: 0.97 } : {}}
      onClick={handleReveal}
      disabled={phase !== 'idle'}
      style={{
        width: '100%', border: 'none', cursor: count > 0 ? 'pointer' : 'default',
        background: 'linear-gradient(135deg, #1A1A1F 0%, #2C2C33 100%)',
        borderRadius: 20, padding: '24px 20px', position: 'relative', overflow: 'hidden',
        outline: '1.5px solid #3A3A44',
      }}
    >
      {/* Animated darkroom red light */}
      <motion.div
        animate={phase === 'developing' ? { opacity: [0, 0.25, 0, 0.25, 0] } : { opacity: 0 }}
        transition={{ duration: 2.2, times: [0, 0.3, 0.5, 0.7, 1] }}
        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(200,0,0,0.5), transparent 70%)', pointerEvents: 'none' }}
      />

      {phase === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,77,0,0.1)', border: '2px solid rgba(255,77,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film size={30} color="#FF4D00" />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: '#EFEFEF' }}>
            {count > 0 ? `Develop ${count} Photo${count !== 1 ? 's' : ''}` : 'No locked photos'}
          </span>
          <span style={{ color: '#5A5A6E', fontSize: 12 }}>
            {count > 0 ? 'Tap to reveal your locked shots' : 'Upload photos in Film mode to lock them'}
          </span>
        </motion.div>
      )}

      {phase === 'developing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
            style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #FF4D00', borderTopColor: 'transparent' }}
          />
          <span style={{ color: '#FF8C42', fontSize: 14, fontWeight: 700 }}>Developing film...</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['🔴', '🟡', '🟢'].map((c, i) => (
              <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ delay: i * 0.3, repeat: Infinity, duration: 0.9 }} style={{ fontSize: 10 }}>{c}</motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={40} color="#22C55E" />
          <span style={{ color: '#22C55E', fontSize: 15, fontWeight: 700 }}>Photos revealed! ✨</span>
        </motion.div>
      )}
    </motion.button>
  )
}

// ─── Photo card for film grid ──────────────────────────────────────────────────
const FilmPhotoCard: React.FC<{
  photo: { id: string; url: string; caption: string; revealed: boolean }
  index: number
  onClick: () => void
}> = ({ photo, index, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: photo.revealed ? index * 0.04 : 0, type: 'spring', stiffness: 280, damping: 22 }}
    whileHover={photo.revealed ? { scale: 1.04 } : {}}
    onClick={onClick}
    style={{
      borderRadius: 12, overflow: 'hidden', cursor: photo.revealed ? 'pointer' : 'default',
      position: 'relative', aspectRatio: '1',
      background: photo.revealed ? 'transparent' : '#1E1E25',
      border: `1px solid ${photo.revealed ? 'transparent' : '#2C2C33'}`,
    }}
  >
    {photo.revealed ? (
      <>
        <img src={photo.url} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Film frame corners */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
          <div key={pos} style={{
            position: 'absolute',
            top: pos.startsWith('top') ? 4 : 'auto',
            bottom: pos.startsWith('bottom') ? 4 : 'auto',
            left: pos.endsWith('left') ? 4 : 'auto',
            right: pos.endsWith('right') ? 4 : 'auto',
            width: 10, height: 10,
            borderTop: pos.startsWith('top') ? '2px solid rgba(255,255,255,0.4)' : 'none',
            borderBottom: pos.startsWith('bottom') ? '2px solid rgba(255,255,255,0.4)' : 'none',
            borderLeft: pos.endsWith('left') ? '2px solid rgba(255,255,255,0.4)' : 'none',
            borderRight: pos.endsWith('right') ? '2px solid rgba(255,255,255,0.4)' : 'none',
          }} />
        ))}
      </>
    ) : (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Lock size={20} color="#3A3A44" />
        </motion.div>
        <span style={{ color: '#3A3A44', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Film</span>
      </div>
    )}
  </motion.div>
)

// ─── Toast notification ────────────────────────────────────────────────────────
const SaveToast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#22C55E', borderRadius: 30, padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 200,
          boxShadow: '0 4px 24px rgba(34,197,94,0.4)', whiteSpace: 'nowrap',
        }}
      >
        <CheckCircle size={16} color="white" />
        <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
)

// ─── Main GalleryScreen ────────────────────────────────────────────────────────
export const GalleryScreen: React.FC<GalleryScreenProps> = ({ onNavigate }) => {
  const { gallery, addGalleryPhoto, revealPhoto } = useTripStore()
  const [lightbox, setLightbox] = useState<{ url: string; caption: string } | null>(null)
  const [mode, setMode] = useState<'grid' | 'film'>('grid')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const modeRef = useRef(mode)
  modeRef.current = mode  // always up-to-date in async callbacks

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  // FIX: use modeRef.current so the closure always sees the latest mode
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentMode = modeRef.current
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result as string
        addGalleryPhoto({
          url,
          dayIndex: 1,
          caption: file.name.replace(/\.[^.]+$/, ''),
          // FIX: film mode locks photos; grid mode shows immediately
          revealed: currentMode === 'grid',
          takenAt: new Date().toISOString(),
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }, [addGalleryPhoto])

  // FIX: only reveal film-locked photos (revealed === false), not all
  const filmPhotos = gallery.filter(p => !p.revealed || p.takenAt) // all gallery photos shown in film tab
  const lockedPhotos = gallery.filter(p => !p.revealed)
  const revealedPhotos = gallery.filter(p => p.revealed)

  const handleRevealAll = () => {
    lockedPhotos.forEach(p => revealPhoto(p.id))
  }

  const handleSave = async (url: string, caption: string) => {
    const result = await saveToDevice(url, caption || 'wanderlog-photo')
    if (result === 'shared') showToast('Shared to device! 📱')
    else if (result === 'downloaded') showToast('Saved to downloads! 💾')
    else showToast('Could not save. Try long-pressing the image.')
  }

  const handleBulkExport = async () => {
    if (revealedPhotos.length === 0) return
    showToast(`Exporting ${revealedPhotos.length} photos...`)
    for (let i = 0; i < revealedPhotos.length; i++) {
      await new Promise(r => setTimeout(r, 300))
      const p = revealedPhotos[i]
      const link = document.createElement('a')
      link.href = p.url
      link.download = `${p.caption || 'photo'}-${i + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    setTimeout(() => showToast('All photos exported! ✅'), revealedPhotos.length * 300 + 500)
  }

  return (
    <div className="screen">
      {/* Hidden file input — capture from camera or files */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Gallery</h1>
            <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>
              {revealedPhotos.length} photo{revealedPhotos.length !== 1 ? 's' : ''}
              {lockedPhotos.length > 0 ? ` · ${lockedPhotos.length} 🔒 locked` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Bulk export */}
            {revealedPhotos.length > 0 && (
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleBulkExport}
                style={{ width: 36, height: 36, borderRadius: 10, background: '#242429', border: '1px solid #3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ImageDown size={16} color="#8A8A9A" />
              </motion.button>
            )}

            {/* Mode toggle */}
            <div style={{ display: 'flex', background: '#242429', borderRadius: 12, padding: 3, border: '1px solid #3A3A44', gap: 2 }}>
              {(['grid', 'film'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{
                    padding: '6px 12px', borderRadius: 9, border: 'none',
                    background: mode === m ? '#FF4D00' : 'transparent',
                    color: mode === m ? 'white' : '#8A8A9A',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {m === 'grid' ? '⊞ Grid' : '🎞 Film'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 100px' }}>
        <AnimatePresence mode="wait">

          {/* ── FILM MODE ── */}
          {mode === 'film' && (
            <motion.div key="film" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Film strip decoration */}
              <FilmStripDecor />

              {/* Develop button */}
              <FilmRevealBtn count={lockedPhotos.length} onReveal={handleRevealAll} />

              {/* Upload to film mode */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  border: '1.5px dashed #3A3A44', background: 'rgba(255,77,0,0.04)',
                  color: '#8A8A9A', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                <Upload size={18} color="#FF4D00" />
                <span>Add to Film Roll <span style={{ color: '#5A5A6E', fontSize: 11 }}>(locks until developed)</span></span>
              </motion.button>

              {/* Film strip decoration */}
              <FilmStripDecor />

              {/* Photo grid — show ALL gallery photos (locked + revealed) */}
              {gallery.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>🎞️</div>
                  <p style={{ color: '#5A5A6E', fontSize: 14, lineHeight: 1.6 }}>
                    Your film roll is empty.<br />Add photos above — they'll be locked until you tap Develop!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {gallery.map((photo, idx) => (
                    <FilmPhotoCard
                      key={photo.id}
                      photo={photo}
                      index={idx}
                      onClick={() => photo.revealed && setLightbox({ url: photo.url, caption: photo.caption })}
                    />
                  ))}
                </div>
              )}

              {/* Bottom film strip */}
              <FilmStripDecor />
            </motion.div>
          )}

          {/* ── GRID MODE ── */}
          {mode === 'grid' && (
            <motion.div key="grid" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {revealedPhotos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>📸</div>
                  <p style={{ color: '#5A5A6E', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
                    Your travel photos live here.<br />Upload from your device to get started.
                  </p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 24, background: '#FF4D00', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    <Upload size={18} /> Upload Photos
                  </motion.button>
                </div>
              ) : (
                <div style={{ columns: '2 auto', columnGap: 10 }}>
                  {revealedPhotos.map((photo, idx) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setLightbox({ url: photo.url, caption: photo.caption })}
                      style={{ breakInside: 'avoid', marginBottom: 10, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                    >
                      <img src={photo.url} alt={photo.caption} style={{ width: '100%', display: 'block' }} />
                      {photo.caption && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '20px 10px 8px' }}>
                          <p style={{ color: 'white', fontSize: 11, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}
          >
            {/* Close */}
            <button onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: '#242429', border: '1px solid #3A3A44', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="#EFEFEF" />
            </button>

            {/* Image */}
            <motion.img
              src={lightbox.url} alt={lightbox.caption}
              initial={{ scale: 0.88 }} animate={{ scale: 1 }}
              style={{ maxWidth: '90vw', maxHeight: '62vh', borderRadius: 16, objectFit: 'contain' }}
              onClick={e => e.stopPropagation()}
            />

            {/* Caption */}
            {lightbox.caption && (
              <p style={{ color: '#8A8A9A', fontSize: 13, margin: 0, textAlign: 'center', paddingInline: 24 }}>{lightbox.caption}</p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
              {/* Save to Gallery */}
              <motion.button whileTap={{ scale: 0.93 }}
                onClick={() => handleSave(lightbox.url, lightbox.caption)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 24, background: 'linear-gradient(135deg, #22C55E, #16A34A)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}>
                <Share2 size={15} color="white" />
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Save to Gallery</span>
              </motion.button>

              {/* Download */}
              <motion.a whileTap={{ scale: 0.93 }}
                href={lightbox.url}
                download={lightbox.caption || 'photo'}
                onClick={e => e.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 24, background: '#242429', border: '1px solid #3A3A44', textDecoration: 'none', cursor: 'pointer' }}>
                <Download size={15} color="#8A8A9A" />
                <span style={{ color: '#8A8A9A', fontSize: 13, fontWeight: 600 }}>Download</span>
              </motion.a>

              {/* Edit */}
              {onNavigate && (
                <motion.button whileTap={{ scale: 0.93 }}
                  onClick={() => { setLightbox(null); onNavigate('photoeditor', { photoUrl: lightbox.url }) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 24, background: '#FF4D00', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,77,0,0.35)' }}>
                  <Wand2 size={15} color="white" />
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Edit</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <SaveToast message={toastMsg} visible={toastVisible} />

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => fileRef.current?.click()}
        className="glow-orange"
        style={{ position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#FF4D00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
      >
        <Camera size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
