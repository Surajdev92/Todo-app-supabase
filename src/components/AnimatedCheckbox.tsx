import { motion } from 'framer-motion'

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function AnimatedCheckbox({
  checked,
  onChange,
  disabled = false,
  className = '',
}: AnimatedCheckboxProps) {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.input
        type="checkbox"
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <motion.button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative h-5 w-5 rounded border-2 transition-colors ${
          checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        {checked && (
          <>
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
            {/* Checkmark SVG */}
            <motion.svg
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M4 10L8 14L16 6"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </motion.svg>
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
