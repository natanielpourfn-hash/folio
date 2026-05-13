import { motion } from 'framer-motion'

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface border border-subtle'}`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </button>
      {label && <span className="text-sm text-secondary">{label}</span>}
    </label>
  )
}
