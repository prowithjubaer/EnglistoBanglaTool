'use client'
import { useState, useEffect } from 'react'

interface Homework { id: string; title: string; description: string | null; assignedType: string; status: string; deadline: string | null; passingAverageScore: number; createdAt: string; tasks: { id: string; task: { englishText: string } }[]; assignments: any[] }
interface Task { id: string; englishText: string; level: { title: string } }
interface Batch { id: string; name: string }

export default function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Homework | null>(null)
  const [form, setForm] = useState({ title: '', description: '', assignedType: 'all', batchId: '', deadline: '', passingAverageScore: '70', status: 'draft', taskIds: [] as string[] })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load(); loadMeta() }, [])

  const load = () => { fetch('/api/admin/homework').then(r => r.json()).then(d => { setHomework(d.homework || []); setLoading(false) }).catch(() => setLoading(false)) }
  const loadMeta = () => {
    fetch('/api/admin/tasks?limit=100').then(r => r.json()).then(d => setTasks(d.tasks || []))
    fetch('/api/admin/batches').then(r => r.json()).then(d => setBatches(d.batches || []))
  }

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', assignedType: 'all', batchId: '', deadline: '', passingAverageScore: '70', status: 'draft', taskIds: [] }); setShowForm(true) }
  const openEdit = (hw: Homework) => {
    setEditing(hw)
    setForm({
      title: hw.title, description: hw.description || '', assignedType: hw.assignedType,
      batchId: '', deadline: hw.deadline ? hw.deadline.split('T')[0] : '',
      passingAverageScore: String(hw.passingAverageScore), status: hw.status,
      taskIds: hw.tasks.map(t => t.task ? (t as any).taskId || '' : '').filter(Boolean)
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body: any = editing
      ? { id: editing.id, title: form.title, description: form.description, status: form.status, deadline: form.deadline || null, passingAverageScore: parseInt(form.passingAverageScore) }
      : { ...form, passingAverageScore: parseInt(form.passingAverageScore), deadline: form.deadline || null }
    const res = await fetch('/api/admin/homework', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { load(); setShowForm(false) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this homework?')) return
    await fetch(`/api/admin/homework?id=${id}`, { method: 'DELETE' })
    load()
  }

  const publish = async (hw: Homework) => {
    await fetch('/api/admin/homework', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: hw.id, status: 'published' }) })
    load()
  }

  const toggleTask = (taskId: string) => {
    setForm(prev => ({ ...prev, taskIds: prev.taskIds.includes(taskId) ? prev.taskIds.filter(id => id !== taskId) : [...prev.taskIds, taskId] }))
  }

  const statusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', published: 'bg-green-100 text-green-700', closed: 'bg-red-100 text-red-700' }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">📋 Homework</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90">+ Create Homework</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-navy">{editing ? 'Edit Homework' : 'New Homework'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Week 1 Homework" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select value={form.assignedType} onChange={e => setForm({ ...form, assignedType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="all">All Students</option><option value="batch">Specific Batch</option>
                  </select>
                </div>
                {form.assignedType === 'batch' && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">Select batch</option>{batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label><input type="number" value={form.passingAverageScore} onChange={e => setForm({ ...form, passingAverageScore: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {!editing && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Tasks ({form.taskIds.length} selected)</label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {tasks.map(t => (
                      <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input type="checkbox" checked={form.taskIds.includes(t.id)} onChange={() => toggleTask(t.id)} className="rounded" />
                        <span className="text-xs text-gray-700 truncate">{t.englishText}</span>
                        <span className="text-xs text-gray-400 ml-auto shrink-0">{t.level?.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Homework list */}
      <div className="space-y-3">
        {homework.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-border"><p className="text-gray-500">No homework created yet</p></div>
        ) : homework.map(hw => (
          <div key={hw.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-navy">{hw.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[hw.status] || statusColors.draft}`}>{hw.status}</span>
                </div>
                {hw.description && <p className="text-sm text-gray-600 mb-2">{hw.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>📝 {hw.tasks.length} tasks</span>
                  <span>👥 {hw.assignedType === 'all' ? 'All' : 'Batch'}</span>
                  {hw.deadline && <span>⏰ {new Date(hw.deadline).toLocaleDateString()}</span>}
                  <span>✅ Pass: {hw.passingAverageScore}%</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {hw.status === 'draft' && <button onClick={() => publish(hw)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600">Publish</button>}
                <button onClick={() => openEdit(hw)} className="px-3 py-1.5 border rounded-lg text-xs text-navy hover:bg-gray-50">Edit</button>
                <button onClick={() => handleDelete(hw.id)} className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
