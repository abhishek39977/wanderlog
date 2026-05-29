import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from './store/onboardingStore'
import { SplashScreen } from './screens/SplashScreen'
import { AuthScreen } from './screens/AuthScreen'
import { CharacterWizard } from './screens/onboarding/CharacterWizard'
import { CharacterReveal } from './screens/onboarding/CharacterReveal'
import { GroupStep } from './screens/onboarding/GroupStep'
import { HomeScreen } from './screens/HomeScreen'
import { PackingListScreen } from './screens/PackingListScreen'
import { TimelineScreen } from './screens/TimelineScreen'
import { ExpensesScreen } from './screens/ExpensesScreen'
import { MapScreen } from './screens/MapScreen'
import { GalleryScreen } from './screens/GalleryScreen'
import { SOSScreen } from './screens/SOSScreen'
import { TripSettingsScreen } from './screens/TripSettingsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { VibeBoardScreen } from './screens/VibeBoardScreen'
import { TickBoardScreen } from './screens/TickBoardScreen'
import { WishlistScreen } from './screens/WishlistScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { SplitwiseScreen } from './screens/SplitwiseScreen'
import { PhotoEditorScreen } from './screens/PhotoEditorScreen'
import { ScrapbookScreen } from './screens/ScrapbookScreen'
import { BottomNav, SOSFAB } from './components/BottomNav'

type AppPhase = 'splash' | 'auth' | 'character' | 'reveal' | 'group' | 'unlock' | 'app'
export type AppScreen =
  | 'home' | 'packing' | 'timeline' | 'expenses' | 'map'
  | 'gallery' | 'sos' | 'settings' | 'profile' | 'vibeboard'
  | 'tickboard' | 'wishlist' | 'calendar' | 'photoeditor' | 'scrapbook' | 'splitwise'

// App unlock animation
const UnlockAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 2000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      className="screen"
      style={{ alignItems: 'center', justifyContent: 'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ fontSize: 72, marginBottom: 24 }}
        >
          🎉
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#EFEFEF', margin: '0 0 8px' }}
        >
          You're all set!
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#8A8A9A', fontSize: 15 }}
        >
          Welcome to WanderLog ✈️
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          style={{ width: 200, height: 3, background: 'linear-gradient(90deg, #FF4D00, #FF8C42)', borderRadius: 2, margin: '24px auto 0', boxShadow: '0 0 12px rgba(255,77,0,0.6)' }}
        />
      </motion.div>
    </motion.div>
  )
}

function App() {
  const { authComplete, characterComplete, characterStep, groupComplete } = useOnboardingStore()
  const [phase, setPhase] = useState<AppPhase>('splash')
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home')
  const [showSOS, setShowSOS] = useState(false)
  const [characterRevealed, setCharacterRevealed] = useState(false)
  const [photoEditorUrl, setPhotoEditorUrl] = useState<string | undefined>()

  // Determine initial phase based on stored state
  useEffect(() => {
    const t = setTimeout(() => {
      if (!authComplete) setPhase('splash')
      else if (!characterComplete) setPhase('character')
      else if (!groupComplete) setPhase('group')
      else setPhase('app')
    }, 100)
    return () => clearTimeout(t)
  }, [])

  // Logout redirect — watch authComplete and reset to splash when it becomes false
  useEffect(() => {
    if (!authComplete && phase !== 'splash' && phase !== 'auth') {
      setPhase('splash')
      setActiveScreen('home')
    }
  }, [authComplete])

  // Transition handlers
  const handleSplashComplete = () => {
    if (authComplete && characterComplete && groupComplete) setPhase('app')
    else setPhase('auth')
  }

  const handleAuthComplete = () => {
    if (characterComplete && groupComplete) setPhase('app')
    else setPhase('character')
  }

  const handleCharacterComplete = () => {
    setCharacterRevealed(false)
    setPhase('reveal')
  }

  const handleRevealComplete = () => {
    if (groupComplete) setPhase('app')
    else setPhase('group')
  }

  const handleGroupComplete = () => setPhase('unlock')
  const handleUnlockComplete = () => setPhase('app')

  const navigate = (screen: string, opts?: { photoUrl?: string }) => {
    if (screen === 'sos') { setShowSOS(true); setActiveScreen('sos'); return }
    if (screen === 'photoeditor') {
      setPhotoEditorUrl(opts?.photoUrl)
      setActiveScreen('photoeditor')
      setShowSOS(false)
      return
    }
    setShowSOS(false)
    setActiveScreen(screen as AppScreen)
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'settings':   return <TripSettingsScreen onBack={() => setActiveScreen('home')} />
      case 'sos':        return <SOSScreen />
      case 'gallery':    return <GalleryScreen onNavigate={navigate} />
      case 'map':        return <MapScreen />
      case 'expenses':   return <ExpensesScreen />
      case 'timeline':   return <TimelineScreen />
      case 'packing':    return <PackingListScreen />
      case 'profile':    return <ProfileScreen onNavigate={navigate} />
      case 'vibeboard':  return <VibeBoardScreen />
      case 'tickboard':  return <TickBoardScreen />
      case 'wishlist':   return <WishlistScreen />
      case 'calendar':   return <CalendarScreen />
      case 'photoeditor':return <PhotoEditorScreen photoUrl={photoEditorUrl} onBack={() => setActiveScreen('gallery')} />
      case 'scrapbook':  return <ScrapbookScreen onNavigate={navigate} />
      case 'splitwise':  return <SplitwiseScreen />
      default:           return <HomeScreen onNavigate={navigate} />
    }
  }

  // Screens where bottom nav should be hidden (full-screen experiences)
  const hideNav = activeScreen === 'photoeditor' || activeScreen === 'scrapbook'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1A1A1F', overflow: 'hidden', maxWidth: 480, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        {phase === 'splash' && (
          <motion.div key="splash" style={{ position: 'absolute', inset: 0 }}>
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}

        {phase === 'auth' && (
          <motion.div key="auth" style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AuthScreen onComplete={handleAuthComplete} />
          </motion.div>
        )}

        {phase === 'character' && (
          <motion.div key="character" style={{ position: 'absolute', inset: 0 }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
            <CharacterWizard onComplete={handleCharacterComplete} />
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div key="reveal" style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <CharacterReveal onComplete={handleRevealComplete} />
          </motion.div>
        )}

        {phase === 'group' && (
          <motion.div key="group" style={{ position: 'absolute', inset: 0 }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
            <GroupStep onComplete={handleGroupComplete} />
          </motion.div>
        )}

        {phase === 'unlock' && (
          <motion.div key="unlock" style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <UnlockAnimation onComplete={handleUnlockComplete} />
          </motion.div>
        )}

        {phase === 'app' && (
          <motion.div key="app" style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Main content area */}
            <div style={{ position: 'absolute', inset: 0, paddingBottom: hideNav ? 0 : 72 }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeScreen} style={{ position: 'absolute', inset: 0 }}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}>
                  {renderScreen()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom nav — hidden on full-screen editors */}
            {!hideNav && (
              <BottomNav activeScreen={activeScreen} onNavigate={navigate} />
            )}

            {/* SOS FAB — left side so it doesn't overlap screen + FABs on right */}
            {activeScreen !== 'sos' && !hideNav && (
              <SOSFAB onPress={() => navigate('sos')} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
