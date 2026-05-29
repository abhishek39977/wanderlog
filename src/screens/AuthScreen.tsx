import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Compass } from 'lucide-react'
import { useOnboardingStore } from '../store/onboardingStore'

interface AuthScreenProps {
  onComplete: () => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useOnboardingStore(s => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const userId = `user_${Math.random().toString(36).substr(2, 9)}`
    setAuth(email, userId)
    setLoading(false)
    onComplete()
  }

  const [socialMsg, setSocialMsg] = useState('')

  // Social auth — shows a message since real OAuth needs a backend
  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setSocialMsg(`${provider === 'google' ? 'Google' : 'Apple'} Sign In requires a backend server.\nPlease use your email & password to sign in — it's just as fast! ✉️`)
    setTimeout(() => setSocialMsg(''), 4000)
  }

  const anyLoading = loading

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at top, rgba(255,77,0,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '24px 24px 40px', maxWidth: 420, margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #FF4D00, #FF8C42)', marginBottom: 16,
          }}>
            <Compass size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#EFEFEF', margin: 0, letterSpacing: '-0.5px' }}>
            Wander<span style={{ color: '#FF4D00' }}>Log</span>
          </h1>
          <p style={{ color: '#8A8A9A', fontSize: 14, margin: '6px 0 0' }}>Your premium travel companion</p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: '#242429', borderRadius: 12, padding: 4, marginBottom: 28, border: '1px solid #3A3A44' }}>
          {(['signup', 'login'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
                background: mode === m ? '#FF4D00' : 'transparent',
                color: mode === m ? 'white' : '#8A8A9A',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
              }}
            >
              {m === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <input
                className="input-base"
                placeholder="Display Name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }}>✦</span>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <input
              className="input-base"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              className="input-base"
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 44, paddingRight: 44 }}
            />
            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A5A6E' }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A6E', padding: 0 }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#EF4444', fontSize: 13, margin: 0, textAlign: 'center' }}
            >
              {error}
            </motion.p>
          )}

          <button type="submit" className="btn-primary" disabled={anyLoading} style={{ marginTop: 8 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <motion.div
                  style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : mode === 'signup' ? 'Start Your Journey →' : 'Continue Journey →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#3A3A44' }} />
          <span style={{ color: '#5A5A6E', fontSize: 12 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: '#3A3A44' }} />
        </div>

        {/* Social auth */}
        {socialMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,140,66,0.1)', border: '1px solid rgba(255,140,66,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 4 }}
          >
            <p style={{ color: '#FF8C42', fontSize: 13, margin: 0, lineHeight: 1.5, textAlign: 'center' }}>{socialMsg}</p>
          </motion.div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={anyLoading}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', flex: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={anyLoading}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', flex: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.83.03 3.02 2.65 4.03 2.68 4.04l-.06.21zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#5A5A6E', fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </motion.div>
  )
}
