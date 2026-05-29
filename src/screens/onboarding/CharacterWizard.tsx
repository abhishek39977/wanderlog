import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useOnboardingStore } from '../../store/onboardingStore'
import type { CharacterConfig } from '../../store/onboardingStore'
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer'

// ─── Step Data (FUNNY VERSION) ────────────────────────────────────────────────

const BODY_TYPES = [
  { value: 'Slim', label: 'Noodle Person', emoji: '🍜', sub: 'Slips through crowds' },
  { value: 'Athletic', label: 'Gym Rat', emoji: '💪', sub: 'Carries all the bags' },
  { value: 'Curvy', label: 'The Snack', emoji: '🍑', sub: 'Always in photos' },
  { value: 'Broad', label: 'Tank Mode', emoji: '🦣', sub: 'Human luggage rack' },
  { value: 'Petite', label: 'Pocket Size', emoji: '🐭', sub: 'Gets lost easily' },
]

const SKIN_TONES = [
  { label: 'Fair', color: '#FDDBB4', desc: '☀️ SPF 1000' },
  { label: 'Light', color: '#F5C59F', desc: '🧴 SPF 50' },
  { label: 'Medium', color: '#E8A87C', desc: '😎 SPF 15' },
  { label: 'Tan', color: '#C68642', desc: '⛱️ No sunscreen' },
  { label: 'Brown', color: '#8D5524', desc: '🌞 What sunscreen?' },
  { label: 'Deep', color: '#4A2912', desc: '✨ Melanin poppin' },
]

const HAIR_STYLES = [
  { value: 'Straight', label: 'Bone Straight', emoji: '🎸', free: true, sub: 'Humidity enemy #1' },
  { value: 'Wavy', label: 'Beach Waves', emoji: '🌊', free: true, sub: 'Always looks accidental' },
  { value: 'Curly', label: 'Spiral Mode', emoji: '🌀', free: true, sub: 'Its own weather system' },
  { value: 'Braids', label: 'Forever Ready', emoji: '🤝', free: true, sub: 'Low maintenance king/queen' },
  { value: 'Short Crop', label: 'Two Seconds', emoji: '⚡', free: true, sub: 'The shower speedrun' },
  { value: 'Buzz Cut', label: 'Extra Aerodynamic', emoji: '🛸', free: true, sub: 'Saved $200 on haircuts' },
  { value: 'Locs', label: 'Locks of Power', emoji: '👑', free: true, sub: 'Royalty vibes only' },
  { value: 'Bun', label: 'I Gave Up', emoji: '🙃', free: true, sub: 'Effortlessly chaotic' },
]

const HAIR_COLOURS = [
  { value: 'Black', label: 'Void Black', color: '#1A1A1A', desc: 'Classic menace', premium: false },
  { value: 'Dark Brown', label: 'Dark Chocolate', color: '#3B1A08', desc: 'Reliable & tasty', premium: false },
  { value: 'Light Brown', label: 'Caramel Drip', color: '#8B4513', desc: 'Sweet vibes', premium: false },
  { value: 'Blonde', label: 'Sunshine Dummy', color: '#F4C430', desc: 'No thoughts, head full of vibes', premium: false },
  { value: 'Red', label: 'Eternal Flame', color: '#C0392B', desc: 'Born to be chaotic', premium: false },
  { value: 'Grey', label: 'Wisdomcore', color: '#9B9B9B', desc: 'Distinguished or just tired', premium: false },
  { value: 'Neon Blue', label: 'Anime Protagonist', color: '#00BFFF', desc: 'Main character energy', premium: false },
  { value: 'Pastel Pink', label: 'Cotton Candy', color: '#FFB6C1', desc: 'Yes, it is natural', premium: false },
]

const EYE_SHAPES = [
  { value: 'Almond', label: 'Mysterious', emoji: '🌰', desc: 'Classic sultry look' },
  { value: 'Round', label: 'Always Surprised', emoji: '👀', desc: 'Everything is amazing to you' },
  { value: 'Cat Eye', label: 'Judge Mode', emoji: '🐱', desc: 'Side-eyeing at all times' },
  { value: 'Hooded', label: 'Sleepy Genius', emoji: '😴', desc: '10/10 resting face' },
]

const BROW_STYLES = [
  { value: 'Straight', label: 'No Drama', emoji: '〰️', desc: 'Chill by default' },
  { value: 'Arched', label: 'Side Eye Pro', emoji: '🎭', desc: 'Judging silently 24/7' },
  { value: 'Thick', label: 'Statement Brows', emoji: '🦁', desc: 'They walk into rooms first' },
]

