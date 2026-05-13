import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function Success() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle size={64} className="text-green-500" strokeWidth={1.5} />
        </motion.div>

        <h1 className="font-display text-3xl font-medium mb-3">
          Bienvenue dans Folio Pro !
        </h1>
        <p className="text-secondary mb-2">
          Ton abonnement est actif. Tu as maintenant accès à toutes les fonctionnalités Pro.
        </p>
        <p className="text-sm text-muted mb-8">
          Un email de confirmation t'a été envoyé par Stripe.
        </p>

        <Link
          to="/convert"
          className="btn-primary inline-flex items-center gap-2"
        >
          Commencer à convertir
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </motion.div>
    </main>
  )
}
