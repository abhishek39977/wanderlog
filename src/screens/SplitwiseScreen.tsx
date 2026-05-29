import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ArrowRight, CheckCircle, Trash2, Users, DollarSign, Receipt } from 'lucide-react'
import { useTripStore } from '../store/tripStore'
import { useOnboardingStore } from '../store/onboardingStore'
import { format } from 'date-fns'
import { getCurrencySymbol } from '../utils/currency'

const SPLIT_CATEGORIES = ['Food', 'Transport', 'Stay', 'Activities', 'Shopping', 'Other']
const CAT_EMOJI: Record<string, string> = {
  Food: '🍽️', Transport: '🚗', Stay: '🏨', Activities: '🎯', Shopping: '🛍️', Other: '📦',
}
const CAT_COLORS: Record<string, string> = {
  Food: '#FF8C42', Transport: '#06B6D4', Stay: '#8B5CF6', Activities: '#22C55E', Shopping: '#FF4D00', Other: '#8A8A9A',
}

export const SplitwiseScreen: React.FC = () => {
  const { expenses, activeTrip, addExpense, removeExpense, getBalance, getSettlements, markSettled } = useTripStore()
  const { userId, character } = useOnboardingStore()
  const [activeTab, setActiveTab] = useState<'split' | 'balances' | 'settle'>('split')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: format(new Date(), 'yyyy-MM-dd'),
    splitType: 'equal' as 'equal' | 'custom',
    paidBy: userId || '',
  })

  const members = activeTrip?.members || []
  const balance = getBalance()
  const settlements = getSettlements()
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const currency = activeTrip?.currency || 'INR'
  const sym = getCurrencySymbol(currency)
  const pendingTotal = settlements.reduce((s, st) => s + st.amount, 0)
  const perPersonPending = members.length > 0 ? pendingTotal / members.length : 0

  const handleAdd = () => {
    if (!form.amount || !form.paidBy) return
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return
    const payerMember = members.find(m => m.id === form.paidBy)
    addExpense({
      amount,
      category: form.category,
      payer: form.paidBy,
      payerName: payerMember?.name || character.displayName || 'Unknown',
      date: form.date,
      description: form.description,
      splitType: 'equal',
      splits: {},
      settled: false,
    })
    setForm({ amount: '', description: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd'), splitType: 'equal', paidBy: userId || '' })
    setShowAdd(false)
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Splitwise</h1>
            <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>{members.length} members · {sym}{totalSpent.toFixed(0)} total{members.length > 1 ? ` · ${sym}${(totalSpent/members.length).toFixed(0)}/person` : ''}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0 }}>Pending</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: settlements.length > 0 ? '#EF4444' : '#22C55E', margin: '2px 0 0' }}>
              {settlements.length > 0 ? `${settlements.length} debts` : '✓ Clear'}
            </p>
          </div>
        </div>
      </div>

      {/* Member chips */}
      {members.length > 0 && (
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {members.map(m => {
              const bal = balance[m.id] || 0
              return (
                <div key={m.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: '#242429', borderRadius: 14, padding: '10px 14px', flexShrink: 0,
                  border: `1px solid ${bal > 0.01 ? 'rgba(34,197,94,0.3)' : bal < -0.01 ? 'rgba(239,68,68,0.3)' : '#3A3A44'}`,
                }}>
                  <div style={{ fontSize: 20 }}>{m.role === 'owner' ? '👑' : '👤'}</div>
                  <span style={{ color: '#EFEFEF', fontSize: 11, fontWeight: 600 }}>{m.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: bal > 0.01 ? '#22C55E' : bal < -0.01 ? '#EF4444' : '#8A8A9A' }}>
                    {bal > 0.01 ? '+' : ''}{bal.toFixed(2) === '0.00' ? '✓' : `${sym}${Math.abs(bal).toFixed(0)}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', background: '#242429', borderRadius: 12, padding: 4, border: '1px solid #3A3A44' }}>
          {([
            { id: 'split', label: '📋 Expenses' },
            { id: 'balances', label: '⚖️ Balances' },
            { id: 'settle', label: '✅ Settle' },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '8px 4px', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: activeTab === tab.id ? '#FF4D00' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#8A8A9A',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 100px' }}>
        <AnimatePresence mode="wait">

          {/* Expenses tab */}
          {activeTab === 'split' && (
            <motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🧾</div>
                  <p style={{ color: '#5A5A6E', fontSize: 14, lineHeight: 1.6 }}>No group expenses yet.<br />Add one to start splitting costs!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...expenses].reverse().map((exp) => {
                    const perPerson = members.length > 0 ? exp.amount / members.length : exp.amount
                    return (
                      <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#242429', borderRadius: 14, border: '1px solid #3A3A44', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${CAT_COLORS[exp.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                            {CAT_EMOJI[exp.category] || '📦'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>{exp.description || exp.category}</p>
                            <p style={{ color: '#8A8A9A', fontSize: 11, margin: '3px 0 0' }}>
                              Paid by <strong style={{ color: '#FF8C42' }}>{exp.payerName}</strong> · {exp.date}
                            </p>
                            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, color: '#5A5A6E', background: '#2C2C33', padding: '2px 8px', borderRadius: 8 }}>
                                {sym}{perPerson.toFixed(2)}/person
                              </span>
                              <span style={{ fontSize: 11, color: CAT_COLORS[exp.category] || '#8A8A9A', background: `${CAT_COLORS[exp.category]}18`, padding: '2px 8px', borderRadius: 8 }}>
                                {exp.category}
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            <p style={{ color: '#FF4D00', fontSize: 16, fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{sym}{exp.amount.toFixed(2)}</p>
                            <button onClick={() => removeExpense(exp.id)}
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Trash2 size={12} color="#EF4444" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Balances tab */}
          {activeTab === 'balances' && (
            <motion.div key="balances" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#5A5A6E', fontSize: 14 }}>
                    Create or join a trip first to see balances.
                  </div>
                ) : (
                  members.map(member => {
                    const bal = balance[member.id] || 0
                    const isOwed = bal > 0.01
                    const owes = bal < -0.01
                    return (
                      <motion.div key={member.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: '#242429', borderRadius: 16, padding: '16px',
                          border: `1px solid ${isOwed ? 'rgba(34,197,94,0.25)' : owes ? 'rgba(239,68,68,0.25)' : '#3A3A44'}`,
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%', background: '#2C2C33',
                            border: `2px solid ${member.role === 'owner' ? '#FF4D00' : '#3A3A44'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                          }}>
                            {member.role === 'owner' ? '👑' : '👤'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 700, margin: 0 }}>{member.name}</p>
                            <p style={{ color: isOwed ? '#22C55E' : owes ? '#EF4444' : '#5A5A6E', fontSize: 12, margin: '3px 0 0', fontWeight: 600 }}>
                              {isOwed ? '💰 Gets back' : owes ? '⚠️ Owes' : '✓ All square'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{
                              fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, margin: 0,
                              color: isOwed ? '#22C55E' : owes ? '#EF4444' : '#8A8A9A',
                            }}>
                              {isOwed ? '+' : owes ? '-' : ''}{Math.abs(bal) > 0.01 ? `${sym}${Math.abs(bal).toFixed(2)}` : `${sym}0`}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown bar */}
                        {Math.abs(bal) > 0.01 && totalSpent > 0 && (
                          <div style={{ marginTop: 10, height: 4, background: '#2C2C33', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (Math.abs(bal) / (totalSpent / members.length)) * 100)}%` }}
                              transition={{ duration: 0.8 }}
                              style={{ height: '100%', borderRadius: 2, background: isOwed ? '#22C55E' : '#EF4444' }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* Settle tab */}
          {activeTab === 'settle' && (
            <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {settlements.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(34,197,94,0.06)', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#22C55E', margin: 0 }}>All settled!</h3>
                  <p style={{ color: '#8A8A9A', fontSize: 14, margin: '8px 0 0', lineHeight: 1.6 }}>
                    {expenses.length === 0
                      ? 'No expenses added yet. Add group expenses and see who owes what!'
                      : 'Everyone is even — no debts to settle.'}
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ color: '#5A5A6E', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                    Tap "Settle Up" after the person pays. This uses the minimum transactions algorithm — like the real Splitwise!
                  </p>
                  {settlements.map((s, idx) => (
                    <motion.div key={`${s.fromId}-${s.toId}-${idx}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                      style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.08), rgba(255,77,0,0.04))', borderRadius: 18, border: '1px solid rgba(255,77,0,0.2)', padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        {/* From */}
                        <div style={{ flex: 1, background: '#2C2C33', borderRadius: 12, padding: '10px 12px' }}>
                          <p style={{ color: '#5A5A6E', fontSize: 10, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>pays</p>
                          <p style={{ color: '#EF4444', fontSize: 14, fontWeight: 700, margin: '2px 0 0' }}>{s.fromName}</p>
                        </div>
                        <ArrowRight size={20} color="#FF4D00" />
                        {/* To */}
                        <div style={{ flex: 1, background: '#2C2C33', borderRadius: 12, padding: '10px 12px', textAlign: 'right' }}>
                          <p style={{ color: '#5A5A6E', fontSize: 10, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>receives</p>
                          <p style={{ color: '#22C55E', fontSize: 14, fontWeight: 700, margin: '2px 0 0' }}>{s.toName}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: '#EFEFEF' }}>
                          {sym}{s.amount.toFixed(2)}
                        </span>
                        <button onClick={() => markSettled(s.fromId, s.toId)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.4)', color: '#22C55E', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                          <CheckCircle size={16} /> Settle Up
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#1E1E24', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44', maxHeight: '90vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Group Expense</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: '#2C2C33', border: '1px solid #3A3A44', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="#8A8A9A" />
                </button>
              </div>

              {/* Amount */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#FF4D00', fontSize: 22, fontWeight: 700, zIndex: 1 }}>{sym}</span>
                <input className="input-base" type="number" inputMode="decimal" placeholder="0.00" value={form.amount} autoFocus
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  style={{ paddingLeft: 36, fontSize: 24, fontWeight: 800, height: 58 }} />
              </div>

              {/* Description */}
              <input className="input-base" placeholder="What's it for? (e.g. Dinner)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 14 }} />

              {/* Paid By */}
              {members.length > 0 && (
                <>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Paid By</p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                    {members.map(m => (
                      <button key={m.id} onClick={() => setForm(f => ({ ...f, paidBy: m.id }))}
                        style={{
                          padding: '8px 14px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          border: `2px solid ${form.paidBy === m.id ? '#FF4D00' : '#3A3A44'}`,
                          background: form.paidBy === m.id ? 'rgba(255,77,0,0.15)' : '#2C2C33',
                          color: form.paidBy === m.id ? '#FF4D00' : '#8A8A9A', flexShrink: 0,
                        }}>
                        {m.role === 'owner' ? '👑 ' : '👤 '}{m.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Category */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                {SPLIT_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                    style={{
                      padding: '7px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 12,
                      border: `1px solid ${form.category === cat ? CAT_COLORS[cat] : '#3A3A44'}`,
                      background: form.category === cat ? `${CAT_COLORS[cat]}18` : '#2C2C33',
                      color: form.category === cat ? CAT_COLORS[cat] : '#8A8A9A', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    {CAT_EMOJI[cat]} {cat}
                  </button>
                ))}
              </div>

              {/* Date */}
              <input className="input-base" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ colorScheme: 'dark', marginBottom: 14 }} />

              {/* Split info */}
              {members.length > 0 && form.amount && (
                <div style={{ background: 'rgba(255,77,0,0.06)', borderRadius: 12, border: '1px solid rgba(255,77,0,0.15)', padding: '12px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#FF8C42', fontSize: 13, margin: 0 }}>
                    💡 Split equally: <strong>{sym}{(parseFloat(form.amount || '0') / members.length).toFixed(2)}</strong> per person ({members.length} members)
                  </p>
                </div>
              )}

              <button className="btn-primary" onClick={handleAdd} disabled={!form.amount || parseFloat(form.amount) <= 0}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Receipt size={18} /> Add & Split Equally
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="glow-orange"
        style={{ position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#FF4D00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
