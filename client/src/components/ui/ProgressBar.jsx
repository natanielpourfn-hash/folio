import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, className = '' }) {
  return (
    <div className={`w-full h-0.5 bg-surface rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: 'var(--color-accent)' }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}
