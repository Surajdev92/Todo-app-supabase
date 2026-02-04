import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProgressBarProps {
  completed: number
  total: number
  className?: string
}

export function ProgressBar({ completed, total, className = '' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const [prevPercentage, setPrevPercentage] = useState(percentage)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (percentage === 100 && prevPercentage < 100) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 5000)
      return () => clearTimeout(timer)
    }
    setPrevPercentage(percentage)
  }, [percentage, prevPercentage])

  if (total === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Text */}
      <div className="flex items-center justify-between text-sm">
        <motion.div
          key={`${completed}-${total}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <span className="font-semibold text-slate-700">
            {completed} of {total} completed
          </span>
          <motion.span
            key={percentage}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="font-bold text-emerald-600"
          >
            {percentage}%
          </motion.span>
        </motion.div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ opacity: 0.3 }}
        />

        {/* Progress Fill */}
        <motion.div
          className={`relative h-full rounded-full ${
            percentage === 100
              ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
          }`}
          initial={{ width: `${prevPercentage}%` }}
          animate={{
            width: `${percentage}%`,
            scale: percentage === 100 ? [1, 1.02, 1] : 1,
          }}
          transition={{
            width: { duration: 0.6, ease: 'easeOut' },
            scale: {
              duration: 0.5,
              repeat: percentage === 100 ? Infinity : 0,
              repeatType: 'reverse',
            },
          }}
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Pulse Effect at 100% */}
          {percentage === 100 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* Completion Checkmark */}
        {percentage === 100 && (
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              delay: 0.2,
            }}
          >
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M4 10L8 14L16 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Celebratory Message */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 p-4 text-center shadow-lg"
          >
            {/* Confetti-like particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-yellow-300"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                }}
                animate={{
                  x: `${50 + Math.cos((i * Math.PI * 2) / 12) * 100}%`,
                  y: `${50 + Math.sin((i * Math.PI * 2) / 12) * 100}%`,
                  opacity: 0,
                  scale: [1, 1.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}

            <motion.div
              animate={{
                rotate: [0, 3, -3, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 1,
                repeatType: 'reverse',
              }}
              className="relative z-10 text-lg font-bold text-white"
            >
              🎉 All tasks completed! 🎉
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 mt-1 text-sm text-emerald-50"
            >
              Great job staying productive!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
