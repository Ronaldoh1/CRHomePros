'use client'

import Link from 'next/link'
import {
  Users, Briefcase, Star, FileText, ClipboardList, DollarSign,
  Phone, ArrowRight, AlertCircle, Receipt, FileSignature, FilePlus
} from 'lucide-react'

const stats = [
  { label: 'Active Leads', value: '—', change: 'View leads', icon: Users, color: 'text-blue-400 bg-blue-500/20' },
  { label: 'Active Projects', value: '—', change: 'View projects', icon: Briefcase, color: 'text-green-400 bg-green-500/20' },
  { label: 'Pending Reviews', value: '—', change: 'Check reviews', icon: Star, color: 'text-yellow-400 bg-yellow-500/20' },
  { label: 'Documents', value: '—', change: 'View all', icon: FileSignature, color: 'text-purple-400 bg-purple-500/20' },
]

const quickActions = [
  { label: 'Create Invoice', href: '/admin/invoices', icon: Receipt, desc: 'Generate & send invoices', color: 'from-blue-600 to-blue-700' },
  { label: 'Create Change Order', href: '/admin/change-orders', icon: ClipboardList, desc: 'Document additional work', color: 'from-purple-600 to-purple-700' },
  { label: 'Create Contract', href: '/admin/contracts', icon: Briefcase, desc: 'Scope of work agreements', color: 'from-green-600 to-green-700' },
  { label: 'Signed Documents', href: '/admin/documents', icon: FileSignature, desc: 'Upload & view signed docs', color: 'from-amber-600 to-amber-700' },
  { label: 'Manage Leads', href: '/admin/leads', icon: Users, desc: 'View & respond to leads', color: 'from-cyan-600 to-cyan-700' },
  { label: 'Field Notes', href: '/admin/field-notes', icon: FilePlus, desc: 'On-site project notes', color: 'from-slate-600 to-slate-700' },
]

const sentLinks = [
  { label: 'Sent Invoices', href: '/admin/invoices/sent', icon: Receipt },
  { label: 'Sent Change Orders', href: '/admin/change-orders/sent', icon: ClipboardList },
  { label: 'Sent Contracts', href: '/admin/contracts/sent', icon: Briefcase },
]

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, Carlos!</h1>
        <p className="text-slate-400 mt-1">Here&apos;s your admin dashboard. Create documents, manage leads, and track your business.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-semibold text-white mb-4 text-lg">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/15 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Sent Documents */}
      <div className="mb-8">
        <h2 className="font-semibold text-white mb-4 text-lg">View Sent Documents</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {sentLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/15 transition-all text-slate-300 hover:text-white"
            >
              <link.icon className="w-5 h-5 text-slate-500" />
              <span className="font-medium text-sm">{link.label}</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-600" />
            </Link>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-300">Getting Started</h3>
            <p className="text-blue-400/80 text-sm mt-1">
              Create your first invoice, change order, or contract using the quick actions above. 
              Your signature will be saved after drawing it once — it&apos;ll auto-load on all future documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
