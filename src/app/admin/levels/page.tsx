'use client'
import { useState, useEffect } from 'react'

interface Level { id: string; title: string; description: string | null; order: number; difficulty: string; status: string }

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Level | null>(null)
  const [form, setForm] = useState({ title: '', description: '', order: '0', difficulty: 'easy', status: 'active' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = () => {
    fetch('/api/admin/levels').then(r => r.json()).then(d => { setLevels(d.levels || []); setLoading(false) }).catch(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', order: String(levels.length + 1), difficulty: 'easy', status: 'active' }); setShowForm(true) }
  const openEdit = (l: Level) => { setEditing(l); setForm({ title: l.title, description: l.description || '', order: String(l.order), difficulty: l.difficulty, status: l.status }); setShowForm(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { id: editing.id, ...form, order: parseInt(form.order) } : { ...form, order: parseInt(form.order) }
    const res = await fetch('/api/admin/levels', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { load(); setShowForm(false) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this level? Tasks under it will be affected.')) return
    await fetch(`/api/admin/levels?id=${id}`, { method: 'DELETE' })
    load()
  }

  const diffColors: Record<string, string> = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">📶 Levels</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90">+ Add Level</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b"><h2 className="font-bold text-navy">{editing ? 'Edit Level' : 'New Level'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy/20" placeholder="e.g. Level 1: Very Easy" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No levels yet. Create one!</td></tr>
            ) : levels.map(level => (
              <tr key={level.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 font-mono">{level.order}</td>
                <td className="px-4 py-3 font-medium text-navy">{level.title}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${diffColors[level.difficulty] || 'bg-gray-100'}`}>{level.difficulty}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${level.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{level.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(level)} className="text-navy hover:underline text-xs mr-3">Edit</button>
                  <button onClick={() => handleDelete(level.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
