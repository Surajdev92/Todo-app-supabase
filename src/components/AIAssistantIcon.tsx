import { motion } from 'framer-motion'

interface AIAssistantIconProps {
  className?: string
  size?: number
}

export function AIAssistantIcon({ className = '', size = 48 }: AIAssistantIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer glow circle */}
      <motion.circle
        cx="60"
        cy="60"
        r="55"
        fill="url(#gradient1)"
        opacity="0.2"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main robot head */}
      <motion.rect
        x="25"
        y="30"
        width="70"
        height="70"
        rx="12"
        fill="url(#gradient2)"
        stroke="url(#gradient3)"
        strokeWidth="2"
        initial={{ y: 30 }}
        animate={{
          y: [30, 28, 30],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Antenna */}
      <motion.circle
        cx="60"
        cy="25"
        r="4"
        fill="#10b981"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.line
        x1="60"
        y1="25"
        x2="60"
        y2="30"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <motion.circle
        cx="45"
        cy="55"
        r="8"
        fill="#ffffff"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.circle
        cx="75"
        cy="55"
        r="8"
        fill="#ffffff"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
      />

      {/* Pupils */}
      <motion.circle
        cx="45"
        cy="55"
        r="4"
        fill="#10b981"
        animate={{
          x: [0, 2, -2, 0],
          y: [0, -1, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.circle
        cx="75"
        cy="55"
        r="4"
        fill="#10b981"
        animate={{
          x: [0, -2, 2, 0],
          y: [0, -1, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
      />

      {/* Mouth/Speaker */}
      <motion.rect
        x="50"
        y="70"
        width="20"
        height="8"
        rx="4"
        fill="#10b981"
        animate={{
          scaleY: [1, 1.2, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Decorative dots */}
      <motion.circle
        cx="35"
        cy="45"
        r="2"
        fill="#10b981"
        opacity="0.6"
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0,
        }}
      />
      <motion.circle
        cx="85"
        cy="45"
        r="2"
        fill="#10b981"
        opacity="0.6"
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Floating particles */}
      <motion.circle
        cx="20"
        cy="40"
        r="3"
        fill="#10b981"
        opacity="0.4"
        animate={{
          y: [0, -10, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.circle
        cx="100"
        cy="80"
        r="2.5"
        fill="#10b981"
        opacity="0.4"
        animate={{
          y: [0, -8, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.7,
        }}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="100%" stopColor="#059669" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1fae5" stopOpacity="1" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}
