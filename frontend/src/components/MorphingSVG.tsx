import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function MorphingSVG() {
  const plantRef = useRef<SVGGElement>(null)
  const buildingRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.5 })

    // Start with plant visible, building hidden
    gsap.set(buildingRef.current, { opacity: 0, scale: 0.8 })
    gsap.set(plantRef.current, { opacity: 1, scale: 1 })

    // Animate: Plant fades out while building fades in
    tl.to(plantRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1.5,
      ease: 'power2.inOut',
    })
      .to(
        buildingRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: 'power2.inOut',
        },
        '<' // Start at the same time
      )
      .to({}, { duration: 1.2 }) // Pause

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div className="fixed bottom-8 right-8 w-32 h-32 opacity-35 hover:opacity-55 transition-opacity duration-500 pointer-events-none z-50">
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Plant Group */}
        <g ref={plantRef} transform="translate(60, 60)">
          {/* Plant stem */}
          <path
            d="M 0,-15 Q -2,-5 0,25"
            stroke="hsl(142 71% 45%)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left leaf */}
          <path
            d="M 0,0 Q -25,-10 -30,-5 Q -25,-3 0,5"
            fill="hsl(142 71% 45%)"
            opacity="0.8"
          />
          {/* Right leaf */}
          <path
            d="M 0,10 Q 25,0 30,5 Q 25,7 0,15"
            fill="hsl(142 71% 45%)"
            opacity="0.8"
          />
          {/* Top leaves */}
          <circle cx="-8" cy="-15" r="8" fill="hsl(142 71% 45%)" opacity="0.7" />
          <circle cx="8" cy="-18" r="7" fill="hsl(142 71% 45%)" opacity="0.7" />
          <circle cx="0" cy="-22" r="9" fill="hsl(142 71% 45%)" opacity="0.9" />
          {/* Roots */}
          <path
            d="M 0,25 Q -8,30 -12,35 M 0,25 Q 8,30 12,35"
            stroke="hsl(30 35% 55%)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>

        {/* Building Group */}
        <g ref={buildingRef} transform="translate(60, 60)">
          {/* Main building body */}
          <rect
            x="-20"
            y="-15"
            width="40"
            height="50"
            fill="hsl(142 71% 45%)"
            opacity="0.7"
            rx="2"
          />
          {/* Building windows - 3x4 grid */}
          <rect x="-15" y="-10" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="-15" y="2" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="-15" y="14" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="-3" y="-10" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="-3" y="2" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="-3" y="14" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="9" y="-10" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="9" y="2" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          <rect x="9" y="14" width="8" height="8" fill="white" opacity="0.3" rx="1" />
          {/* Roof */}
          <path
            d="M -25,-15 L 0,-28 L 25,-15 Z"
            fill="hsl(142 71% 35%)"
            opacity="0.8"
          />
          {/* Door */}
          <rect
            x="-6"
            y="26"
            width="12"
            height="9"
            fill="hsl(30 35% 55%)"
            opacity="0.6"
            rx="1"
          />
          {/* Foundation */}
          <rect
            x="-22"
            y="35"
            width="44"
            height="3"
            fill="hsl(30 35% 55%)"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  )
}
