import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Table, FileOutput, Minimize2, Layers, ScanText,
  Upload, X, Download, RefreshCw, AlertCircle, ChevronLeft
} from 'lucide-react'
import ProgressBar from '../components/ui/ProgressBar'
import Toggle from '../components/ui/Toggle'
import { useConvert } from '../hooks/useConvert'

const TOOLS = [
  {
    id: 'pdf-to-word', label: 'PDF → Word', icon: FileText,
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'docx',
    options: [
      { id: 'quality', label: 'Qualité', type: 'select', values: ['Standard', 'Haute fidélité'] },
      { id: 'keepImages', label: 'Conserver les images', type: 'toggle' },
    ],
  },
  {
    id: 'pdf-to-excel', label: 'PDF → Excel', icon: Table,
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'xlsx',
    options: [],
  },
  {
    id: 'word-to-pdf', label: 'Word → PDF', icon: FileOutput,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    outputFormat: 'pdf',
    options: [],
  },
  {
    id: 'compress', label: 'Compresser PDF', icon: Minimize2,
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'compress',
    options: [
      { id: 'level', label: 'Niveau de compression', type: 'select', values: ['Faible', 'Moyen', 'Fort'] },
    ],
  },
  {
    id: 'merge', label: 'Fusionner PDFs', icon: Layers,
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'merge',
    options: [],
  },
  {
    id: 'ocr', label: 'OCR — Scan → Texte', icon: ScanText,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg', '.tiff'] },
    outputFormat: 'ocr',
    options: [],
  },
]

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function CheckAnimation() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" stroke="#22c55e" strokeWidth="1.5" opacity="0.3" />
      <motion.path
        d="M12 20 L18 26 L28 14"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function Convert() {
  const { tool: toolId } = useParams()
  const navigate = useNavigate()
  const activeTool = TOOLS.find(t => t.id === toolId) || TOOLS[0]
  const { status, progress, progressLabel, result, error, uploadedFile, fileCount, countdown, upload, cancel, reset } = useConvert()

  const [options, setOptions] = useState({
    quality: 'Standard',
    keepImages: true,
    level: 'Moyen',
  })

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const files = activeTool.id === 'merge' ? acceptedFiles : acceptedFiles[0]
      upload(files, activeTool.outputFormat, options)
    }
  }, [activeTool, options, upload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: activeTool.accept,
    maxSize: 50 * 1024 * 1024,
    multiple: activeTool.id === 'merge',
  })

  const handleDownload = () => {
    if (!result?.downloadUrl) return
    const a = document.createElement('a')
    a.href = result.downloadUrl
    a.download = result.fileName || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex min-h-screen pt-14">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-subtle bg-bg flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
        <div className="p-5">
          <p className="section-label mb-4">Outils PDF</p>
          <nav className="space-y-0.5">
            {TOOLS.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeTool.id
              return (
                <Link
                  key={id}
                  to={`/convert/${id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors relative ${
                    isActive
                      ? 'bg-surface text-primary font-medium'
                      : 'text-secondary hover:text-primary hover:bg-surface/60'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent rounded-full" />
                  )}
                  <Icon size={14} strokeWidth={1.5} className={isActive ? 'text-accent' : ''} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 p-6 md:p-10 flex flex-col">
          {/* Mobile back */}
          <Link to="/" className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary mb-6 md:hidden transition-colors">
            <ChevronLeft size={14} strokeWidth={1.5} />
            Retour
          </Link>

          <h1 className="font-display text-2xl font-medium mb-8">{activeTool.label}</h1>

          <AnimatePresence mode="wait">
            {/* IDLE — Upload zone */}
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center"
              >
                <div
                  {...getRootProps()}
                  className={`w-full max-w-xl cursor-pointer rounded-lg p-16 text-center transition-all duration-200 ${
                    isDragActive
                      ? 'border-2 border-accent bg-amber-50/30'
                      : 'border border-dashed border-black/20 hover:border-black/40 hover:bg-surface/40'
                  }`}
                  style={{ borderStyle: 'dashed' }}
                >
                  <input {...getInputProps()} aria-label="Sélectionner un fichier" />
                  <motion.div
                    animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Upload
                      size={32}
                      className={`mx-auto mb-4 ${isDragActive ? 'text-accent' : 'text-muted'}`}
                      strokeWidth={1.5}
                    />
                    <p className="font-medium mb-1.5">
                      {isDragActive
                        ? (activeTool.id === 'merge' ? 'Déposez les fichiers ici' : 'Déposez le fichier ici')
                        : (activeTool.id === 'merge' ? 'Glissez vos fichiers PDF ici' : 'Glissez votre fichier ici')}
                    </p>
                    <p className="text-sm text-muted">
                      {activeTool.id === 'merge'
                        ? 'ou cliquez pour parcourir · Plusieurs PDFs · Max 50 Mo chacun'
                        : 'ou cliquez pour parcourir · PDF uniquement · Max 50 Mo'}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* UPLOADING / CONVERTING */}
            {(status === 'uploading' || status === 'converting') && (
              <motion.div
                key="converting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="w-full max-w-sm">
                  <div className="bg-white border border-subtle rounded-lg p-5 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-red-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileCount > 1 ? `${fileCount} fichiers` : uploadedFile?.name}
                        </p>
                        <p className="text-xs text-muted">{(uploadedFile?.size / (1024 * 1024)).toFixed(1)} Mo</p>
                      </div>
                      <button
                        onClick={cancel}
                        className="text-muted hover:text-primary transition-colors"
                        aria-label="Annuler"
                      >
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <ProgressBar value={progress} className="mb-2" />
                    <motion.p
                      key={progressLabel}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted text-center"
                    >
                      {progressLabel || 'Préparation...'}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DONE */}
            {status === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="w-full max-w-sm text-center">
                  <div className="flex justify-center mb-4">
                    <CheckAnimation />
                  </div>
                  <h2 className="font-medium mb-1">Conversion réussie !</h2>
                  <p className="text-sm text-secondary mb-6">
                    {result?.fileName || 'fichier-converti'}
                    {result?.fileSize && ` · ${(result.fileSize / (1024 * 1024)).toFixed(1)} Mo`}
                  </p>
                  <button onClick={handleDownload} className="btn-primary w-full justify-center mb-3">
                    <Download size={14} strokeWidth={1.5} />
                    Télécharger
                  </button>
                  <button onClick={reset} className="btn-ghost w-full justify-center">
                    <RefreshCw size={14} strokeWidth={1.5} />
                    Convertir un autre fichier
                  </button>
                  <p className="text-xs text-muted mt-6" aria-live="polite">
                    Ce fichier sera supprimé dans{' '}
                    <span className="font-medium tabular-nums">{formatTime(countdown)}</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ERROR */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="w-full max-w-sm text-center">
                  <AlertCircle size={36} className="mx-auto mb-4 text-red-400" strokeWidth={1.5} />
                  <h2 className="font-medium mb-2">Une erreur est survenue</h2>
                  <p className="text-sm text-secondary mb-6">{error}</p>
                  <button onClick={reset} className="btn-primary">
                    <RefreshCw size={14} strokeWidth={1.5} />
                    Réessayer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options panel — slide in after upload */}
        <AnimatePresence>
          {activeTool.options.length > 0 && status === 'idle' && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full md:w-72 border-t md:border-t-0 md:border-l border-subtle p-6 flex flex-col"
            >
              <p className="section-label mb-5">Options</p>
              <div className="space-y-5 flex-1">
                {activeTool.options.map(opt => (
                  <div key={opt.id}>
                    <p className="text-sm font-medium mb-2">{opt.label}</p>
                    {opt.type === 'select' && (
                      <div className="space-y-1.5">
                        {opt.values.map(v => (
                          <button
                            key={v}
                            onClick={() => setOptions(prev => ({ ...prev, [opt.id]: v }))}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              options[opt.id] === v
                                ? 'bg-primary text-white'
                                : 'border border-subtle hover:border-black/20 hover:bg-surface'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                    {opt.type === 'toggle' && (
                      <Toggle
                        checked={options[opt.id] ?? true}
                        onChange={v => setOptions(prev => ({ ...prev, [opt.id]: v }))}
                        label={options[opt.id] ? 'Activé' : 'Désactivé'}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-6 leading-relaxed">
                Les options sont appliquées automatiquement lors de la conversion.
              </p>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
