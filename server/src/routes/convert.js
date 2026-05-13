'use strict'

const express = require('express')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')
const upload = require('../middleware/upload')
const converters = require('../converters')

const router = express.Router()

const CONVERTED_DIR = path.join(__dirname, '../../../converted')

// In-memory job store
const jobs = new Map()

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Trop de requêtes. Réessayez dans une minute.' },
  standardHeaders: true,
  legacyHeaders: false,
})
router.use(limiter)

// POST /api/upload — accepts 1 or more files
router.post('/upload', upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' })
  }

  const jobId = uuid()
  const files = req.files

  jobs.set(jobId, {
    id: jobId,
    status: 'pending',
    progress: 0,
    filePaths: files.map(f => f.path),
    fileName: files[0].originalname,
    fileSize: files[0].size,
    uploadedAt: Date.now(),
  })

  res.json({
    jobId,
    fileName: files[0].originalname,
    fileSize: files[0].size,
    fileType: files[0].mimetype,
  })
})

// POST /api/convert — starts async in-process conversion
router.post('/convert', (req, res) => {
  const { jobId, outputFormat, options = {} } = req.body

  if (!jobId || !outputFormat) {
    return res.status(400).json({ error: 'jobId et outputFormat sont requis.' })
  }

  const job = jobs.get(jobId)
  if (!job) return res.status(404).json({ error: 'Job introuvable.' })

  job.status = 'processing'
  job.outputFormat = outputFormat
  job.options = options

  // Fire-and-forget: conversion updates job in-place
  runConversion(jobId, job).catch(err => {
    const j = jobs.get(jobId)
    if (j) { j.status = 'error'; j.error = err.message }
  })

  res.json({ jobId })
})

// GET /api/status/:jobId
router.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Job introuvable.' })

  res.json({
    status: job.status,
    progress: job.progress,
    result: job.result || null,
    error: job.error || null,
  })
})

// GET /api/download/:jobId
router.get('/download/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job || job.status !== 'done' || !job.result?.filePath) {
    return res.status(404).json({ error: 'Fichier non disponible.' })
  }

  const { filePath, fileName } = job.result
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier expiré ou supprimé.' })
  }

  res.download(filePath, fileName, () => {
    try { fs.unlinkSync(filePath) } catch {}
    jobs.delete(req.params.jobId)
  })
})

// DELETE /api/cancel/:jobId
router.delete('/cancel/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Job introuvable.' })

  if (job.filePaths) {
    job.filePaths.forEach(fp => { try { fs.unlinkSync(fp) } catch {} })
  }
  if (job.result?.filePath) try { fs.unlinkSync(job.result.filePath) } catch {}

  jobs.delete(req.params.jobId)
  res.json({ ok: true })
})

// ─── Conversion runner ────────────────────────────────────────────────────────

async function runConversion(jobId, job) {
  fs.mkdirSync(CONVERTED_DIR, { recursive: true })

  const setProgress = (p) => {
    const j = jobs.get(jobId)
    if (j) j.progress = p
  }

  setProgress(15)

  const { outputFormat, options, filePaths, fileName } = job
  const inputName = path.basename(fileName, path.extname(fileName))

  // Slowly increment progress while conversion runs
  let fakeP = 15
  const ticker = setInterval(() => {
    fakeP = Math.min(fakeP + 3, 80)
    setProgress(fakeP)
  }, 600)

  let buffer
  let outputName

  try {
    switch (outputFormat) {
      case 'docx':
        buffer = await converters.pdfToDocx(filePaths[0], options)
        outputName = `${inputName}.docx`
        break
      case 'xlsx':
        buffer = await converters.pdfToXlsx(filePaths[0])
        outputName = `${inputName}.xlsx`
        break
      case 'pdf':
        buffer = await converters.docxToPdf(filePaths[0])
        outputName = `${inputName}.pdf`
        break
      case 'compress':
        buffer = await converters.compressPdf(filePaths[0], options.level)
        outputName = `${inputName}-compresse.pdf`
        break
      case 'merge':
        buffer = await converters.mergePdfs(filePaths)
        outputName = 'merged.pdf'
        break
      case 'ocr': {
        outputName = `${inputName}-ocr.pdf`
        const ocrOut = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
        buffer = await converters.ocrFile(filePaths[0], ocrOut)
        break
      }
      default:
        throw new Error(`Format non supporté : ${outputFormat}`)
    }
  } finally {
    clearInterval(ticker)
  }

  setProgress(90)

  const outputPath = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
  fs.writeFileSync(outputPath, buffer)

  // Clean up uploaded files
  filePaths.forEach(fp => { try { fs.unlinkSync(fp) } catch {} })

  const stat = fs.statSync(outputPath)

  setProgress(100)

  job.status = 'done'
  job.result = {
    fileName: outputName,
    fileSize: stat.size,
    filePath: outputPath,
    downloadUrl: `/api/download/${jobId}`,
  }
}

module.exports = router
