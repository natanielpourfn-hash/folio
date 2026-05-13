import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Table, FileOutput, Minimize2, Layers, ScanText, ChevronDown } from 'lucide-react'

const TOOLS = [
  { id: 'pdf-to-word',  label: 'PDF → Word',        desc: 'Convertir en .docx',       icon: FileText,   color: 'text-blue-500',   bg: 'bg-blue-50' },
  { id: 'pdf-to-excel', label: 'PDF → Excel',        desc: 'Extraire les tableaux',    icon: Table,      color: 'text-green-500',  bg: 'bg-green-50' },
  { id: 'word-to-pdf',  label: 'Word → PDF',         desc: 'Convertir en .pdf',        icon: FileOutput, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'compress',     label: 'Compresser',          desc: 'Réduire la taille',        icon: Minimize2,  color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'merge',        label: 'Fusionner',           desc: 'Combiner des PDFs',        icon: Layers,     color: 'text-pink-500',   bg: 'bg-pink-50' },
  { id: 'ocr',          label: 'OCR',                 desc: 'Scan → texte',             icon: ScanText,   color: 'text-amber-500',  bg: 'bg-amber-50' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const timeoutRef = useRef(null)
  const location = useLocation()

  // Close dropdown on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Click-outside to close
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openMenu = () => {
    clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-14 flex items-center transition-all duration-200 ${
        scrolled ? 'border-b border-subtle backdrop-blur-md bg-bg/90' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <img
            src="/logo.png"
            alt="Folio"
            className="h-9 w-9 object-contain rounded-lg"
            draggable={false}
          />
          <span className="font-display text-xl font-semibold tracking-tight text-primary">Folio</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Outils dropdown */}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            <button
              onClick={() => setOpen(v => !v)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                open ? 'text-primary font-medium' : 'text-secondary hover:text-primary'
              }`}
            >
              Outils
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                <ChevronDown size={13} strokeWidth={2} />
              </motion.span>
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[400px] bg-white border border-subtle rounded-xl shadow-lg p-4"
                >
                  {/* Small arrow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-subtle rotate-45 rounded-sm" />

                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3 px-1">Tous les outils</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TOOLS.map(({ id, label, desc, icon: Icon, color, bg }) => (
                      <Link
                        key={id}
                        to={`/convert/${id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={15} className={color} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors leading-tight">{label}</p>
                          <p className="text-xs text-muted leading-tight">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `text-sm transition-colors ${isActive ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`
            }
          >
            Tarifs
          </NavLink>

          <NavLink
            to="/#about"
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            À propos
          </NavLink>
        </nav>

        <Link to="/convert" className="btn-primary text-sm">
          Commencer
        </Link>
      </div>
    </header>
  )
}
