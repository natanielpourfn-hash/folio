import { motion } from 'framer-motion'

const variants = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 px-5 py-2.5 text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer',
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  as: Tag = 'button',
  ...props
}) {
  const cls = `${variants[variant]} ${className} ${disabled || loading ? 'opacity-50 pointer-events-none' : ''}`

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cls}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
