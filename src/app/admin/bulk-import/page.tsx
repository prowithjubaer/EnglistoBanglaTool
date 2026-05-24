'use client'
import { useState, useRef } from 'react'

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[]; total: number } | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]) }

  const handleImport = async () => {
    if (!file) return
    setImporting(true); setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/bulk-import', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) { setResult(data); setFile(null) }
      else { setResult({ imported: 0, errors: [data.error || 'Upload failed'], total: 0 }) }
    } catch { setResult({ imported: 0, errors: ['Network error'], total: 0 }) }
    setImporting(false)
  }

  const downloadTemplate = () => { window.open('/api/admin/bulk-import', '_blank') }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">📤 Bulk Import</h1>
        <button onClick={downloadTemplate} className="px-4 py-2 bg-white border border-navy text-navy rounded-lg text-sm font-medium hover:bg-navy/5">📥 Download Template</button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-bold text-blue-800 mb-2">📋 Import Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1.5">
          <li>1. Download the Excel template using the button above</li>
          <li>2. Fill in your tasks following the template format</li>
          <li>3. Required columns: <strong>English Text</strong>, <strong>Correct Bangla Translation</strong></li>
          <li>4. Optional: Level, Category, Difficulty, Vocabulary Words, Grammar Note, etc.</li>
          <li>5. Level and Category names must match existing ones (case-insensitive)</li>
          <li>6. Vocabulary: Comma-separated words in "Vocabulary Words" column, matching meanings in "Vocabulary Bangla Meanings"</li>
          <li>7. Upload your .xlsx or .csv file below</li>
        </ul>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${dragActive ? 'border-navy bg-navy/5' : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-navy/50 hover:bg-gray-50'}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        {file ? (
          <div>
            <div className="text-4xl mb-3">📄</div>
            <p className="font-medium text-navy">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <button onClick={() => setFile(null)} className="mt-3 text-xs text-red-500 hover:underline">Remove</button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-3">📁</div>
            <p className="font-medium text-gray-700">Drag & drop your spreadsheet here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            <button onClick={() => fileRef.current?.click()} className="mt-4 px-4 py-2 bg-navy text-white rounded-lg text-sm hover:bg-navy/90">Choose File</button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]) }} />
      </div>

      {/* Import Button */}
      {file && (
        <button onClick={handleImport} disabled={importing} className="w-full py-3 bg-navy text-white rounded-xl font-medium text-lg hover:bg-navy/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {importing ? <><span className="animate-spin">⏳</span> Importing...</> : <><span>🚀</span> Import Tasks</>}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-bold text-navy">📊 Import Results</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{result.total}</div>
                <div className="text-xs text-blue-600">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{result.imported}</div>
                <div className="text-xs text-green-600">Imported</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{result.errors.length}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-700 mb-2">Errors:</h4>
                <div className="max-h-48 overflow-y-auto bg-red-50 rounded-lg p-3 space-y-1">
                  {result.errors.map((err, i) => <p key={i} className="text-xs text-red-600">{err}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supported Format */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-border p-5">
        <h3 className="font-bold text-navy mb-3">📋 Required Columns in Spreadsheet</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Column Name</th>
                <th className="text-left px-3 py-2 font-medium">Required</th>
                <th className="text-left px-3 py-2 font-medium">Example</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['English Text', 'Yes', 'I eat rice.'],
                ['Correct Bangla Translation', 'Yes', 'আমি ভাত খাই।'],
                ['Level', 'No (uses first)', 'Level 1: Very Easy Sentences'],
                ['Category', 'No (uses first)', 'Daily Life English'],
                ['Difficulty', 'No (easy)', 'easy / medium / hard'],
                ['Vocabulary Words', 'No', 'eat,rice (comma separated)'],
                ['Vocabulary Bangla Meanings', 'No', 'খাওয়া,ভাত'],
                ['Explanation', 'No', 'Simple present tense structure'],
                ['Grammar Note', 'No', 'Subject + Verb + Object'],
                ['Important Phrase Note', 'No', '"eat rice" = ভাত খাওয়া'],
                ['Estimated Time', 'No', '2 (minutes)'],
                ['Status', 'No (published)', 'published / draft'],
              ].map(([col, req, ex]) => (
                <tr key={col} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium text-navy">{col}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${req === 'Yes' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{req}</span></td>
                  <td className="px-3 py-2 text-gray-600">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
