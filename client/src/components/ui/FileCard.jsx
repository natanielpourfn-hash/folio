import { FileText, Table, Presentation, File } from 'lucide-react'

const typeConfig = {
  pdf: { color: 'text-red-500', bg: 'bg-red-50', icon: FileText, label: 'PDF' },
  docx: { color: 'text-blue-500', bg: 'bg-blue-50', icon: FileText, label: 'Word' },
  doc: { color: 'text-blue-500', bg: 'bg-blue-50', icon: FileText, label: 'Word' },
  xlsx: { color: 'text-green-500', bg: 'bg-green-50', icon: Table, label: 'Excel' },
  xls: { color: 'text-green-500', bg: 'bg-green-50', icon: Table, label: 'Excel' },
  pptx: { color: 'text-orange-500', bg: 'bg-orange-50', icon: Presentation, label: 'PPT' },
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function FileCard({ name, size, type, className = '' }) {
  const ext = (type || name?.split('.').pop() || '').toLowerCase()
  const config = typeConfig[ext] || { color: 'text-muted', bg: 'bg-surface', icon: File, label: ext?.toUpperCase() }
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-3 p-3 rounded border border-subtle bg-white ${className}`}>
      <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon size={16} className={config.color} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate" title={name}>{name}</p>
        {size && <p className="text-xs text-muted mt-0.5">{formatBytes(size)}</p>}
      </div>
      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    </div>
  )
}
