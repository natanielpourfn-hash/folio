import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const plans = [
  {
    name: 'Gratuit',
    price: { monthly: 0, yearly: 0 },
    featured: false,
    cta: 'Commencer gratuitement',
    ctaTo: '/convert',
    features: [
      '10 conversions par jour',
      'Fichiers jusqu\'à 25 Mo',
      'Tous les formats de base',
      'Données supprimées après 1h',
      'Sans compte requis',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 9, yearly: 7 },
    featured: true,
    badge: 'Le plus populaire',
    cta: 'Démarrer l\'essai gratuit',
    ctaTo: '/convert',
    features: [
      'Conversions illimitées',
      'Fichiers jusqu\'à 500 Mo',
      'OCR avancé',
      'Batch — 100 fichiers',
      'Historique 30 jours',
      'Support prioritaire',
    ],
  },
  {
    name: 'Équipe',
    price: { monthly: 29, yearly: 23 },
    featured: false,
    cta: 'Contacter les ventes',
    ctaTo: '/',
    features: [
      'Tout le plan Pro inclus',
      '5 utilisateurs inclus',
      'API REST + webhooks',
      'Facturation SEPA',
      'SLA 99.9%',
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08, ease: 'easeOut' } }),
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleProCheckout = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/stripe/checkout')
      window.location.href = data.url
    } catch {
      alert('Erreur lors de la redirection vers le paiement. Réessaie.')
      setLoading(false)
    }
  }

  return (
    <main className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <h1 className="font-display text-5xl font-medium mb-4">Tarifs</h1>
          <p className="text-lg text-secondary mb-8">
            Commencez gratuitement. Passez au Pro quand vous en avez besoin.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-surface rounded-lg p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${!yearly ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${yearly ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
            >
              Annuel
              <span className="text-xs font-medium text-accent bg-amber-50 px-1.5 py-0.5 rounded">−20%</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              className={`relative bg-white rounded-lg border flex flex-col ${
                plan.featured
                  ? 'border-primary scale-[1.02] shadow-sm'
                  : 'border-subtle'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-7 border-b border-subtle">
                <p className="text-sm font-medium text-secondary mb-3">{plan.name}</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-display text-4xl font-medium">
                    {yearly ? plan.price.yearly : plan.price.monthly}€
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-sm text-muted">/mois</span>
                  )}
                </div>
                {yearly && plan.price.monthly > 0 && (
                  <p className="text-xs text-muted">
                    Facturé {(yearly ? plan.price.yearly : plan.price.monthly) * 12}€/an
                  </p>
                )}
              </div>

              <div className="p-7 flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.featured ? (
                  <button
                    onClick={handleProCheckout}
                    disabled={loading}
                    className="w-full text-center py-2.5 px-4 rounded text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={13} className="animate-spin" />}
                    {loading ? 'Redirection...' : plan.cta}
                  </button>
                ) : (
                  <Link
                    to={plan.ctaTo}
                    className="w-full text-center py-2.5 px-4 rounded text-sm font-medium transition-colors border border-subtle hover:border-black/20 hover:bg-surface block"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center text-sm text-muted mt-10"
        >
          Paiement sécurisé par Stripe · Annulable à tout moment · Facture TVA disponible
        </motion.p>
      </div>
    </main>
  )
}
