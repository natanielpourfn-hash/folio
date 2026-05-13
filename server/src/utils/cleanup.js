'use strict'

const fs = require('fs')
const path = require('path')

const UPLOADS_DIR = path.join(__dirname, '../../../uploads')
const CONVERTED_DIR = path.join(__dirname, '../../../converted')
const MAX_AGE_MS = 60 * 60 * 1000 // 1 hour

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir)
  const now = Date.now()
  let count = 0

  for (const file of files) {
    if (file === '.gitkeep') continue
    const filePath = path.join(dir, file)
    try {
      const stat = fs.statSync(filePath)
      if (now - stat.mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(filePath)
        count++
      }
    } catch {}
  }

  if (count > 0) console.log(`[cleanup] Supprimé ${count} fichier(s) dans ${path.basename(dir)}`)
}

function cleanupOldFiles() {
  cleanDir(UPLOADS_DIR)
  cleanDir(CONVERTED_DIR)
}

module.exports = { cleanupOldFiles }
