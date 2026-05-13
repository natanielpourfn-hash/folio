'use strict'

const fs = require('fs')
const path = require('path')
const { execAsync } = require('../utils/exec')
const { PDFDocument } = require('pdf-lib')

// PDF → Word (.docx)
async function pdfToDocx(filePath, options = {}) {
  const pdfParse = require('pdf-parse')
  const { Document, Packer, Paragraph, TextRun } = require('docx')

  const bytes = fs.readFileSync(filePath)
  const data = await pdfParse(bytes)

  const paragraphs = data.text
    .split('\n')
    .map(line => new Paragraph({
      children: [new TextRun({ text: line, font: 'Calibri', size: 24 })],
      spacing: { after: 120 },
    }))

  const doc = new Document({ sections: [{ children: paragraphs }] })
  return Packer.toBuffer(doc)
}

// PDF → Excel (.xlsx)
async function pdfToXlsx(filePath) {
  const pdfParse = require('pdf-parse')
  const XLSX = require('xlsx')

  const bytes = fs.readFileSync(filePath)
  const data = await pdfParse(bytes)

  const rows = data.text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => [line])

  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Données')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

// Word (.docx / .doc) → PDF
async function docxToPdf(filePath) {
  const mammoth = require('mammoth')
  const PDFKit = require('pdfkit')

  let text = ''
  try {
    const result = await mammoth.extractRawText({ path: filePath })
    text = result.value
  } catch (e) {
    throw new Error('Impossible de lire le fichier Word : ' + e.message)
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFKit({ margin: 60, size: 'A4' })
    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.font('Helvetica').fontSize(12)
    const paragraphs = text.split('\n').filter(p => p.trim())
    paragraphs.forEach((para, i) => {
      doc.text(para, { align: 'justify' })
      if (i < paragraphs.length - 1) doc.moveDown(0.4)
    })
    doc.end()
  })
}

// Compress PDF (rewrite with object streams + strip metadata)
async function compressPdf(filePath, level = 'Moyen') {
  const bytes = fs.readFileSync(filePath)
  const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false })

  pdfDoc.setTitle('')
  pdfDoc.setAuthor('')
  pdfDoc.setSubject('')
  pdfDoc.setKeywords([])
  pdfDoc.setCreator('Folio')
  pdfDoc.setProducer('')

  const saved = await pdfDoc.save({ useObjectStreams: true })
  return Buffer.from(saved)
}

// Merge PDFs
async function mergePdfs(filePaths) {
  const merged = await PDFDocument.create()

  for (const fp of filePaths) {
    const bytes = fs.readFileSync(fp)
    const doc = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach(p => merged.addPage(p))
  }

  const mergedBytes = await merged.save()
  return Buffer.from(mergedBytes)
}

// OCR — PDFs scannés via ocrmypdf ; images via tesseract.js
async function ocrFile(filePath, outputPath) {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.pdf') {
    // Utilise ocrmypdf (installé via pip3) pour les PDFs scannés
    await execAsync(
      `python3 -m ocrmypdf "${filePath}" "${outputPath}" --language fra+eng --optimize 1 --skip-text`,
      { timeout: 10 * 60 * 1000 }
    )
    return fs.readFileSync(outputPath)
  } else {
    // Image : tesseract.js (pas besoin de binaire système)
    const { createWorker } = require('tesseract.js')
    const PDFKit = require('pdfkit')

    const worker = await createWorker(['fra', 'eng'])
    let recognizedText = ''
    try {
      const { data } = await worker.recognize(filePath)
      recognizedText = data.text
    } finally {
      await worker.terminate()
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFKit({ size: 'A4', margin: 60 })
      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
      doc.font('Helvetica').fontSize(11).text(recognizedText || '(aucun texte détecté)')
      doc.end()
    })
  }
}

module.exports = { pdfToDocx, pdfToXlsx, docxToPdf, compressPdf, mergePdfs, ocrFile }