const LIP_SHAPES = [
  { value: 'Full', label: 'Pout Squad', emoji: '💋', desc: 'Born for selfies' },
  { value: 'Thin', label: 'Controlled Smirk', emoji: '😏', desc: 'Holds many secrets' },
  { value: 'Bow', label: 'Cupid Shot You', emoji: '💘', desc: 'Naturally dramatic' },
]

const OUTFITS = [
  { value: 'Backpacker', label: 'Broke Philosopher', emoji: '🎒', desc: 'Hostels only, no regrets' },
  { value: 'Urban Explorer', label: 'Content Creator', emoji: '📸', desc: 'Everything is aesthetic' },
  { value: 'Beach', label: 'Permanently On Holiday', emoji: '🏖️', desc: 'Sandals in December' },
  { value: 'Trekker', label: 'One With Nature', emoji: '⛰️', desc: 'Talks to birds' },
  { value: 'Cosy Wanderer', label: 'Airport Coffee Addict', emoji: '☕', desc: 'Cozy but make it travel' },
]

const ACCESSORIES = [
  { value: 'Sunglasses', label: 'Mysterious Aura', emoji: '🕶️', desc: 'Hides your feelings' },
  { value: 'Cap / Hat', label: 'Bad Hair Emergency', emoji: '🧢', desc: 'Day 3 of the trip' },
  { value: 'Camera Strap', label: 'Professional Touristy', emoji: '📷', desc: '"Hold on, let me get a shot"' },
  { value: 'Backpack', label: 'Came Prepared', emoji: '🎒', desc: 'Has snacks for everyone' },
  { value: 'Earrings', label: 'Extra Fabulous', emoji: '💎', desc: 'Dressed up just because' },
]

const EXPRESSIONS = [
  { value: 'Chill', label: 'Unbothered', emoji: '😌', desc: "Nothing phases me" },
  { value: 'Excited', label: 'LETS GOOO!!!', emoji: '🤩', desc: 'Woke up 3am to check in' },
  { value: 'Curious', label: 'What IS that?', emoji: '🤔', desc: 'Googles literally everything' },
  { value: 'Happy', label: 'Golden Hour', emoji: '😊', desc: 'Radiates good vibes' },
  { value: 'Smiling', label: 'Perpetually Grinning', emoji: '😄', desc: 'Slightly unhinged, harmless' },
  { value: 'Laughing', label: 'Snort-Laugher', emoji: '😂', desc: 'Loudest person in the hostel' },
  { value: 'Tired', label: 'One More Flight', emoji: '😵', desc: 'Running on airport food' },
]

const STEP_TITLES = [
  '🧬 Pick your build', '🎨 Your skin tone', '💇 Style your hair',
  '🌈 Hair colour drop', '😎 Face vibes', '👗 Travel aesthetic',
  '✨ Accessorize!', '🎤 Final form',
]
const STEP_SUBTITLES = [
  'Every traveller has a vibe. What\'s yours?',
  'Own it — there\'s no wrong answer here',
  'What does your hair do at 7am in a hostel bathroom?',
  'Choose your colour (or your destiny)',
  'Customize your resting travel face',
  'What\'s your default travel fit?',
  'Pick up to 3 items. Choose wisely.',
  'Give your traveller a name and a mood.',
]

// ─── Option Card ──────────────────────────────────────────────────────────────

