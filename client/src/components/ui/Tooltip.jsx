import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="bg-primary text-white text-xs px-2.5 py-1.5 rounded whitespace-nowrap shadow-lg">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
