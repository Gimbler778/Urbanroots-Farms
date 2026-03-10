import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Delay in seconds before animation starts */
  delay?: number
  /** Whether to blur the section when out of view (default: true) */
  withBlur?: boolean
  /** Whether to animate only once (default: false — re-animates on re-entry) */
  once?: boolean
  /** y-offset to start from (default: 50) */
  yOffset?: number
}

/**
 * Wraps children in a scroll-triggered animation.
 * When in view: slides up + unblurs.
 * When out of view (once=false): returns to blurred/shifted state.
 */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
  withBlur = true,
  once = false,
  yOffset = 50,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={cn('will-change-[opacity,transform,filter]', className)}
      initial={{
        opacity: 0,
        y: yOffset,
        filter: withBlur ? 'blur(8px)' : 'blur(0px)',
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  )
}
