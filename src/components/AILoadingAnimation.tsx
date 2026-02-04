import { motion } from 'framer-motion'

export function AILoadingAnimation() {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2 w-2 rounded-full bg-white"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2,
          }}
        />
      ))}
      <motion.span
        className="ml-2 text-sm text-white"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        Thinking...
      </motion.span>
    </div>
  )
}
