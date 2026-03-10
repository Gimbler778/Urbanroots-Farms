import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: ReactNode
  className?: string
  /** Glow colour — defaults to primary HSL token */
  glowColor?: string
  /** Whether to lift/scale the card on hover */
  lift?: boolean
}

/**
 * An interactive card that renders a soft radial glow that follows the
 * mouse cursor and adds a glowing border + subtle lift on hover.
 * Inspired by Aceternity UI / Magic UI glow effect.
 */
export default function GlowCard({
  children,
  className,
  lift = true,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const rotateY = ((x / rect.width) * 2 - 1) * 6
      const rotateX = -(((y / rect.height) * 2 - 1) * 6)

      // Use actual mouse position for smooth border tracking
      setGlowPos({ x, y })
      setTilt({ x: rotateX, y: rotateY })
    }
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-card transition-colors duration-300 group [transform-style:preserve-3d]',
        hovered && 'border-primary/50',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: lift ? tilt.x : 0,
        rotateY: lift ? tilt.y : 0,
        y: lift && hovered ? -8 : 0,
        scale: lift && hovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 240, damping: 18, mass: 0.5 }}
    >
      {/* Inner glow effect following mouse */}
      <div
        className="pointer-events-none absolute inset-0 ease-out"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${glowPos.x}px ${glowPos.y}px, rgba(170, 220, 140, 0.25), transparent 65%)`,
          transition: 'opacity 300ms ease-out',
        }}
      />

      {/* Outer glow/halo effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ease-out"
        style={{
          opacity: hovered ? 1 : 0,
          boxShadow: `0 0 60px 4px rgba(170, 220, 140, 0.3), 0 0 100px 8px rgba(170, 220, 140, 0.2)`,
          transition: 'opacity 300ms ease-out',
        }}
      />

      {/* Animated border glow following mouse along entire border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: hovered ? 0.8 : 0,
          background: `radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(170, 220, 140, 0.5), transparent 40%)`,
          maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '2px',
          transition: 'opacity 300ms ease-out',
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
