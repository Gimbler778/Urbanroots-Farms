export default function UrbanRootsLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Building */}
      <g transform="translate(30, 45)">
        {/* Main building */}
        <rect x="0" y="10" width="14" height="25" fill="currentColor" opacity="0.8"/>
        <rect x="16" y="5" width="16" height="30" fill="currentColor" opacity="0.9"/>
        <rect x="34" y="12" width="12" height="23" fill="currentColor" opacity="0.8"/>
        
        {/* Windows */}
        <rect x="3" y="14" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="8" y="14" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="3" y="20" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="8" y="20" width="3" height="3" fill="white" opacity="0.4"/>
        
        <rect x="20" y="10" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="25" y="10" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="20" y="16" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="25" y="16" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="20" y="22" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="25" y="22" width="3" height="3" fill="white" opacity="0.4"/>
        
        <rect x="37" y="16" width="3" height="3" fill="white" opacity="0.4"/>
        <rect x="37" y="22" width="3" height="3" fill="white" opacity="0.4"/>
      </g>
      
      {/* Leaf sprouting from building */}
      <g transform="translate(50, 20)">
        {/* Stem */}
        <line x1="23" y1="25" x2="23" y2="45" stroke="currentColor" strokeWidth="2" opacity="0.9"/>
        
        {/* Main leaf */}
        <path 
          d="M 23 25 Q 15 20, 10 22 Q 8 24, 10 28 Q 15 32, 23 30 Z" 
          fill="currentColor"
        />
        <path 
          d="M 23 25 Q 31 20, 36 22 Q 38 24, 36 28 Q 31 32, 23 30 Z" 
          fill="currentColor"
          opacity="0.85"
        />
        
        {/* Smaller leaves */}
        <path 
          d="M 23 32 Q 17 30, 14 32 Q 13 34, 15 36 Q 19 38, 23 36 Z" 
          fill="currentColor"
          opacity="0.9"
        />
        <path 
          d="M 23 32 Q 29 30, 32 32 Q 33 34, 31 36 Q 27 38, 23 36 Z" 
          fill="currentColor"
          opacity="0.85"
        />
      </g>
    </svg>
  )
}
