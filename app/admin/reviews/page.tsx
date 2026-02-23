'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Star, CheckCircle, XCircle, Trash2, ArrowLeft,
  Loader2, MessageSquare, ThumbsUp, ThumbsDown, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getReviews, approveReview, deleteReview, type ReviewRecord } from '@/lib/firebase-auth'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await getReviews(false)
      setReviews(data)
    } catch (err) {
      console.error('Failed to load reviews:', err)
    }
    setLoading(false)
  }

  useEffect(() => { loadReviews() }, [])

  const handleApprove = async (id: string, approved: boolean) => {
    setActionLoading(id)
    try {
      await approveReview(id, approved)
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved } : r))
    } catch (err) {
      console.error('Failed to update review:', err)
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return
    setActionLoading(id)
    try {
      await deleteReview(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete review:', err)
    }
    setActionLoading(null)
  }

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  const pendingCount = reviews.filter(r => !r.approved).length
  const approvedCount = reviews.filter(r => r.approved).length

  return (
    <div className="min-h-screen bg-dark-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-2 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-display font-bold text-dark-900">Review Management</h1>
            <p className="text-dark-500 mt-1">Approve, reject, or delete customer reviews</p>
          </div>
          <button onClick={loadReviews} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dark-200 text-dark-700 hover:bg-dark-50">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-dark-100 text-center">
            <p className="text-2xl font-bold text-dark-900">{reviews.length}</p>
            <p className="text-sm text-dark-500">Total Reviews</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
            <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
            <p className="text-sm text-yellow-600">Pending Approval</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
            <p className="text-sm text-green-600">Approved</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                filter === f
                  ? "bg-primary-800 text-white"
                  : "bg-white border border-dark-200 text-dark-600 hover:bg-dark-50"
              )}
            >
              {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Review List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dark-100">
            <MessageSquare className="w-12 h-12 text-dark-300 mx-auto mb-3" />
            <p className="text-dark-500">No {filter !== 'all' ? filter : ''} reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(review => (
              <div key={review.id} className={cn(
                "bg-white rounded-xl p-6 border",
                review.approved ? "border-green-200" : "border-yellow-200"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-dark-900">{review.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        review.approved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}>
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-dark-500">{review.email} · {review.location} · {review.service}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("w-4 h-4", s <= review.rating ? "text-yellow-400 fill-current" : "text-dark-200")} />
                    ))}
                  </div>
                </div>

                <p className="text-dark-700 leading-relaxed mb-4">{review.text}</p>

                <div className="flex items-center gap-2">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id!, true)}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                      Approve
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleApprove(review.id!, false)}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id!)}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
