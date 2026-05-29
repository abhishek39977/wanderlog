import React from 'react'
import type { CharacterConfig } from '../../store/onboardingStore'

interface AvatarRendererProps {
  config: Partial<CharacterConfig>
  size?: number
  showGlow?: boolean
}

// ─── Colour Maps ──────────────────────────────────────────────────────────────

const SKIN_COLORS: Record<string, { base: string; shadow: string; highlight: string }> = {
  Fair:   { base: '#FDDBB4', shadow: '#E8B98A', highlight: '#FFF0D6' },
  Light:  { base: '#F5C59F', shadow: '#D9A07A', highlight: '#FFDDB8' },
  Medium: { base: '#E8A87C', shadow: '#C07A50', highlight: '#F5C090' },
  Tan:    { base: '#C68642', shadow: '#9A6030', highlight: '#D9A060' },
  Brown:  { base: '#8D5524', shadow: '#6A3D18', highlight: '#A06830' },
  Deep:   { base: '#4A2912', shadow: '#2D1608', highlight: '#5E3820' },
}

const HAIR_COLORS: Record<string, string> = {
  'Black':       '#1A1A1A',
  'Dark Brown':  '#3B1A08',
  'Light Brown': '#8B4513',
  'Blonde':      '#F4C430',
  'Red':         '#C0392B',
  'Grey':        '#9B9B9B',
  'Neon Blue':   '#00BFFF',
  'Pastel Pink': '#FFB6C1',
}

const OUTFIT_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  'Backpacker':     { primary: '#2D5A27', secondary: '#4A7C3F', accent: '#8B6914' },
  'Urban Explorer': { primary: '#2C3E50', secondary: '#34495E', accent: '#FF4D00' },
  'Beach':          { primary: '#00ACC1', secondary: '#26C6DA', accent: '#FFF176' },
  'Trekker':        { primary: '#5D4037', secondary: '#795548', accent: '#FF8C00' },
  'Cosy Wanderer':  { primary: '#7B3F00', secondary: '#A0522D', accent: '#F5DEB3' },
}

const EXPRESSION_MOUTHS: Record<string, string> = {
  'Chill':    'M 32,54 Q 40,58 48,54',
  'Excited':  'M 30,52 Q 40,62 50,52',
  'Curious':  'M 33,55 Q 40,55 47,55',
  'Happy':    'M 31,53 Q 40,61 49,53',
  'Smiling':  'M 32,52 Q 40,59 48,52',
  'Laughing': 'M 29,51 Q 40,64 51,51',
  'Tired':    'M 33,56 Q 40,54 47,56',
}

const EYE_SHAPES: Record<string, { left: string; right: string }> = {
  'Almond':  { left: 'M 26,35 Q 29,32 32,35 Q 29,38 26,35', right: 'M 48,35 Q 51,32 54,35 Q 51,38 48,35' },
  'Round':   { left: 'M 26,35 A 3,3 0 1,1 32,35 A 3,3 0 1,1 26,35', right: 'M 48,35 A 3,3 0 1,1 54,35 A 3,3 0 1,1 48,35' },
  'Cat Eye': { left: 'M 25,36 Q 29,31 33,35 Q 30,39 25,36', right: 'M 47,35 Q 51,31 55,36 Q 50,39 47,35' },
  'Hooded':  { left: 'M 26,36 Q 29,33 32,36 Q 29,39 26,36', right: 'M 48,36 Q 51,33 54,36 Q 51,39 48,36' },
}

