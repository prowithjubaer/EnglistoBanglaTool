'use client'
import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  siteName: 'Pro English BD',
  siteDescription: 'English to Bangla Translation Practice Tool',
  pointsPerCorrect: '10',
  xpPerTask: '5',
  streakBonusXp: '10',
  passingScore: '70',
  maxRetries: '3',
  dailyGoal: '5',
  enableBadges: 'true',
  enableStreak: 'true',
  enableLeaderboard: 'true',
  enableVocabulary: 'true',
  maintenanceMode: 'false',
  registrationOpen: 'true',
  defaultBatchId: '',
  scoringMode: 'self',
  feedbackDelay: '0',
  maxHomeworkPerDay: '3',
}

const SETTING_GROUPS = [
  {
    title: '🏢 সাইট সেটিংস',
    description: 'সাইটের নাম ও বর্ণনা',
    keys: ['siteName', 'siteDescription']
  },
  {
    title: '⭐ স্কোরিং সিস্টেম',
    description: 'পয়েন্ট, XP, এবং স্কোরিং কনফিগারেশন',
    keys: ['pointsPerCorrect', 'xpPerTask', 'streakBonusXp', 'passingScore', 'scoringMode']
  },
  {
    title: '🎮 গেমিফিকেশন',
    description: 'ব্যাজ, স্ট্রিক, লিডারবোর্ড সেটিংস',
    keys: ['enableBadges', 'enableStreak', 'enableLeaderboard', 'dailyGoal']
  },
  {
    title: '📝 টাস্ক সেটিংস',
    description: 'প্র্যাকটিস ও হোমওয়ার্ক কনফিগারেশন',
    keys: ['maxRetries', 'enableVocabulary', 'feedbackDelay', 'maxHomeworkPerDay']
  },
  {
    title: '🔒 সিস্টেম সেটিংস',
    description: 'রেজিস্ট্রেশন, মেইনটেনেন্স মোড',
    keys: ['registrationOpen', 'maintenanceMode', 'defaultBatchId']
  },
]

const LABELS: Record<string, string> = {
  siteName: 'সাইটের নাম',
  siteDescription: 'সাইটের বর্ণনা',
  pointsPerCorrect: 'প্রতি সঠিক উত্তরে পয়েন্ট',
  xpPerTask: 'প্রতি টাস্কে XP',
  streakBonusXp: 'স্ট্রিক বোনাস XP',
  passingScore: 'পাসিং স্কোর (%)',
  maxRetries: 'সর্বোচ্চ রিট্রাই',
  dailyGoal: 'দৈনিক লক্ষ্য (টাস্ক)',
  enableBadges: 'ব্যাজ সিস্টেম',
  enableStreak: 'স্ট্রিক সিস্টেম',
  enableLeaderboard: 'লিডারবোর্ড',
  enableVocabulary: 'ভোকাবুলারি ফিচার',
  maintenanceMode: 'মেইনটেনেন্স মোড',
  registrationOpen: 'রেজিস্ট্রেশন চালু',
  defaultBatchId: 'ডিফল্ট ব্যাচ ID',
  scoringMode: 'স্কোরিং মোড',
  feedbackDelay: 'ফিডব্যাক ডিলে (সেকেন্ড)',
  maxHomeworkPerDay: 'দৈনিক সর্বোচ্চ হোমওয়ার্ক',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { loadSettings() }, [])

  const loadSettings = () => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      const merged = { ...DEFAULT_SETTINGS, ...(d.settings || {}) }
      setSettings(merged)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'সেটিংস সেভ হয়েছে!' })
      } else {
        setMessage({ type: 'error', text: 'সেভ করতে সমস্যা হয়েছে' })
      }
    } catch { setMessage({ type: 'error', text: 'সার্ভার এরর' }) }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const isBooleanField = (key: string) => ['enableBadges', 'enableStreak', 'enableLeaderboard', 'enableVocabulary', 'maintenanceMode', 'registrationOpen'].includes(key)
  const isSelectField = (key: string) => key === 'scoringMode'

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">⚙️ Settings</h1>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 disabled:opacity-50 flex items-center gap-2">
          {saving ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {SETTING_GROUPS.map(group => (
        <div key={group.title} className="bg-white rounded-xl shadow-sm border border-gray-border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-navy">{group.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
          </div>
          <div className="p-6 space-y-4">
            {group.keys.map(key => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 sm:w-48 shrink-0">{LABELS[key] || key}</label>
                <div className="flex-1">
                  {isBooleanField(key) ? (
                    <button
                      onClick={() => handleChange(key, settings[key] === 'true' ? 'false' : 'true')}
                      className={`relative w-14 h-7 rounded-full transition-colors ${settings[key] === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings[key] === 'true' ? 'left-7' : 'left-0.5'}`} />
                    </button>
                  ) : isSelectField(key) ? (
                    <select value={settings[key] || ''} onChange={e => handleChange(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy">
                      <option value="self">Self Assessment</option>
                      <option value="auto">Auto Scoring</option>
                      <option value="teacher">Teacher Review</option>
                    </select>
                  ) : (
                    <input
                      type={['pointsPerCorrect', 'xpPerTask', 'streakBonusXp', 'passingScore', 'maxRetries', 'dailyGoal', 'feedbackDelay', 'maxHomeworkPerDay'].includes(key) ? 'number' : 'text'}
                      value={settings[key] || ''}
                      onChange={e => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy"
                      placeholder={LABELS[key]}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 disabled:opacity-50">
          {saving ? '⏳ Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  )
}
