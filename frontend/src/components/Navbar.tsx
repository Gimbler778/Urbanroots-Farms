import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import UrbanRootsLogo from './UrbanRootsLogo'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: 'About', path: '/about' },
    { name: 'Apply for My Building', path: '/apply-for-building' },
    { name: 'Refer to a Friend', path: '/refer-friend' },
    { name: 'Rent a Pod', path: '/rent-a-pod' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-md shadow-sm shadow-primary/4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-end space-x-2 hover:opacity-80 transition-opacity"
          >
            <UrbanRootsLogo className="w-12 h-12 text-primary" />
            <span className="text-xl font-bold pb-1">
              <span className="text-primary">UrbanRoots</span>
              <span className="text-[hsl(var(--earth-brown))]" style={{marginLeft: '0.25rem'}}>Farms</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive(item.path)
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive(item.path)
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
