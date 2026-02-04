import { motion } from 'framer-motion'

export function BackgroundDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]" aria-hidden="true">
      {/* Floating particles / dots – visible above content */}
      {[...Array(25)].map((_, i) => {
        const size = Math.random() * 6 + 4
        const x = Math.random() * 100
        const y = Math.random() * 100
        const duration = Math.random() * 20 + 15
        const delay = Math.random() * 5

        return (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full bg-emerald-500/50 shadow-sm"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.4, 0.8, 0.4],
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

      {/* Rotating Triangles */}
      {[...Array(8)].map((_, i) => {
        const size = Math.random() * 40 + 20
        const x = Math.random() * 100
        const y = Math.random() * 100
        const duration = Math.random() * 15 + 10
        const delay = Math.random() * 3

        return (
          <motion.div
            key={`triangle-${i}`}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              rotate: {
                duration,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: duration * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: {
                duration: duration * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              delay,
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 10 L90 80 L10 80 Z"
                fill="currentColor"
                className="text-emerald-300/30"
              />
            </svg>
          </motion.div>
        )
      })}

      {/* Floating Circles */}
      {[...Array(12)].map((_, i) => {
        const size = Math.random() * 60 + 30
        const x = Math.random() * 100
        const y = Math.random() * 100
        const duration = Math.random() * 25 + 20
        const delay = Math.random() * 5

        return (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full border-2 border-emerald-300/20"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.cos(i) * 30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
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

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-emerald-500"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Lines */}
      {[...Array(6)].map((_, i) => {
        const isVertical = i % 2 === 0
        const position = (i + 1) * 15 + Math.random() * 10

        return (
          <motion.div
            key={`line-${i}`}
            className={`absolute bg-gradient-to-${isVertical ? 'b' : 'r'} from-emerald-200/10 via-transparent to-transparent`}
            style={{
              [isVertical ? 'left' : 'top']: `${position}%`,
              [isVertical ? 'width' : 'height']: '1px',
              [isVertical ? 'height' : 'width']: '100%',
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        )
      })}

      {/* Pulsing Rings */}
      {[...Array(5)].map((_, i) => {
        const size = (i + 1) * 80
        const x = Math.random() * 100
        const y = Math.random() * 100
        const duration = (i + 1) * 3

        return (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border border-emerald-300/15"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              marginLeft: `-${size / 2}px`,
              marginTop: `-${size / 2}px`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        )
      })}
    </div>
  )
}
