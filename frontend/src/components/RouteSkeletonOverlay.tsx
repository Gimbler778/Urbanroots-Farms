import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

export default function RouteSkeletonOverlay() {
  const location = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Delay showing skeleton by 200ms - if content loads fast, never show
    const showDelay = setTimeout(() => setShow(true), 200)
    
    // If skeleton shows, keep it visible for minimum 400ms to avoid flashing
    const hideDelay = setTimeout(() => setShow(false), 600)

    return () => {
      clearTimeout(showDelay)
      clearTimeout(hideDelay)
    }
  }, [location.pathname])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] pointer-events-none bg-background/90 backdrop-blur-sm"
          aria-hidden="true"
        >
          <div className="container mx-auto px-4 pt-24">
            <div className="space-y-6">
              <Skeleton className="h-10 w-56 rounded-xl" />
              <Skeleton className="h-5 w-[32rem] max-w-full rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </div>
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
