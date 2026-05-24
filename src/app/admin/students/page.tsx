'use client'
import { useState, useEffect } from 'react'

interface Student { id: string; name: string; email: string; status: string; batch: string | null; batchId: string | null; lastLogin: string | null; createdAt: string; stats: { totalCompleted: number; averageScore: number; totalPoints: number; currentStreak: number } | null }
interface Batch { id: string; name: string }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', batchId: '', status: 'active' })
  const [batchForm, setBatchForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load(); loadBatches() }, [])

  const load = () => { fetch('/api/admin/students').then(r => r.json()).then(d => { setStudents(d.students || []); setLoading(false) }).catch(() => setLoading(false)) }
  const loadBatches = () => { fetch('/api/admin/batches').then(r => r.json()).then(d => setBatches(d.batches || [])) }

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', batchId: '', status: 'active' }); setShowForm(true) }
  const openEdit = (s: Student) => { setEditing(s); setForm({ name: s.name, email: s.email, password: '', batchId: s.batchId || '', status: s.status }); setShowForm(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body: any = editing ? { id: editing.id, name: form.name, email: form.email, status: form.status, batchId: form.batchId || null } : { ...form, batchId: form.batchId || null }
    if (form.password) body.password = form.password
    const res = await fetch('/api/admin/students', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { load(); setShowForm(false) } else { const d = await res.json(); alert(d.error || 'Error') }
    setSaving(false)
  }

  const toggleStatus = async (s: Student) => {
    const newStatus = s.status === 'active' ? 'inactive' : 'active'
    await fetch('/api/admin/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, status: newStatus }) })
    load()
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(batchForm) })
    loadBatches(); setShowBatchForm(false); setBatchForm({ name: '', description: '' })
  }

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-navy">👥 Students</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowBatchForm(true)} className="px-4 py-2 bg-white border border-navy text-navy rounded-lg text-sm font-medium hover:bg-navy/5">+ Batch</button>
          <button onClick={openCreate} className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90">+ Add Student</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="px-3 py-2 border rounded-lg text-sm w-64" />
        <div className="text-sm text-gray-500 flex items-center">Total: {students.length} | Active: {students.filter(s => s.status === 'active').length}</div>
      </div>

      {/* Batch form modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b"><h2 className="font-bold text-navy">New Batch</h2></div>
            <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label><input value={batchForm.name} onChange={e => setBatchForm({ ...batchForm, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Batch 2025 A" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input value={batchForm.description} onChange={e => setBatchForm({ ...batchForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowBatchForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Student form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b"><h2 className="font-bold text-navy">{editing ? 'Edit Student' : 'New Student'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password {editing ? '(leave empty to keep)' : '*'}</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">No Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Batch</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Stats</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No students found</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.email}</td>
                <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">{s.batch || <span className="text-gray-400">-</span>}</td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">
                  {s.stats ? <span className="text-gray-600">{s.stats.totalCompleted} done • {s.stats.averageScore}% avg • {s.stats.totalPoints} pts</span> : <span className="text-gray-400">No activity</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(s)} className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(s)} className="text-navy hover:underline text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
