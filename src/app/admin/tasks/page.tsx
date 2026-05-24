'use client'
import { useState, useEffect } from 'react'

interface Task { id: string; englishText: string; banglaTranslation: string; levelId: string; categoryId: string; difficulty: string; status: string; explanation?: string; grammarNote?: string; importantPhraseNote?: string; estimatedTime?: number; level: { title: string }; category: { name: string }; vocabulary: { id: string; wordOrPhrase: string; banglaMeaning: string; example?: string }[] }
interface Level { id: string; title: string }
interface Category { id: string; name: string }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const emptyForm = { englishText: '', banglaTranslation: '', levelId: '', categoryId: '', difficulty: 'easy', status: 'published', explanation: '', grammarNote: '', importantPhraseNote: '', estimatedTime: '', vocabulary: [{ wordOrPhrase: '', banglaMeaning: '', example: '' }] }
  const [form, setForm] = useState<any>(emptyForm)

  useEffect(() => { loadMeta() }, [])
  useEffect(() => { load() }, [page, filterLevel, filterCategory, search])

  const loadMeta = () => {
    fetch('/api/admin/levels').then(r => r.json()).then(d => setLevels(d.levels || []))
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }

  const load = () => {
    const params = new URLSearchParams({ page: String(page), limit: '15' })
    if (filterLevel) params.set('levelId', filterLevel)
    if (filterCategory) params.set('categoryId', filterCategory)
    if (search) params.set('search', search)
    fetch(`/api/admin/tasks?${params}`).then(r => r.json()).then(d => { setTasks(d.tasks || []); setTotalPages(d.totalPages || 1); setLoading(false) }).catch(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, levelId: levels[0]?.id || '', categoryId: categories[0]?.id || '' }); setShowForm(true) }
  const openEdit = (t: Task) => {
    setEditing(t)
    setForm({
      englishText: t.englishText, banglaTranslation: t.banglaTranslation, levelId: t.levelId, categoryId: t.categoryId,
      difficulty: t.difficulty, status: t.status, explanation: t.explanation || '', grammarNote: t.grammarNote || '',
      importantPhraseNote: t.importantPhraseNote || '', estimatedTime: t.estimatedTime ? String(t.estimatedTime) : '',
      vocabulary: t.vocabulary?.length > 0 ? t.vocabulary.map(v => ({ wordOrPhrase: v.wordOrPhrase, banglaMeaning: v.banglaMeaning, example: v.example || '' })) : [{ wordOrPhrase: '', banglaMeaning: '', example: '' }]
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const vocabFiltered = form.vocabulary.filter((v: any) => v.wordOrPhrase.trim())
    const body = editing
      ? { id: editing.id, ...form, estimatedTime: form.estimatedTime || null, vocabulary: vocabFiltered }
      : { ...form, estimatedTime: form.estimatedTime || null, vocabulary: vocabFiltered }
    const res = await fetch('/api/admin/tasks', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { load(); setShowForm(false) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task permanently?')) return
    await fetch(`/api/admin/tasks?id=${id}`, { method: 'DELETE' })
    load()
  }

  const addVocab = () => setForm({ ...form, vocabulary: [...form.vocabulary, { wordOrPhrase: '', banglaMeaning: '', example: '' }] })
  const removeVocab = (i: number) => setForm({ ...form, vocabulary: form.vocabulary.filter((_: any, idx: number) => idx !== i) })
  const updateVocab = (i: number, field: string, value: string) => {
    const vocab = [...form.vocabulary]; vocab[i] = { ...vocab[i], [field]: value }; setForm({ ...form, vocabulary: vocab })
  }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-navy">📝 Tasks</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90">+ Add Task</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search English text..." className="px-3 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-navy/20" />
        <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Levels</option>
          {levels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1) }} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-navy">{editing ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Text *</label>
                <textarea value={form.englishText} onChange={e => setForm({ ...form, englishText: e.target.value })} required rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="I eat rice every day." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bangla Translation *</label>
                <textarea value={form.banglaTranslation} onChange={e => setForm({ ...form, banglaTranslation: e.target.value })} required rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="আমি প্রতিদিন ভাত খাই।" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                  <select value={form.levelId} onChange={e => setForm({ ...form, levelId: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select level</option>
                    {levels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="published">Published</option><option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Time (min)</label>
                  <input type="number" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Sentence breakdown explanation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grammar Note</label>
                  <textarea value={form.grammarNote} onChange={e => setForm({ ...form, grammarNote: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Important Phrase Note</label>
                  <textarea value={form.importantPhraseNote} onChange={e => setForm({ ...form, importantPhraseNote: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              {/* Vocabulary */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Vocabulary</label>
                  <button type="button" onClick={addVocab} className="text-xs px-3 py-1 bg-navy/10 text-navy rounded hover:bg-navy/20">+ Add Word</button>
                </div>
                {form.vocabulary.map((v: any, i: number) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2">
                    <input value={v.wordOrPhrase} onChange={e => updateVocab(i, 'wordOrPhrase', e.target.value)} placeholder="Word/Phrase" className="px-2 py-1.5 border rounded text-xs" />
                    <input value={v.banglaMeaning} onChange={e => updateVocab(i, 'banglaMeaning', e.target.value)} placeholder="Bangla Meaning" className="px-2 py-1.5 border rounded text-xs" />
                    <input value={v.example} onChange={e => updateVocab(i, 'example', e.target.value)} placeholder="Example" className="px-2 py-1.5 border rounded text-xs" />
                    <button type="button" onClick={() => removeVocab(i)} className="text-red-500 text-xs px-2 hover:bg-red-50 rounded">✕</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">English Text</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Level</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No tasks found</td></tr>
            ) : tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy max-w-[250px] truncate">{task.englishText}</td>
                <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">{task.level?.title}</td>
                <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">{task.category?.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${task.difficulty === 'easy' ? 'bg-green-100 text-green-700' : task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{task.difficulty}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${task.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{task.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(task)} className="text-navy hover:underline text-xs mr-3">Edit</button>
                  <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  )
}
