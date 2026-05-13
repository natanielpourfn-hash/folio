import { Link } from 'react-router-dom'

const tools = [
  { label: 'PDF → Word', to: '/convert/pdf-to-word' },
  { label: 'PDF → Excel', to: '/convert/pdf-to-excel' },
  { label: 'Word → PDF', to: '/convert/word-to-pdf' },
  { label: 'Compresser PDF', to: '/convert/compress' },
  { label: 'Fusionner PDFs', to: '/convert/merge' },
  { label: 'OCR', to: '/convert/ocr' },
]

export default function Footer() {
  return (
    <footer className="border-t border-subtle bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-0.5 mb-3">
            <span className="font-display text-lg font-semibold">Folio</span>
            <span className="w-1 h-1 rounded-full bg-accent mb-0.5" />
          </div>
          <p className="text-sm text-secondary leading-relaxed max-w-56">
            Conversion PDF professionnelle, hébergée en France, respectueuse de vos données.
          </p>
        </div>

        <div>
          <p className="section-label mb-4">Outils</p>
          <ul className="space-y-2">
            {tools.map(t => (
              <li key={t.to}>
                <Link to={t.to} className="text-sm text-secondary hover:text-primary transition-colors">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-label mb-4">Légal</p>
          <ul className="space-y-2">
            {['Mentions légales', 'Politique de confidentialité', 'CGU', 'Contact'].map(l => (
              <li key={l}>
                <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-subtle">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-muted">© 2025 Folio. Tous droits réservés.</p>
          <p className="text-xs text-muted">Fait avec ♥ en France</p>
        </div>
      </div>
    </footer>
  )
}
