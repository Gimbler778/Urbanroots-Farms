import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, UserCircle2, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import UrbanRootsLogo from './UrbanRootsLogo'
import { useSession } from '@/lib/auth-client'
import { Badge } from './ui/badge'
import { useCart } from '@/contexts/CartContext'

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { data: session } = useSession()
  const { getCartItemsCount } = useCart()

  const navItems = [
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
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
            onClick={scrollToTop}
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
                onClick={scrollToTop}
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
            
            {/* Cart Icon */}
            <Link
              to="/cart"
              onClick={scrollToTop}
              className={cn(
                "relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                isActive('/cart')
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartItemsCount() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                  {getCartItemsCount()}
                </Badge>
              )}
            </Link>
            
            {/* Auth Buttons */}
            <div className="ml-4 flex items-center gap-2">
              {session?.user ? (
                <>
                  <Link
                    to="/sign-out"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
                    )}
                  >
                    <UserCircle2 className="w-5 h-5" />
                    <span>{session.user.name}</span>
                    <LogOut className="w-4 h-4 ml-1" />
                  </Link>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
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
                onClick={() => { setIsOpen(false); scrollToTop(); }}
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
            
            {/* Mobile Cart Link */}
            <Link
              to="/cart"
              onClick={() => { setIsOpen(false); scrollToTop(); }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all relative",
                isActive('/cart')
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {getCartItemsCount() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                  {getCartItemsCount()}
                </Badge>
              )}
            </Link>
            
            {/* Mobile Auth Links */}
            <div className="border-t border-primary/20 pt-2 mt-2">
              {session?.user ? (
                <>
                  <Link
                    to="/sign-out"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
                    )}
                  >
                    <UserCircle2 className="w-5 h-5" />
                    <span>{session.user.name}</span>
                    <LogOut className="w-4 h-4 ml-auto" />
                  </Link>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    "text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
