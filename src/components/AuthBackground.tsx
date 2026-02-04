import { motion } from 'framer-motion'

/**
 * Lightweight background animations for Login and Signup pages.
 * Renders behind content (z-0); form card uses z-10 so it stays on top.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Base gradient – fills page so animations show on top */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" />

      {/* Animated gradient orbs – visible, behind card */}
      <motion.div
        className="absolute -top-32 -left-40 h-80 w-80 rounded-full bg-emerald-400/40 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.55, 0.4],
          x: [0, 24, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-sky-400/40 blur-3xl"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0.55, 0.4],
          x: [0, -20, 0],
          y: [0, -24, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating dots – larger and more opaque so they’re visible */}
      {[...Array(18)].map((_, i) => {
        const size = Math.random() * 6 + 4
        const x = Math.random() * 100
        const y = Math.random() * 100
        const duration = Math.random() * 14 + 10
        const delay = Math.random() * 4

        return (
          <motion.div
            key={`auth-dot-${i}`}
            className="absolute rounded-full bg-emerald-500/55 shadow-sm"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            animate={{
              y: [0, -28, 0],
              x: [0, Math.sin(i) * 18, 0],
              opacity: [0.45, 0.8, 0.45],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          />
        )
      })}

      {/* Soft grid */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-emerald-600"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      {/* Floating circles */}
      <motion.div
        className="absolute top-1/3 right-1/4 h-44 w-44 rounded-full border-2 border-emerald-400/35"
        animate={{
          y: [0, -22, 0],
          scale: [1, 1.08, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/4 h-36 w-36 rounded-full border-2 border-sky-400/35"
        animate={{
          y: [0, 18, 0],
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.38, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  )
}
