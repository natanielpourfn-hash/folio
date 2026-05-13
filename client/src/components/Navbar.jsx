import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-14 flex items-center transition-all duration-200 ${
        scrolled ? 'border-b border-subtle backdrop-blur-md bg-bg/90' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <img
            src="/logo.png"
            alt="Folio"
            className="h-9 w-9 object-contain rounded-lg"
            draggable={false}
          />
          <span className="font-display text-xl font-semibold tracking-tight text-primary">Folio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Outils', to: '/convert' },
            { label: 'Tarifs', to: '/pricing' },
            { label: 'À propos', to: '/#about' },
          ].map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Link to="/convert" className="btn-primary text-sm">
          Commencer
        </Link>
      </div>
    </header>
  )
}
