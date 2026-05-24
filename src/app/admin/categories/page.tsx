'use client'
import { useState, useEffect } from 'react'

interface Category { id: string; name: string; description: string | null; status: string; createdAt: string }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = () => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => { setCategories(d.categories || []); setLoading(false) }).catch(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', status: 'active' }); setShowForm(true) }
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', status: cat.status }); setShowForm(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { id: editing.id, ...form } : form
    const res = await fetch('/api/admin/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { load(); setShowForm(false) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Tasks under it may be affected.')) return
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">📁 Categories</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90">+ Add Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b"><h2 className="font-bold text-navy">{editing ? 'Edit Category' : 'New Category'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy/20" placeholder="e.g. Daily Life English" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy/20" placeholder="Optional description" />
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">No categories yet. Create one!</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{cat.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{cat.description || '-'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{cat.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(cat)} className="text-navy hover:underline text-xs mr-3">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