// ─── Avatar SVG ───────────────────────────────────────────────────────────────

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({ config, size = 80, showGlow }) => {
  const skin = SKIN_COLORS[config.skinTone || ''] || SKIN_COLORS['Medium']
  const hairColor = HAIR_COLORS[config.hairColour || ''] || '#3B1A08'
  const outfit = OUTFIT_COLORS[config.outfit || ''] || OUTFIT_COLORS['Urban Explorer']
  const mouth = EXPRESSION_MOUTHS[config.expression || ''] || EXPRESSION_MOUTHS['Chill']
  const eyes = EYE_SHAPES[config.eyeShape || ''] || EYE_SHAPES['Almond']
  const accessories = config.accessories || []

  // Body width modifier based on body type
  const bodyWide = config.bodyType === 'Broad' || config.bodyType === 'Curvy'
  const bodySlim = config.bodyType === 'Slim' || config.bodyType === 'Petite'
  const bodyWidth = bodyWide ? 28 : bodySlim ? 20 : 24
  const bodyX = 40 - bodyWidth / 2

  // Scale
  const scale = size / 80

  return (
    <div style={{
      width: size, height: size,
      filter: showGlow ? 'drop-shadow(0 0 12px rgba(255,77,0,0.5))' : undefined,
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 80 80" width={size} height={size} style={{ overflow: 'visible' }}>

        {/* ── Body / Torso ── */}
        <rect x={bodyX} y={54} width={bodyWidth} height={20} rx={6} fill={outfit.primary} />
        {/* collar / detail */}
        <rect x={36} y={54} width={8} height={6} rx={2} fill={outfit.secondary} />

        {/* ── Neck ── */}
        <rect x={36} y={48} width={8} height={8} rx={3} fill={skin.base} />

        {/* ── Head ── */}
        <ellipse cx={40} cy={36} rx={18} ry={20} fill={skin.base} />
        {/* jaw shadow */}
        <ellipse cx={40} cy={48} rx={12} ry={5} fill={skin.shadow} opacity={0.3} />

        {/* ── Ears ── */}
        <ellipse cx={22} cy={37} rx={4} ry={5} fill={skin.base} />
        <ellipse cx={58} cy={37} rx={4} ry={5} fill={skin.base} />
        <ellipse cx={22} cy={37} rx={2.5} ry={3} fill={skin.shadow} opacity={0.4} />
        <ellipse cx={58} cy={37} rx={2.5} ry={3} fill={skin.shadow} opacity={0.4} />

        {/* Earrings */}
        {accessories.includes('Earrings') && (
          <>
            <circle cx={22} cy={42} r={2} fill="#FFD700" stroke="#FF8C42" strokeWidth={0.5} />
            <circle cx={58} cy={42} r={2} fill="#FFD700" stroke="#FF8C42" strokeWidth={0.5} />
          </>
        )}

        {/* ── Hair ── */}
        <HairLayer style={config.hairStyle || 'Wavy'} color={hairColor} />

        {/* ── Eyes ── */}
        {/* eye whites */}
        <ellipse cx={29} cy={35} rx={5} ry={4} fill="white" opacity={0.9} />
        <ellipse cx={51} cy={35} rx={5} ry={4} fill="white" opacity={0.9} />
        {/* iris */}
        <circle cx={29} cy={35} r={2.8} fill={skin.shadow} />
        <circle cx={51} cy={35} r={2.8} fill={skin.shadow} />
        {/* pupil */}
        <circle cx={29} cy={35} r={1.5} fill="#111" />
        <circle cx={51} cy={35} r={1.5} fill="#111" />
        {/* highlight */}
        <circle cx={30} cy={34} r={0.8} fill="white" />
        <circle cx={52} cy={34} r={0.8} fill="white" />
        {/* eye outline */}
        <path d={eyes.left} fill="none" stroke={skin.shadow} strokeWidth={0.8} opacity={0.6} />
        <path d={eyes.right} fill="none" stroke={skin.shadow} strokeWidth={0.8} opacity={0.6} />

        {/* Brow style */}
        <BrowLayer style={config.browStyle || 'Arched'} skinColor={skin.shadow} hairColor={hairColor} />

        {/* ── Nose ── */}
        <ellipse cx={40} cy={43} rx={2} ry={1.5} fill={skin.shadow} opacity={0.5} />
        <path d="M 38,41 Q 40,44 42,41" fill="none" stroke={skin.shadow} strokeWidth={0.8} opacity={0.4} />

        {/* ── Mouth ── */}
        <path d={mouth} fill="none" stroke={config.lipShape === 'Full' ? '#C0392B' : skin.shadow} strokeWidth={1.8} strokeLinecap="round" />
        {config.lipShape === 'Full' && (
          <path d={mouth} fill="none" stroke="#E57373" strokeWidth={0.8} strokeLinecap="round" opacity={0.5} />
        )}

        {/* ── Accessories ── */}
        {/* Sunglasses */}
        {accessories.includes('Sunglasses') && (
          <>
            <rect x={22} y={32} width={14} height={9} rx={4} fill="#1A1A1A" opacity={0.85} />
            <rect x={44} y={32} width={14} height={9} rx={4} fill="#1A1A1A" opacity={0.85} />
            <line x1={36} y1={36} x2={44} y2={36} stroke="#333" strokeWidth={1.5} />
            <rect x={22} y={32} width={14} height={9} rx={4} fill="none" stroke="#FF4D00" strokeWidth={0.8} />
            <rect x={44} y={32} width={14} height={9} rx={4} fill="none" stroke="#FF4D00" strokeWidth={0.8} />
          </>
        )}

        {/* Cap / Hat */}
        {accessories.includes('Cap / Hat') && (
          <>
            <ellipse cx={40} cy={19} rx={20} ry={5} fill={outfit.accent} />
            <rect x={22} y={14} width={36} height={8} rx={4} fill={outfit.accent} />
            <ellipse cx={40} cy={13} rx={14} ry={3} fill={outfit.secondary} />
          </>
        )}

        {/* Camera Strap — shown as strap over body */}
        {accessories.includes('Camera Strap') && (
          <>
            <path d="M 36,54 Q 28,60 30,70" fill="none" stroke="#8B4513" strokeWidth={2} strokeLinecap="round" />
            <rect x={28} y={68} width={8} height={6} rx={2} fill="#2C2C33" stroke="#8A8A9A" strokeWidth={0.8} />
          </>
        )}

        {/* Backpack — shown on side of body */}
        {accessories.includes('Backpack') && (
          <>
            <rect x={54} y={54} width={10} height={14} rx={3} fill={outfit.secondary} />
            <path d="M 54,56 Q 50,52 54,54" fill="none" stroke={outfit.secondary} strokeWidth={2} strokeLinecap="round" />
            <rect x={56} y={59} width={6} height={4} rx={1} fill={outfit.primary} />
          </>
        )}

        {/* Outfit detail lines */}
        <line x1={40} y1={60} x2={40} y2={74} stroke={outfit.secondary} strokeWidth={0.5} opacity={0.5} />
      </svg>
    </div>
  )
}

// ─── Hair Sub-component ───────────────────────────────────────────────────────

const HairLayer: React.FC<{ style: string; color: string }> = ({ style, color }) => {
  const dark = shadeColor(color, -30)
  switch (style) {
    case 'Wavy':
      return (
        <>
          <path d="M 22,30 Q 18,20 22,14 Q 30,6 40,8 Q 50,6 58,14 Q 62,20 58,30 Q 55,15 40,14 Q 25,15 22,30Z" fill={color} />
          <path d="M 22,30 Q 20,36 18,45 Q 20,42 22,38 Q 24,34 24,30" fill={color} />
          <path d="M 58,30 Q 60,36 62,45 Q 60,42 58,38 Q 56,34 56,30" fill={color} />
          <path d="M 22,14 Q 26,10 32,9 Q 28,12 26,18" fill={dark} opacity={0.4} />
        </>
      )
    case 'Straight':
      return (
        <>
          <path d="M 22,30 Q 18,20 22,14 Q 30,6 40,8 Q 50,6 58,14 Q 62,20 58,30 Q 55,15 40,14 Q 25,15 22,30Z" fill={color} />
          <rect x={20} y={30} width={4} height={20} rx={2} fill={color} />
          <rect x={56} y={30} width={4} height={20} rx={2} fill={color} />
        </>
      )
    case 'Curly':
      return (
        <>
          <path d="M 22,32 Q 16,22 20,14 Q 28,4 40,6 Q 52,4 60,14 Q 64,22 58,32 Q 55,14 40,12 Q 25,14 22,32Z" fill={color} />
          <circle cx={20} cy={30} r={5} fill={color} />
          <circle cx={17} cy={36} r={4} fill={color} />
          <circle cx={60} cy={30} r={5} fill={color} />
          <circle cx={63} cy={36} r={4} fill={color} />
          <circle cx={22} cy={24} r={5} fill={dark} opacity={0.3} />
        </>
      )
    case 'Braids':
      return (
        <>
          <path d="M 22,30 Q 18,20 22,14 Q 30,6 40,8 Q 50,6 58,14 Q 62,20 58,30 Q 55,15 40,14 Q 25,15 22,30Z" fill={color} />
          <path d="M 22,30 L 20,50 M 24,30 L 22,50" stroke={color} strokeWidth={3} strokeLinecap="round" />
          <path d="M 58,30 L 60,50 M 56,30 L 58,50" stroke={color} strokeWidth={3} strokeLinecap="round" />
          {[32,38,44].map(y => (
            <line key={y} x1={20} y1={y} x2={24} y2={y+2} stroke={dark} strokeWidth={0.8} opacity={0.5} />
          ))}
        </>
      )
    case 'Short Crop':
      return (
        <path d="M 22,28 Q 20,20 22,14 Q 30,6 40,8 Q 50,6 58,14 Q 60,20 58,28 Q 55,14 40,14 Q 25,14 22,28Z" fill={color} />
      )
    case 'Buzz Cut':
      return (
        <>
          <path d="M 23,28 Q 21,20 23,14 Q 31,7 40,8 Q 49,7 57,14 Q 59,20 57,28 Q 55,15 40,15 Q 25,15 23,28Z" fill={color} opacity={0.9} />
          {/* stubble texture */}
          {[24,28,32,36,40,44,48,52].map(x => (
            <line key={x} x1={x} y1={12} x2={x+1} y2={14} stroke={dark} strokeWidth={0.8} opacity={0.5} />
          ))}
        </>
      )
    default:
      return (
        <path d="M 22,30 Q 18,20 22,14 Q 30,6 40,8 Q 50,6 58,14 Q 62,20 58,30 Q 55,15 40,14 Q 25,15 22,30Z" fill={color} />
      )
  }
}

// ─── Brow Sub-component ───────────────────────────────────────────────────────

const BrowLayer: React.FC<{ style: string; skinColor: string; hairColor: string }> = ({ style, skinColor: _, hairColor }) => {
  const c = hairColor === '#1A1A1A' ? '#1A1A1A' : shadeColor(hairColor, -20)
  switch (style) {
    case 'Straight':
      return (
        <>
          <line x1={24} y1={29} x2={34} y2={29} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
          <line x1={46} y1={29} x2={56} y2={29} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )
    case 'Thick':
      return (
        <>
          <path d="M 24,30 Q 29,28 34,30" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" />
          <path d="M 46,30 Q 51,28 56,30" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" />
        </>
      )
    default: // Arched
      return (
        <>
          <path d="M 24,30 Q 29,26 34,29" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M 46,29 Q 51,26 56,30" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
