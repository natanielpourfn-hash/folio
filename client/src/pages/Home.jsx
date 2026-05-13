import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Table, FileOutput, Minimize2, Layers, ScanText,
  Shield, Server, Lock, Trash2, ArrowRight
} from 'lucide-react'
import Badge from '../components/ui/Badge'

const tools = [
  { icon: FileText, label: 'PDF → Word', desc: 'Convertissez vos PDF en documents Word éditables.', to: '/convert/pdf-to-word' },
  { icon: Table, label: 'PDF → Excel', desc: 'Extrayez les tableaux PDF en feuilles Excel.', to: '/convert/pdf-to-excel' },
  { icon: FileOutput, label: 'Word → PDF', desc: 'Transformez vos documents en PDF universels.', to: '/convert/word-to-pdf' },
  { icon: Minimize2, label: 'Compresser PDF', desc: 'Réduisez le poids de vos PDF sans perte visible.', to: '/convert/compress' },
  { icon: Layers, label: 'Fusionner PDFs', desc: 'Combinez plusieurs PDFs en un seul document.', to: '/convert/merge' },
  { icon: ScanText, label: 'OCR — Scan → Texte', desc: 'Rendez vos scans lisibles et cherchables.', to: '/convert/ocr' },
]

const stats = [
  { value: '0 publicité', label: 'Aucune pub, jamais.' },
  { value: '< 30 sec', label: 'Conversion ultra-rapide.' },
  { value: '1h puis supprimé', label: 'Vos fichiers ne restent pas.' },
]

const privacy = [
  { icon: Server, text: 'Serveurs exclusivement en France (OVHcloud)' },
  { icon: Lock, text: 'Chiffrement en transit (TLS 1.3)' },
  { icon: Trash2, text: 'Suppression garantie — aucune copie, aucune analyse' },
]

function HeroCard() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
      style={{ rotate: -2 }}
      className="bg-white border border-subtle rounded-lg p-5 shadow-sm w-full max-w-xs mx-auto"
    >
      <p className="section-label mb-3">Conversion en cours</p>
      <div className="flex items-center gap-3 p-3 rounded border border-subtle mb-3">
        <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center flex-shrink-0">
          <FileText size={14} className="text-red-500" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">rapport-annuel.pdf</p>
          <p className="text-xs text-muted">2.4 Mo</p>
        </div>
      </div>
      <div className="w-full h-0.5 bg-surface rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
          animate={{ width: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
        />
      </div>
      <motion.div
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.4, delay: 2.5, repeat: Infinity, repeatDelay: 2.5 }}
        className="flex items-center gap-3 p-3 rounded border border-subtle"
      >
        <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText size={14} className="text-blue-500" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">rapport-annuel.docx</p>
          <p className="text-xs text-green-600 font-medium">✓ Prêt à télécharger</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' } }),
}

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="noise-bg relative pt-32 pb-24 overflow-hidden">
        {/* Decorative arc */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <path
            d="M -100 600 Q 600 -100 1400 400"
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="1"
          />
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Badge variant="default" className="mb-6">
                🇫🇷 Hébergé en France · RGPD
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="font-display text-6xl lg:text-7xl font-medium leading-[1.08] mb-6"
            >
              Vos documents,<br />
              traités avec<br />
              <em className="not-italic text-accent">précision.</em>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg text-secondary leading-relaxed mb-8 max-w-lg"
            >
              Convertissez, compressez et transformez vos PDF en quelques secondes.
              Zéro inscription. Zéro publicité. Données supprimées après 1 heure.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link to="/convert" className="btn-primary text-sm px-5 py-2.5">
                Convertir un fichier
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link to="/#tools" className="btn-ghost text-sm px-5 py-2.5">
                Voir les outils
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[
                  'bg-stone-300', 'bg-stone-400', 'bg-stone-500',
                  'bg-amber-300', 'bg-amber-500'
                ].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-bg`} />
                ))}
              </div>
              <p className="text-sm text-secondary">
                Utilisé par <strong className="text-primary font-medium">2 400+</strong> professionnels ce mois-ci
              </p>
            </motion.div>
          </div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <HeroCard />
          </motion.div>
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section id="tools" className="py-24 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-3">Fonctionnalités</p>
          <h2 className="font-display text-4xl font-medium">Tout ce dont vous avez besoin</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(({ icon: Icon, label, desc, to }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Link to={to} className="tool-card">
                <Icon size={20} className="text-accent mb-3" strokeWidth={1.5} />
                <p className="font-medium text-sm mb-1">{label}</p>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="border-y border-subtle py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {stats.map(({ value, label }, i) => (
              <div key={value} className={`text-center py-6 ${i < stats.length - 1 ? 'md:border-r border-subtle' : ''}`}>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="font-display text-3xl font-medium mb-1"
                >
                  {value}
                </motion.p>
                <p className="text-sm text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RGPD SECTION */}
      <section id="about" className="bg-surface py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Shield size={28} className="text-accent mb-5" strokeWidth={1.5} />
            <h2 className="font-display text-4xl font-medium mb-4 leading-tight">
              Vos documents méritent mieux
            </h2>
            <p className="text-secondary leading-relaxed mb-8">
              Dans un monde où vos fichiers deviennent des données d'entraînement pour des IA,
              Folio fait le choix inverse : vos documents ne sont jamais analysés, jamais conservés,
              jamais partagés.
            </p>
            <ul className="space-y-4">
              {privacy.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border border-subtle bg-white flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-lg border border-subtle p-8"
          >
            <p className="section-label mb-6">Calendrier de suppression</p>
            <div className="space-y-4">
              {[
                { time: 'Maintenant', event: 'Fichier uploadé et chiffré', done: true },
                { time: '< 30 sec', event: 'Conversion terminée', done: true },
                { time: 'Immédiat', event: 'Fichier original supprimé', done: true },
                { time: 'Après DL', event: 'Fichier converti supprimé', done: false },
                { time: '1 heure', event: 'Suppression automatique garantie', done: false },
              ].map(({ time, event, done }, i) => (
                <div key={event} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${done ? 'border-accent bg-amber-50' : 'border-subtle'}`}>
                    {done && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">{time}</p>
                    <p className="text-sm">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-display text-5xl font-medium mb-4">
            Commencer, c'est gratuit.
          </h2>
          <p className="text-secondary mb-8 text-lg">Aucun compte requis. Vos 10 premières conversions sont offertes.</p>
          <Link to="/convert" className="btn-primary text-sm px-6 py-3">
            Convertir un fichier maintenant
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
