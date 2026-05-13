'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const cron = require('node-cron')
const { cleanupOldFiles } = require('./utils/cleanup')
const convertRoutes = require('./routes/convert')

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))
app.use('/converted', express.static(path.join(__dirname, '../../converted')))

app.use('/api', convertRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Servir le client React en production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Cleanup cron every 5 minutes
cron.schedule('*/5 * * * *', () => {
  cleanupOldFiles()
})

app.listen(PORT, () => {
  console.log(`Folio server running on http://localhost:${PORT}`)
})
