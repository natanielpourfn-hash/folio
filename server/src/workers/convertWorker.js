'use strict'

const { Worker } = require('bullmq')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const { PDFDocument } = require('pdf-lib')

const execAsync = promisify(exec)

const CONVERTED_DIR = path.join(__dirname, '../../../converted')
const UPLOADS_DIR = path.join(__dirname, '../../../uploads')

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}

async function convertFile(job) {
  const { jobId, filePath, outputFormat, options = {} } = job.data

  fs.mkdirSync(CONVERTED_DIR, { recursive: true })

  const inputName = path.basename(filePath, path.extname(filePath))
  let outputPath, outputName

  switch (outputFormat) {
    case 'docx':
    case 'xlsx':
    case 'pptx': {
      outputName = `${inputName}.${outputFormat}`
      outputPath = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
      const quality = options.quality === 'Haute fidélité' ? '--infilter="writer_pdf_import"' : ''
      await execAsync(
        `soffice --headless --convert-to ${outputFormat} --outdir "${CONVERTED_DIR}" "${filePath}"`,
        { timeout: 5 * 60 * 1000 }
      )
      // LibreOffice outputs to same dir with same base name
      const libreOutput = path.join(CONVERTED_DIR, `${inputName}.${outputFormat}`)
      if (fs.existsSync(libreOutput)) fs.renameSync(libreOutput, outputPath)
      break
    }

    case 'pdf': {
      outputName = `${inputName}.pdf`
      outputPath = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
      await execAsync(
        `soffice --headless --convert-to pdf --outdir "${CONVERTED_DIR}" "${filePath}"`,
        { timeout: 5 * 60 * 1000 }
      )
      const libreOutput = path.join(CONVERTED_DIR, `${inputName}.pdf`)
      if (fs.existsSync(libreOutput)) fs.renameSync(libreOutput, outputPath)
      break
    }

    case 'compress': {
      outputName = `${inputName}-compresse.pdf`
      outputPath = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
      const levelMap = { Faible: '/printer', Moyen: '/ebook', Fort: '/screen' }
      const gsLevel = levelMap[options.level] || '/ebook'
      await execAsync(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsLevel} ` +
        `-dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${filePath}"`,
        { timeout: 5 * 60 * 1000 }
      )
      break
    }

    case 'merge': {
      outputName = `merged.pdf`
      outputPath = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
      const merged = await PDFDocument.create()
      const files = Array.isArray(filePath) ? filePath : [filePath]
      for (const fp of files) {
        const bytes = fs.readFileSync(fp)
        const doc = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        pages.forEach(p => merged.addPage(p))
      }
      const mergedBytes = await merged.save()
      fs.writeFileSync(outputPath, mergedBytes)
      break
    }

    case 'ocr': {
      outputName = `${inputName}-ocr.pdf`
      outputPath = path.join(CONVERTED_DIR, `${jobId}-${outputName}`)
      // Requires ocrmypdf installed: pip install ocrmypdf
      await execAsync(
        `ocrmypdf "${filePath}" "${outputPath}" --language fra --optimize 1`,
        { timeout: 10 * 60 * 1000 }
      )
      break
    }

    default:
      throw new Error(`Format de sortie non supporté : ${outputFormat}`)
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error('Le fichier de sortie n\'a pas été créé.')
  }

  const stat = fs.statSync(outputPath)

  // Delete input after conversion
  try { fs.unlinkSync(filePath) } catch {}

  return {
    fileName: outputName,
    fileSize: stat.size,
    filePath: outputPath,
    downloadUrl: `/api/download/${jobId}`,
  }
}

const worker = new Worker('conversions', convertFile, {
  connection: redisConnection,
  concurrency: 3,
})

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

console.log('Folio convert worker started')

module.exports = worker