const OptionCard: React.FC<{
  label: string; selected: boolean; onClick: () => void;
  emoji?: string; locked?: boolean; color?: string;
  sub?: string;
}> = ({ label, selected, onClick, emoji, locked, color, sub }) => (
  <motion.button
    whileTap={{ scale: locked ? 1 : 0.93 }}
    whileHover={{ scale: locked ? 1 : 1.02 }}
    onClick={locked ? undefined : onClick}
    style={{
      padding: '12px 8px', borderRadius: 14,
      border: `2px solid ${selected ? '#FF4D00' : '#3A3A44'}`,
      background: selected ? 'rgba(255,77,0,0.14)' : '#2C2C33',
      cursor: locked ? 'default' : 'pointer', transition: 'all 0.2s', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0,
      opacity: locked ? 0.55 : 1,
      boxShadow: selected ? '0 0 0 1px rgba(255,77,0,0.3), 0 4px 16px rgba(255,77,0,0.15)' : 'none',
    }}
  >
    {emoji && <span style={{ fontSize: 26 }}>{emoji}</span>}
    {color && (
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, border: `3px solid ${selected ? '#FF4D00' : '#3A3A44'}`, transition: 'border-color 0.2s' }} />
    )}
    <span style={{ fontSize: 11, color: selected ? '#FF4D00' : '#EFEFEF', fontWeight: selected ? 700 : 500, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    {sub && <span style={{ fontSize: 9, color: '#5A5A6E', textAlign: 'center', lineHeight: 1.2, maxWidth: 72 }}>{sub}</span>}
    {locked && (
      <div style={{
        position: 'absolute', top: 5, right: 5, background: 'linear-gradient(135deg,#FF8C42,#FF4D00)',
        borderRadius: 4, padding: '1px 5px', fontSize: 8, fontWeight: 700, color: 'white',
      }}>PRO</div>
    )}
    {selected && !locked && (
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        style={{ position: 'absolute', top: 5, right: 5, width: 10, height: 10, borderRadius: '50%', background: '#FF4D00', boxShadow: '0 0 6px rgba(255,77,0,0.8)' }}
      />
    )}
  </motion.button>
)

// ─── Main Wizard ──────────────────────────────────────────────────────────────

interface CharacterWizardProps {
  onComplete: () => void
}

export const CharacterWizard: React.FC<CharacterWizardProps> = ({ onComplete }) => {
  const { character, characterStep, updateCharacter, updateCharacterStep, completeCharacter } = useOnboardingStore()
  const [localStep, setLocalStep] = useState(characterStep)
  const [direction, setDirection] = useState(1)
  const [funFeedback, setFunFeedback] = useState<string | null>(null)

  const showFeedback = (msg: string) => {
    setFunFeedback(msg)
    setTimeout(() => setFunFeedback(null), 1800)
  }

  const goNext = () => {
    if (localStep < 7) {
      setDirection(1)
      const next = localStep + 1
      setLocalStep(next)
      updateCharacterStep(next)
    } else {
      completeCharacter()
      onComplete()
    }
  }

  const goBack = () => {
    if (localStep > 0) {
      setDirection(-1)
      const prev = localStep - 1
      setLocalStep(prev)
      updateCharacterStep(prev)
    }
  }

  const canProceed = () => {
    switch (localStep) {
      case 0: return !!character.bodyType
      case 1: return !!character.skinTone
      case 2: return !!character.hairStyle
      case 3: return !!character.hairColour
      case 4: return !!character.eyeShape && !!character.browStyle && !!character.lipShape
      case 5: return !!character.outfit
      case 6: return character.accessories.length > 0
      case 7: return !!character.expression && !!character.displayName.trim()
      default: return false
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      {/* Fun feedback toast */}
      <AnimatePresence>
        {funFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,77,0,0.95)', borderRadius: 20, padding: '8px 18px',
              color: 'white', fontSize: 13, fontWeight: 600, zIndex: 100, whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(255,77,0,0.4)',
            }}
          >
            {funFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {localStep > 0 && (
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A', padding: 4 }}>
            <ChevronLeft size={24} />
          </button>
        )}
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              style={{ height: 3, flex: 1, borderRadius: 2 }}
              animate={{ background: i <= localStep ? '#FF4D00' : '#3A3A44' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <span style={{ color: '#5A5A6E', fontSize: 12 }}>{localStep + 1}/8</span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Avatar preview */}
        <div style={{
          width: 130, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '16px 0',
          background: 'linear-gradient(180deg, rgba(255,77,0,0.05) 0%, rgba(255,77,0,0.02) 100%)',
          borderRight: '1px solid #3A3A44',
        }}>
          <motion.div
            key={JSON.stringify(character)}
            initial={{ scale: 0.9, rotate: -3 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 300 }}
          >
            <AvatarRenderer config={character} size={100} showGlow />
          </motion.div>
          <p style={{ color: '#5A5A6E', fontSize: 10, marginTop: 8, textAlign: 'center', padding: '0 8px', lineHeight: 1.3 }}>
            {character.displayName || 'Your Avatar'}
          </p>
          {character.pronouns && (
            <span style={{ fontSize: 9, color: '#3A3A44', background: '#2C2C33', borderRadius: 8, padding: '2px 6px', marginTop: 2 }}>
              {character.pronouns}
            </span>
          )}
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={localStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: '0 0 2px' }}>
                {STEP_TITLES[localStep]}
              </h2>
              <p style={{ color: '#8A8A9A', fontSize: 12, margin: '0 0 16px', fontStyle: 'italic' }}>{STEP_SUBTITLES[localStep]}</p>

              {/* Step 0: Body Type */}
              {localStep === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {BODY_TYPES.map(b => (
                    <OptionCard key={b.value} label={b.label} selected={character.bodyType === b.value}
                      onClick={() => { updateCharacter({ bodyType: b.value }); showFeedback(`${b.emoji} ${b.label}!`) }}
                      emoji={b.emoji} sub={b.sub} />
                  ))}
                </div>
              )}

              {/* Step 1: Skin Tone */}
              {localStep === 1 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {SKIN_TONES.map(s => (
                    <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 52 }}>
                      <button onClick={() => { updateCharacter({ skinTone: s.label }); showFeedback(s.desc) }}
                        style={{
                          width: 52, height: 52, borderRadius: '50%', background: s.color,
                          border: `3px solid ${character.skinTone === s.label ? '#FF4D00' : '#3A3A44'}`,
                          cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                          boxShadow: character.skinTone === s.label ? '0 0 12px rgba(255,77,0,0.5)' : 'none',
                        }}
                      >
                        {character.skinTone === s.label && (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontSize: 20, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>✓</span>
                          </div>
                        )}
                      </button>
                      <span style={{ fontSize: 9, color: '#5A5A6E', textAlign: 'center' }}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Hair Style */}
              {localStep === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {HAIR_STYLES.map(h => (
                    <OptionCard key={h.value} label={h.label} selected={character.hairStyle === h.value}
                      onClick={() => { updateCharacter({ hairStyle: h.value }); showFeedback(`${h.emoji} ${h.label}!`) }}
                      emoji={h.emoji} locked={!h.free} sub={h.sub} />
                  ))}
                </div>
              )}

              {/* Step 3: Hair Colour */}
              {localStep === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {HAIR_COLOURS.map(h => (
                    <motion.button key={h.value}
                      whileTap={{ scale: h.premium ? 1 : 0.93 }}
                      onClick={() => { if (!h.premium) { updateCharacter({ hairColour: h.value }); showFeedback(`${h.desc} ✨`) } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14,
                        border: `2px solid ${character.hairColour === h.value ? h.color : '#3A3A44'}`,
                        background: character.hairColour === h.value ? `${h.color}18` : '#2C2C33',
                        cursor: h.premium ? 'default' : 'pointer', opacity: h.premium ? 0.55 : 1, position: 'relative',
                        boxShadow: character.hairColour === h.value ? `0 0 10px ${h.color}40` : 'none',
                      }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: h.color, flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <p style={{ color: character.hairColour === h.value ? '#EFEFEF' : '#8A8A9A', fontSize: 12, fontWeight: 600, margin: 0 }}>{h.label}</p>
                        <p style={{ color: '#5A5A6E', fontSize: 9, margin: 0 }}>{h.desc}</p>
                      </div>
                      {h.premium && (
                        <div style={{ background: 'linear-gradient(135deg,#FF8C42,#FF4D00)', borderRadius: 4, padding: '1px 5px', fontSize: 8, fontWeight: 700, color: 'white' }}>PRO</div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Step 4: Face Features — all 3 required */}
              {localStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <p style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>👁️ Eye Shape</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {EYE_SHAPES.map(e => (
                        <OptionCard key={e.value} label={e.label} selected={character.eyeShape === e.value}
                          onClick={() => { updateCharacter({ eyeShape: e.value }); showFeedback(`${e.emoji} ${e.desc}`) }}
                          emoji={e.emoji} sub={e.desc} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>〰️ Brow Energy</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {BROW_STYLES.map(b => (
                        <OptionCard key={b.value} label={b.label} selected={character.browStyle === b.value}
                          onClick={() => { updateCharacter({ browStyle: b.value }); showFeedback(`${b.emoji} ${b.desc}`) }}
                          emoji={b.emoji} sub={b.desc} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>💋 Lip Mood</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {LIP_SHAPES.map(l => (
                        <OptionCard key={l.value} label={l.label} selected={character.lipShape === l.value}
                          onClick={() => { updateCharacter({ lipShape: l.value }); showFeedback(`${l.emoji} ${l.desc}`) }}
                          emoji={l.emoji} sub={l.desc} />
                      ))}
                    </div>
                  </div>
                  {(!character.eyeShape || !character.browStyle || !character.lipShape) && (
                    <p style={{ color: '#5A5A6E', fontSize: 11, textAlign: 'center', fontStyle: 'italic' }}>
                      Pick one from each section to continue 👆
                    </p>
                  )}
                </div>
              )}

              {/* Step 5: Outfit */}
              {localStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {OUTFITS.map(o => (
                    <motion.button key={o.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { updateCharacter({ outfit: o.value }); showFeedback(`${o.emoji} ${o.desc}`) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14,
                        border: `2px solid ${character.outfit === o.value ? '#FF4D00' : '#3A3A44'}`,
                        background: character.outfit === o.value ? 'rgba(255,77,0,0.1)' : '#2C2C33',
                        cursor: 'pointer', textAlign: 'left',
                        boxShadow: character.outfit === o.value ? '0 0 12px rgba(255,77,0,0.2)' : 'none',
                      }}>
                      <span style={{ fontSize: 28 }}>{o.emoji}</span>
                      <div>
                        <p style={{ color: character.outfit === o.value ? '#FF4D00' : '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>{o.label}</p>
                        <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0', fontStyle: 'italic' }}>{o.desc}</p>
                      </div>
                      {character.outfit === o.value && <span style={{ marginLeft: 'auto', fontSize: 18 }}>✓</span>}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Step 6: Accessories */}
              {localStep === 6 && (
                <>
                  <p style={{ color: '#5A5A6E', fontSize: 12, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#FF4D00', fontWeight: 700 }}>{character.accessories.length}/3</span> items selected
                    {character.accessories.length === 3 && <span> — you absolute legend 🏅</span>}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ACCESSORIES.map(a => {
                      const selected = character.accessories.includes(a.value)
                      return (
                        <motion.button key={a.value}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            const cur = character.accessories
                            if (cur.includes(a.value)) {
                              updateCharacter({ accessories: cur.filter(x => x !== a.value) })
                            } else if (cur.length < 3) {
                              updateCharacter({ accessories: [...cur, a.value] })
                              showFeedback(`${a.emoji} ${a.desc}`)
                            } else {
                              showFeedback('Max 3 items! Drop one first 😅')
                            }
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14,
                            border: `2px solid ${selected ? '#FF4D00' : '#3A3A44'}`,
                            background: selected ? 'rgba(255,77,0,0.1)' : '#2C2C33',
                            cursor: 'pointer', textAlign: 'left',
                          }}>
                          <span style={{ fontSize: 26 }}>{a.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: selected ? '#FF4D00' : '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>{a.label}</p>
                            <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0', fontStyle: 'italic' }}>{a.desc}</p>
                          </div>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                            background: selected ? '#FF4D00' : 'transparent',
                            border: `2px solid ${selected ? '#FF4D00' : '#3A3A44'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                          }}>
                            {selected && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Step 7: Expression & Name */}
              {localStep === 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <p style={{ color: '#FF8C42', fontSize: 11, fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>Default Vibe</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {EXPRESSIONS.map(ex => (
                        <OptionCard key={ex.value} label={ex.label} selected={character.expression === ex.value}
                          onClick={() => { updateCharacter({ expression: ex.value }); showFeedback(`${ex.emoji} ${ex.desc}`) }}
                          emoji={ex.emoji} sub={ex.desc} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <p style={{ color: '#5A5A6E', fontSize: 11, margin: '0 0 6px' }}>What do your travel buds call you?</p>
                      <input
                        className="input-base"
                        placeholder="Your display name"
                        value={character.displayName}
                        onChange={e => updateCharacter({ displayName: e.target.value })}
                        maxLength={24}
                      />
                    </div>
                    <input
                      className="input-base"
                      placeholder="Pronouns (optional — e.g. she/her, they/them)"
                      value={character.pronouns}
                      onChange={e => updateCharacter({ pronouns: e.target.value })}
                    />
                  </div>
                  {character.displayName && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'rgba(255,77,0,0.08)', borderRadius: 14, border: '1px solid rgba(255,77,0,0.2)', padding: '12px 16px' }}>
                      <p style={{ color: '#FF8C42', fontSize: 13, margin: 0 }}>
                        🎉 Say hi to <strong>{character.displayName}</strong>! Your traveller is almost ready.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid #3A3A44' }}>
        <button
          className="btn-primary"
          onClick={goNext}
          disabled={!canProceed()}
          style={{ fontSize: 15 }}
        >
          {localStep < 7 ? 'Looks good, next →' : '🚀 Unleash My Traveller!'}
        </button>
      </div>
    </div>
  )
}
