import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

export function useConvert() {
  const [status, setStatus] = useState('idle') // idle | uploading | converting | done | error
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [jobId, setJobId] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileCount, setFileCount] = useState(1)
  const [countdown, setCountdown] = useState(3600)
  const pollRef = useRef(null)
  const countdownRef = useRef(null)

  const startCountdown = useCallback(() => {
    setCountdown(3600)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  const pollStatus = useCallback((id) => {
    const labels = ['Analyse...', 'Conversion...', 'Finalisation...']
    let labelIdx = 0

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/status/${id}`)
        setProgress(data.progress || 0)
        setProgressLabel(labels[Math.min(labelIdx, labels.length - 1)])

        if (data.progress > 33) labelIdx = 1
        if (data.progress > 66) labelIdx = 2

        if (data.status === 'done') {
          clearInterval(pollRef.current)
          setStatus('done')
          setResult(data.result)
          startCountdown()
        } else if (data.status === 'error') {
          clearInterval(pollRef.current)
          setStatus('error')
          setError(data.error || 'Une erreur est survenue lors de la conversion.')
        }
      } catch {
        clearInterval(pollRef.current)
        setStatus('error')
        setError("Impossible de vérifier l'état de la conversion.")
      }
    }, 500)
  }, [startCountdown])

  // files: File | File[]
  const upload = useCallback(async (files, tool, options = {}) => {
    const fileList = Array.isArray(files) ? files : [files]
    const primary = fileList[0]

    try {
      setStatus('uploading')
      setProgress(0)
      setError(null)
      setUploadedFile(primary)
      setFileCount(fileList.length)

      const formData = new FormData()
      fileList.forEach(f => formData.append('files', f))

      const { data: uploadData } = await axios.post('/api/upload', formData, {
        onUploadProgress: e => setProgress(Math.round((e.loaded / e.total) * 30)),
      })

      setJobId(uploadData.jobId)
      setProgress(30)

      await axios.post('/api/convert', {
        jobId: uploadData.jobId,
        outputFormat: tool,
        options,
      })

      setStatus('converting')
      setProgressLabel('Analyse...')
      pollStatus(uploadData.jobId)
    } catch (err) {
      setStatus('error')
      const msg = err.response?.data?.error || err.message || 'Upload échoué.'
      setError(msg)
    }
  }, [pollStatus])

  const cancel = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (jobId) {
      try { await axios.delete(`/api/cancel/${jobId}`) } catch {}
    }
    setStatus('idle')
    setProgress(0)
    setJobId(null)
    setResult(null)
    setError(null)
    setUploadedFile(null)
    setFileCount(1)
  }, [jobId])

  const reset = useCallback(() => { cancel() }, [cancel])

  return {
    status, progress, progressLabel, result, error,
    uploadedFile, fileCount, countdown, upload, cancel, reset,
  }
}
