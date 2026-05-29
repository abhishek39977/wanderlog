import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, TrendingUp, ArrowRight, CheckCircle, Trash2, Target } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTripStore } from '../store/tripStore'
import { useOnboardingStore } from '../store/onboardingStore'
import { format } from 'date-fns'
import { getCurrencySymbol } from '../utils/currency'

const CATEGORIES = ['Food', 'Transport', 'Stay', 'Activities', 'Shopping', 'Other']
const CAT_COLORS: Record<string, string> = {
  Food: '#FF8C42', Transport: '#06B6D4', Stay: '#8B5CF6', Activities: '#22C55E', Shopping: '#FF4D00', Other: '#8A8A9A',
}
const CAT_EMOJI: Record<string, string> = {
  Food: '🍽️', Transport: '🚗', Stay: '🏨', Activities: '🎯', Shopping: '🛍️', Other: '📦',
}

const ProgressRing: React.FC<{ percent: number; size: number; color: string }> = ({ percent, size, color }) => {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(percent, 100) / 100) * c
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2C2C33" strokeWidth={5} fill="none" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={5} fill="none"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color}90)` }}
      />
    </svg>
  )
}

export const ExpensesScreen: React.FC = () => {
  const { expenses, activeTrip, addExpense, removeExpense, getBalance, getSettlements, markSettled, updateTripSettings } = useTripStore()
  const { userId, character } = useOnboardingStore()
  const [showAdd, setShowAdd] = useState(false)
  const [showBudget, setShowBudget] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'balance'>('overview')
  const [form, setForm] = useState({
    amount: '', category: 'Food', description: '', date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [budgetInput, setBudgetInput] = useState(String(activeTrip?.budget || ''))
  const [budgetSaved, setBudgetSaved] = useState(false)

  const totalBudget = activeTrip?.budget || 0
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const percent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const overBudget = totalBudget > 0 && totalSpent > totalBudget
  const remaining = totalBudget > 0 ? totalBudget - totalSpent : null
  const currency = activeTrip?.currency || 'INR'
  const sym = getCurrencySymbol(currency)

  const pieData = CATEGORIES.map(cat => ({
    name: cat, value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(d => d.value > 0)

  const balance = getBalance()
  const settlements = getSettlements()
  const members = activeTrip?.members || []

  const handleAdd = () => {
    if (!form.amount || !userId) return
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return
    addExpense({
      amount, category: form.category, payer: userId,
      payerName: character.displayName || 'You',
      date: form.date, description: form.description,
      splitType: 'equal', splits: {}, settled: false,
    })
    setForm({ amount: '', category: 'Food', description: '', date: format(new Date(), 'yyyy-MM-dd') })
    setShowAdd(false)
  }

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput)
    updateTripSettings({ budget: isNaN(val) || val <= 0 ? undefined : val })
    setBudgetSaved(true)
    setTimeout(() => { setBudgetSaved(false); setShowBudget(false) }, 1200)
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: '#EFEFEF', margin: 0 }}>Expenses</h1>
        <p style={{ color: '#8A8A9A', fontSize: 13, margin: '4px 0 0' }}>{currency} · {members.length} members</p>
      </div>

      {/* Budget hero card */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{
          background: '#242429', borderRadius: 24, border: `1px solid ${overBudget ? 'rgba(239,68,68,0.3)' : '#3A3A44'}`,
          padding: '20px', display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ProgressRing percent={totalBudget > 0 ? percent : 0} size={110} color={overBudget ? '#EF4444' : '#FF4D00'} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: overBudget ? '#EF4444' : '#FF4D00', fontFamily: "'Outfit', sans-serif" }}>
                {totalBudget > 0 ? `${percent}%` : '—'}
              </span>
              <span style={{ fontSize: 9, color: '#5A5A6E' }}>{totalBudget > 0 ? 'used' : 'no limit'}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#8A8A9A', fontSize: 12, margin: '0 0 2px' }}>Total Spent</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#EFEFEF', margin: '0 0 6px' }}>
              {sym}{totalSpent.toFixed(2)}
            </p>
            {totalBudget > 0 ? (
              <>
                <p style={{ color: overBudget ? '#EF4444' : '#5A5A6E', fontSize: 12, margin: '0 0 4px' }}>
                  {overBudget
                    ? `⚠️ Over by ${sym}${(totalSpent - totalBudget).toFixed(2)}`
                    : `${sym}${remaining!.toFixed(2)} remaining`}
                </p>
                <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0 }}>Budget: {sym}{totalBudget}</p>
              </>
            ) : (
              <p style={{ color: '#5A5A6E', fontSize: 12, margin: 0 }}>No budget set</p>
            )}
            {/* Set Budget button */}
            <button onClick={() => { setBudgetInput(String(activeTrip?.budget || '')); setShowBudget(true) }}
              style={{
                marginTop: 8, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,77,0,0.12)', border: '1px solid rgba(255,77,0,0.3)', color: '#FF8C42',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <Target size={10} /> {totalBudget > 0 ? 'Edit Budget' : 'Set Budget'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', background: '#242429', borderRadius: 12, padding: 4, border: '1px solid #3A3A44' }}>
          {(['overview', 'list', 'balance'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTab === tab ? '#FF4D00' : 'transparent',
                color: activeTab === tab ? 'white' : '#8A8A9A',
                fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', transition: 'all 0.2s',
              }}>
              {tab === 'balance' ? '⚖️ Balance' : tab === 'overview' ? '📊 Overview' : '📋 List'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 120px' }}>
        <AnimatePresence mode="wait">
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pieData.length > 0 ? (
                <>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                          paddingAngle={3} dataKey="value">
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#8A8A9A'} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#242429', border: '1px solid #3A3A44', borderRadius: 12, color: '#EFEFEF' }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [`${sym}${Number(value).toFixed(2)}`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#242429', borderRadius: 12, padding: '12px 14px', border: '1px solid #3A3A44' }}>
                        <span style={{ fontSize: 20 }}>{CAT_EMOJI[d.name]}</span>
                        <span style={{ flex: 1, color: '#8A8A9A', fontSize: 14 }}>{d.name}</span>
                        <span style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600 }}>{sym}{d.value.toFixed(2)}</span>
                        <span style={{ color: '#5A5A6E', fontSize: 12, minWidth: 32, textAlign: 'right' }}>
                          {totalSpent > 0 ? Math.round((d.value / totalSpent) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, background: '#242429', borderRadius: 16, border: '1px solid #3A3A44', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Per person avg</p>
                      <p style={{ color: '#FF4D00', fontSize: 18, fontWeight: 700, margin: '2px 0 0', fontFamily: "'Outfit', sans-serif" }}>
                        {sym}{members.length > 0 ? (totalSpent / members.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#5A5A6E', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Expenses</p>
                      <p style={{ color: '#EFEFEF', fontSize: 18, fontWeight: 700, margin: '2px 0 0', fontFamily: "'Outfit', sans-serif" }}>{expenses.length}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>💸</div>
                  <p style={{ color: '#5A5A6E', fontSize: 15 }}>No expenses yet.<br />Tap + to log your first expense.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* List tab */}
          {activeTab === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
                  <p style={{ color: '#5A5A6E', fontSize: 15 }}>No expenses logged yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...expenses].reverse().map(exp => (
                    <motion.div key={exp.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: '#242429', borderRadius: 14, border: '1px solid #3A3A44',
                        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, background: `${CAT_COLORS[exp.category] || '#8A8A9A'}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                      }}>
                        {CAT_EMOJI[exp.category] || '📦'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {exp.description || exp.category}
                        </p>
                        <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0' }}>
                          Paid by {exp.payerName} · {exp.date}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#FF4D00', fontSize: 16, fontWeight: 700, margin: 0 }}>{sym}{exp.amount.toFixed(2)}</p>
                          <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0' }}>{exp.category}</p>
                        </div>
                        <button onClick={() => removeExpense(exp.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <Trash2 size={12} color="#EF4444" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Balance tab — Splitwise style */}
          {activeTab === 'balance' && (
            <motion.div key="balance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Per-person summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Who's owed what</p>
                {members.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#5A5A6E', fontSize: 14 }}>No members yet</div>
                ) : (
                  members.map(member => {
                    const bal = balance[member.id] || 0
                    return (
                      <div key={member.id} style={{
                        background: '#242429', borderRadius: 14,
                        border: `1px solid ${bal > 0.01 ? 'rgba(34,197,94,0.2)' : bal < -0.01 ? 'rgba(239,68,68,0.2)' : '#3A3A44'}`,
                        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: '#2C2C33',
                          border: `2px solid ${member.role === 'owner' ? '#FF4D00' : '#3A3A44'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                        }}>
                          {member.role === 'owner' ? '👑' : '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 600, margin: 0 }}>{member.name}</p>
                          <p style={{ color: '#8A8A9A', fontSize: 12, margin: '2px 0 0', textTransform: 'capitalize' }}>{member.role}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, margin: 0, color: bal > 0.01 ? '#22C55E' : bal < -0.01 ? '#EF4444' : '#8A8A9A' }}>
                            {bal > 0.01 ? '+' : ''}{sym}{Math.abs(bal).toFixed(2)}
                          </p>
                          <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0' }}>
                            {bal > 0.01 ? 'gets back' : bal < -0.01 ? 'owes' : 'settled ✓'}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Settlement instructions */}
              {settlements.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ color: '#5A5A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Settlement plan</p>
                  {settlements.map((s, idx) => (
                    <motion.div key={`${s.fromId}-${s.toId}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                      style={{
                        background: 'rgba(255,77,0,0.06)', borderRadius: 16,
                        border: '1px solid rgba(255,77,0,0.2)', padding: '16px',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#EF4444', fontSize: 14, fontWeight: 700, margin: 0 }}>{s.fromName}</p>
                          <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0' }}>needs to pay</p>
                        </div>
                        <ArrowRight size={18} color="#FF4D00" />
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <p style={{ color: '#22C55E', fontSize: 14, fontWeight: 700, margin: 0 }}>{s.toName}</p>
                          <p style={{ color: '#5A5A6E', fontSize: 11, margin: '2px 0 0' }}>receives</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#FF4D00' }}>
                          {sym}{s.amount.toFixed(2)}
                        </span>
                        <button onClick={() => markSettled(s.fromId, s.toId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20,
                            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                            color: '#22C55E', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          }}>
                          <CheckCircle size={14} /> Settle Up
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {settlements.length === 0 && members.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(34,197,94,0.06)', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)', marginTop: 8 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: '#22C55E', margin: 0 }}>All Settled!</h3>
                  <p style={{ color: '#8A8A9A', fontSize: 13, margin: '6px 0 0' }}>Everyone's even — no debts to settle.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Set Budget Modal */}
      <AnimatePresence>
        {showBudget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowBudget(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>
                  Set Trip Budget
                </h3>
                <button onClick={() => setShowBudget(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#FF4D00', fontSize: 22, fontWeight: 700 }}>{sym}</span>
                <input className="input-base" type="number" placeholder="e.g. 2000" value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)} autoFocus
                  style={{ paddingLeft: 36, fontSize: 22, fontWeight: 700 }} />
              </div>
              <p style={{ color: '#5A5A6E', fontSize: 12, margin: '0 0 20px', lineHeight: 1.5 }}>
                Set a total budget cap for the trip. You'll see a live progress ring showing how much has been spent.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setBudgetInput(''); handleSaveBudget() }}
                  className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
                  Remove limit
                </button>
                <button className="btn-primary" onClick={handleSaveBudget} style={{ flex: 2 }}>
                  {budgetSaved ? '✓ Saved!' : 'Save Budget'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add expense modal */}
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
              style={{ width: '100%', background: '#242429', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid #3A3A44', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#EFEFEF', margin: 0 }}>Add Expense</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9A' }}><X size={20} /></button>
              </div>

              <div style={{ position: 'relative', marginBottom: 16 }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#FF4D00', fontSize: 22, fontWeight: 700 }}>{sym}</span>
                <input className="input-base" type="number" placeholder="0.00" value={form.amount} autoFocus
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  style={{ paddingLeft: 36, fontSize: 22, fontWeight: 700 }} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                    style={{
                      padding: '8px 14px', borderRadius: 20, border: `1px solid ${form.category === cat ? CAT_COLORS[cat] : '#3A3A44'}`,
                      background: form.category === cat ? `${CAT_COLORS[cat]}20` : '#2C2C33',
                      cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13,
                      color: form.category === cat ? CAT_COLORS[cat] : '#8A8A9A',
                      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                    }}>
                    {CAT_EMOJI[cat]} {cat}
                  </button>
                ))}
              </div>

              <input className="input-base" placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 12 }} />
              <input className="input-base" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ colorScheme: 'dark', marginBottom: 20 }} />

              <button className="btn-primary" onClick={handleAdd} disabled={!form.amount}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <TrendingUp size={18} /> Log Expense
                </span>
              </button>
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
          background: '#FF4D00', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40,
        }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
