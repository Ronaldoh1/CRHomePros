'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Camera, MapPin, Clock, Save, ArrowLeft, Plus, X, CheckCircle, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICES } from '@/lib/constants'
import { saveFieldNote, getFieldNotes, deleteFieldNote, type FieldNoteRecord } from '@/lib/firebase-auth'

const emptyForm = {
  projectName: '', clientName: '', address: '', serviceType: '',
  notes: '', measurements: '', materialsNeeded: '', estimatedCost: '', nextSteps: '',
}

export default function FieldNotesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [notes, setNotes] = useState<FieldNoteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(emptyForm)

  const loadNotes = async () => {
    setLoading(true)
    try { setNotes(await getFieldNotes()) } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { loadNotes() }, [])

  const handlePhotoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'; input.multiple = true
    input.onchange = (e: any) => {
      Array.from(e.target.files || []).forEach((file: any) => {
        const reader = new FileReader()
        reader.onload = () => setPhotos(prev => [...prev, reader.result as string])
        reader.readAsDataURL(file)
      })
    }
    input.click()
  }

  const handleSave = async () => {
    if (!formData.projectName || !formData.clientName || !formData.notes) return
    setIsSaving(true)
    try {
      await saveFieldNote({ ...formData, photos, status: 'complete' })
      setSaveSuccess(true); setFormData(emptyForm); setPhotos([])
      setTimeout(() => { setSaveSuccess(false); setIsCreating(false); loadNotes() }, 2000)
    } catch (err) { console.error(err); alert('Failed to save.') }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this field note?')) return
    try { await deleteFieldNote(id); setNotes(prev => prev.filter(n => n.id !== id)) } catch (err) { console.error(err) }
  }

  if (saveSuccess) return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dark-900 mb-2">Note Saved!</h2>
        <p className="text-dark-500">Your field note has been saved to Firebase.</p>
      </div>
    </div>
  )

  if (isCreating) return (
    <div className="min-h-screen bg-dark-50">
      <header className="bg-white border-b border-dark-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setIsCreating(false)} className="p-2"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="font-display font-bold">New Field Note</h1>
          <button onClick={handleSave} disabled={isSaving} className="text-primary-600 font-medium">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-dark-900">Project Info</h2>
          <input type="text" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} placeholder="Project Name *" className="input" />
          <input type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} placeholder="Client Name *" className="input" />
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Address *" className="input pl-10" />
          </div>
          <select value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} className="input">
            <option value="">Select Service Type</option>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-xl p-4">
          <h2 className="font-semibold text-dark-900 mb-4">Photos</h2>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-dark-200">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setPhotos(photos.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={handlePhotoUpload} className="aspect-square border-2 border-dashed border-dark-200 rounded-lg flex flex-col items-center justify-center text-dark-400 hover:border-primary-500 hover:text-primary-500">
              <Camera className="w-8 h-8 mb-1" /><span className="text-xs">Add Photo</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-dark-900">Notes & Details</h2>
          <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={4} placeholder="Site Notes *" className="textarea" />
          <textarea value={formData.measurements} onChange={(e) => setFormData({...formData, measurements: e.target.value})} rows={2} placeholder="Measurements" className="textarea" />
          <textarea value={formData.materialsNeeded} onChange={(e) => setFormData({...formData, materialsNeeded: e.target.value})} rows={2} placeholder="Materials Needed" className="textarea" />
        </div>
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-dark-900">Estimate</h2>
          <input type="text" value={formData.estimatedCost} onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})} placeholder="Estimated Cost (e.g., $15,000 - $20,000)" className="input" />
          <textarea value={formData.nextSteps} onChange={(e) => setFormData({...formData, nextSteps: e.target.value})} rows={2} placeholder="Next Steps" className="textarea" />
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-gold w-full btn-lg">
          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Field Note</>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-50">
      <header className="bg-white border-b border-dark-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2"><ArrowLeft className="w-6 h-6" /></Link>
            <div>
              <h1 className="text-xl font-display font-bold">Field Notes</h1>
              <p className="text-sm text-dark-500">Job site documentation</p>
            </div>
          </div>
          <button onClick={() => setIsCreating(true)} className="btn-gold"><Plus className="w-5 h-5" /> New</button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dark-100">
            <FileText className="w-12 h-12 text-dark-300 mx-auto mb-3" />
            <p className="text-dark-500">No field notes yet</p>
            <button onClick={() => setIsCreating(true)} className="btn-gold mt-4"><Plus className="w-5 h-5" /> Create First Note</button>
          </div>
        ) : notes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl border border-dark-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-dark-900">{note.projectName}</h3>
                <p className="text-sm text-dark-500">{note.clientName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', note.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                  {note.status === 'complete' ? 'Complete' : 'Draft'}
                </span>
                <button onClick={() => handleDelete(note.id!)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-500 mb-3">
              {note.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{note.address}</span>}
            </div>
            <p className="text-dark-600 text-sm mb-3">{note.notes}</p>
            {note.photos && note.photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {note.photos.slice(0, 4).map((p, i) => (
                  <img key={i} src={p} alt="" className="aspect-square object-cover rounded-lg" />
                ))}
              </div>
            )}
            {note.estimatedCost && (
              <div className="bg-green-50 rounded-lg px-3 py-2 text-sm">
                <span className="text-green-600">Estimate:</span> <span className="font-medium text-green-700">{note.estimatedCost}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
