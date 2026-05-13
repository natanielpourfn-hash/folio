'use strict'

const multer = require('multer')
const path = require('path')
const sanitize = require('sanitize-filename')
const { v4: uuid } = require('uuid')

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/tiff',
])

const UPLOADS_DIR = path.join(__dirname, '../../../uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const { mkdirSync } = require('fs')
    mkdirSync(UPLOADS_DIR, { recursive: true })
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const safe = sanitize(file.originalname) || 'file'
    const ext = path.extname(safe)
    cb(null, `${uuid()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Type de fichier non supporté : ${file.mimetype}`))
    }
  },
})

module.exports = upload
