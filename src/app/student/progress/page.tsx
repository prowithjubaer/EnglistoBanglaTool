'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProgressPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'levels' | 'categories' | 'homework'>('overview')

  useEffect(() => {
    fetch('/api/student/progress')
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-500 bangla-text text-lg">ডেটা লোড করতে সমস্যা হয়েছে</p>
      <button onClick={() => { setError(false); fetch('/api/student/progress').then(r=>r.json()).then(setData).catch(()=>setError(true)) }} className="mt-4 px-4 py-2 bg-navy text-white rounded-lg text-sm bangla-text">আবার চেষ্টা করুন</button>
    </div>
  )

  if (!data) return (
    <div className="text-center py-16">
      <div className="animate-spin text-4xl mb-3">⏳</div>
      <p className="text-gray-500 bangla-text">লোড হচ্ছে...</p>
    </div>
  )

  const { stats, levelProgress, categoryProgress, homeworkProgress, recentActivity, badges, savedVocabCount, weakItems, totalSubmissions } = data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy bangla-text">📊 আমার প্রগ্রেস</h1>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="✅" label="সম্পন্ন" value={stats.totalCompleted} />
        <StatCard icon="📝" label="মোট সাবমিশন" value={totalSubmissions} />
        <StatCard icon="⭐" label="গড় স্কোর" value={`${Math.round(stats.averageScore)}%`} />
        <StatCard icon="🔥" label="স্ট্রিক" value={`${stats.currentStreak} দিন`} />
        <StatCard icon="💎" label="পয়েন্ট" value={stats.totalPoints} />
        <StatCard icon="⚡" label="XP" value={stats.totalXp} />
        <StatCard icon="🏆" label="ব্যাজ" value={badges?.length || 0} />
        <StatCard icon="📖" label="সেভড শব্দ" value={savedVocabCount} />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {[
          { key: 'overview', label: 'সারসংক্ষেপ' },
          { key: 'levels', label: 'লেভেল' },
          { key: 'categories', label: 'ক্যাটেগরি' },
          { key: 'homework', label: 'হোমওয়ার্ক' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-medium bangla-text transition-all ${activeTab === tab.key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Weak Areas */}
          {weakItems && weakItems.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-border">
              <h2 className="text-lg font-bold text-navy bangla-text mb-3">⚠️ দুর্বল জায়গা</h2>
              <p className="text-xs text-gray-500 bangla-text mb-3">এই টাস্কগুলোতে স্কোর কম, আবার প্র্যাকটিস করুন</p>
              <div className="space-y-2">
                {weakItems.map((item: any) => (
                  <div key={item.taskId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.englishText}</p>
                      <p className="text-xs text-gray-500 bangla-text">{item.levelTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">{item.selfScore}%</span>
                      <Link href={`/student/practice?taskId=${item.taskId}`} className="text-xs px-2 py-1 bg-navy text-white rounded bangla-text hover:bg-navy/90">আবার করুন</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-border">
              <h2 className="text-lg font-bold text-navy bangla-text mb-3">🕐 সাম্প্রতিক কার্যকলাপ</h2>
              <div className="space-y-2">
                {recentActivity.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.taskTitle}</p>
                      <p className="text-xs text-gray-500">{item.levelTitle} • {item.categoryName}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {item.selfScore !== null && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.selfScore >= 70 ? 'bg-green-100 text-green-700' : item.selfScore >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {item.selfScore}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">+{item.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-border">
              <h2 className="text-lg font-bold text-navy bangla-text mb-3">🏆 অর্জিত ব্যাজ</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map((badge: any) => (
                  <div key={badge.id} className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <p className="text-sm font-bold text-gray-800 bangla-text">{badge.name}</p>
                    <p className="text-xs text-gray-500 bangla-text mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalSubmissions === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-border">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500 bangla-text text-lg">এখনো কোনো প্রগ্রেস নেই</p>
              <p className="text-gray-400 bangla-text text-sm mt-2">প্র্যাকটিস বা হোমওয়ার্ক শুরু করুন!</p>
              <Link href="/student/practice" className="mt-4 inline-block px-6 py-2 bg-navy text-white rounded-lg text-sm bangla-text hover:bg-navy/90">প্র্যাকটিস শুরু করুন</Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'levels' && (
        <div className="space-y-3">
          {levelProgress && levelProgress.length > 0 ? levelProgress.map((level: any) => (
            <div key={level.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-navy text-sm bangla-text">{level.title}</h3>
                  <p className="text-xs text-gray-500 bangla-text">
                    {level.completedTasks}/{level.totalTasks} টাস্ক সম্পন্ন • গড় স্কোর: {level.avgScore}%
                  </p>
                </div>
                <DifficultyBadge difficulty={level.difficulty} />
              </div>
              <ProgressBar percentage={level.percentage} />
            </div>
          )) : (
            <EmptyState message="কোনো লেভেল পাওয়া যায়নি" />
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-3">
          {categoryProgress && categoryProgress.length > 0 ? categoryProgress.map((cat: any) => (
            <div key={cat.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-navy text-sm bangla-text">{cat.name}</h3>
                  <p className="text-xs text-gray-500 bangla-text">
                    {cat.completedTasks}/{cat.totalTasks} টাস্ক সম্পন্ন • গড় স্কোর: {cat.avgScore}%
                  </p>
                </div>
                <span className="text-sm font-bold text-navy">{cat.percentage}%</span>
              </div>
              <ProgressBar percentage={cat.percentage} />
            </div>
          )) : (
            <EmptyState message="কোনো ক্যাটেগরি পাওয়া যায়নি" />
          )}
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="space-y-3">
          {homeworkProgress && homeworkProgress.length > 0 ? homeworkProgress.map((hw: any) => (
            <div key={hw.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-navy text-sm bangla-text">{hw.title}</h3>
                  <p className="text-xs text-gray-500 bangla-text">
                    {hw.completedTasks}/{hw.totalTasks} টাস্ক • গড় স্কোর: {hw.avgScore}%
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium bangla-text ${hw.passed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {hw.passed ? '✅ পাস' : '⏳ চলছে'}
                </span>
              </div>
              <ProgressBar percentage={hw.percentage} color={hw.passed ? 'green' : 'orange'} />
            </div>
          )) : (
            <EmptyState message="কোনো হোমওয়ার্ক সাবমিশন নেই" />
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-border text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-navy">{value}</div>
      <div className="text-xs text-gray-500 bangla-text">{label}</div>
    </div>
  )
}

function ProgressBar({ percentage, color = 'blue' }: { percentage: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-navy',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${colors[color] || colors.blue}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = {
    easy: 'সহজ',
    medium: 'মাঝারি',
    hard: 'কঠিন',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium bangla-text ${styles[difficulty] || styles.easy}`}>
      {labels[difficulty] || difficulty}
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-border">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-gray-500 bangla-text">{message}</p>
    </div>
  )
}
