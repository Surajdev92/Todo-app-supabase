import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className={cn('animate-spin rounded-full h-8 w-8 border-b-2 border-primary', className)}
        aria-label="Loading"
      />
    </div>
  )
}
