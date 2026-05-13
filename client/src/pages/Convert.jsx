import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Table, FileOutput, Minimize2, Layers, ScanText,
  Upload, X, Download, RefreshCw, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import ProgressBar from '../components/ui/ProgressBar'
import Toggle from '../components/ui/Toggle'
import { useConvert } from '../hooks/useConvert'

const TOOLS = [
  {
    id: 'pdf-to-word', label: 'PDF → Word', shortLabel: 'PDF → Word', icon: FileText,
    color: 'text-blue-500', bg: 'bg-blue-50',
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'docx',
    options: [
      { id: 'quality', label: 'Qualité', type: 'select', values: ['Standard', 'Haute fidélité'] },
      { id: 'keepImages', label: 'Conserver les images', type: 'toggle' },
    ],
  },
  {
    id: 'pdf-to-excel', label: 'PDF → Excel', shortLabel: 'PDF → Excel', icon: Table,
    color: 'text-green-500', bg: 'bg-green-50',
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'xlsx',
    options: [],
  },
  {
    id: 'word-to-pdf', label: 'Word → PDF', shortLabel: 'Word → PDF', icon: FileOutput,
    color: 'text-purple-500', bg: 'bg-purple-50',
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    outputFormat: 'pdf',
    options: [],
  },
  {
    id: 'compress', label: 'Compresser PDF', shortLabel: 'Compresser', icon: Minimize2,
    color: 'text-orange-500', bg: 'bg-orange-50',
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'compress',
    options: [
      { id: 'level', label: 'Niveau de compression', type: 'select', values: ['Faible', 'Moyen', 'Fort'] },
    ],
  },
  {
    id: 'merge', label: 'Fusionner PDFs', shortLabel: 'Fusionner', icon: Layers,
    color: 'text-pink-500', bg: 'bg-pink-50',
    accept: { 'application/pdf': ['.pdf'] },
    outputFormat: 'merge',
    options: [],
  },
  {
    id: 'ocr', label: 'OCR — Scan → Texte', shortLabel: 'OCR', icon: ScanText,
    color: 'text-amber-500', bg: 'bg-amber-50',
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
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="23" stroke="#22c55e" strokeWidth="1.5" opacity="0.25" />
      <circle cx="24" cy="24" r="23" stroke="#22c55e" strokeWidth="1.5" opacity="0.08" fill="#22c55e" />
      <motion.path
        d="M14 24 L21 31 L34 17"
        stroke="#22c55e"
        strokeWidth="2.5"
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
  const stripRef = useRef(null)

  const [options, setOptions] = useState({
    quality: 'Standard',
    keepImages: true,
    level: 'Moyen',
  })

  // Scroll active tool pill into view
  useEffect(() => {
    if (!stripRef.current) return
    const active = stripRef.current.querySelector('[data-active="true"]')
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [activeTool.id])

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

  const handleToolChange = (id) => {
    if (id !== activeTool.id) {
      reset()
      navigate(`/convert/${id}`)
    }
  }

  const Icon = activeTool.icon

  return (
    <div className="min-h-screen pt-14 bg-bg flex flex-col">
      {/* Tool switcher strip */}
      <div className="border-b border-subtle bg-bg/95 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div
            ref={stripRef}
            className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TOOLS.map(({ id, shortLabel, icon: ToolIcon, color, bg }) => {
              const isActive = id === activeTool.id
              return (
                <button
                  key={id}
                  data-active={isActive}
                  onClick={() => handleToolChange(id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-surface'
                  }`}
                >
                  <ToolIcon
                    size={13}
                    strokeWidth={1.5}
                    className={isActive ? 'text-white' : color}
                  />
                  {shortLabel}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">

          {/* Tool header */}
          <motion.div
            key={activeTool.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className={`w-10 h-10 rounded-xl ${activeTool.bg} flex items-center justify-center`}>
              <Icon size={18} className={activeTool.color} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium leading-tight">{activeTool.label}</h1>
            </div>
          </motion.div>

          {/* Content area — converter + options side by side when options exist */}
          <div className="flex-1 flex gap-6 items-start">

            {/* Converter area */}
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">

                {/* IDLE — Upload zone */}
                {status === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      {...getRootProps()}
                      className={`cursor-pointer rounded-xl p-16 text-center transition-all duration-200 ${
                        isDragActive
                          ? 'border-2 border-accent bg-amber-50/40'
                          : 'border-2 border-dashed border-black/12 hover:border-black/25 hover:bg-surface/50'
                      }`}
                    >
                      <input {...getInputProps()} aria-label="Sélectionner un fichier" />
                      <motion.div
                        animate={isDragActive ? { scale: 1.04 } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`w-16 h-16 rounded-2xl ${activeTool.bg} flex items-center justify-center mb-5`}>
                          <Icon size={28} className={activeTool.color} strokeWidth={1.5} />
                        </div>
                        <p className="font-medium text-lg mb-2">
                          {isDragActive
                            ? (activeTool.id === 'merge' ? 'Déposez les fichiers ici' : 'Déposez le fichier ici')
                            : (activeTool.id === 'merge' ? 'Glissez vos fichiers PDF ici' : 'Glissez votre fichier ici')}
                        </p>
                        <p className="text-sm text-muted mb-6">
                          {activeTool.id === 'merge'
                            ? 'Plusieurs fichiers PDF · Max 50 Mo chacun'
                            : 'ou cliquez pour parcourir · Max 50 Mo'}
                        </p>
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                          <Upload size={14} strokeWidth={1.5} />
                          {activeTool.id === 'merge' ? 'Choisir les fichiers' : 'Choisir un fichier'}
                        </span>
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
                    className="flex items-center justify-center py-16"
                  >
                    <div className="w-full max-w-sm">
                      <div className="bg-white border border-subtle rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`w-9 h-9 rounded-lg ${activeTool.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={15} className={activeTool.color} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {fileCount > 1 ? `${fileCount} fichiers` : uploadedFile?.name}
                            </p>
                            <p className="text-xs text-muted">
                              {uploadedFile?.size ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} Mo` : '—'}
                            </p>
                          </div>
                          <button
                            onClick={cancel}
                            className="text-muted hover:text-primary transition-colors p-1"
                            aria-label="Annuler"
                          >
                            <X size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                        <ProgressBar value={progress} className="mb-3" />
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
                    className="flex items-center justify-center py-16"
                  >
                    <div className="w-full max-w-sm text-center">
                      <div className="flex justify-center mb-5">
                        <CheckAnimation />
                      </div>
                      <h2 className="font-display text-xl font-medium mb-1.5">Conversion réussie !</h2>
                      <p className="text-sm text-secondary mb-7">
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
                    className="flex items-center justify-center py-16"
                  >
                    <div className="w-full max-w-sm text-center">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={22} className="text-red-400" strokeWidth={1.5} />
                      </div>
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

            {/* Options panel — right side, only when idle and tool has options */}
            <AnimatePresence>
              {activeTool.options.length > 0 && status === 'idle' && (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.22 }}
                  className="hidden md:block w-64 flex-shrink-0"
                >
                  <div className="bg-white border border-subtle rounded-xl p-5">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-4">Options</p>
                    <div className="space-y-5">
                      {activeTool.options.map(opt => (
                        <div key={opt.id}>
                          <p className="text-sm font-medium mb-2">{opt.label}</p>
                          {opt.type === 'select' && (
                            <div className="space-y-1.5">
                              {opt.values.map(v => (
                                <button
                                  key={v}
                                  onClick={() => setOptions(prev => ({ ...prev, [opt.id]: v }))}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
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
                    <p className="text-xs text-muted mt-5 leading-relaxed">
                      Options appliquées automatiquement à la conversion.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
