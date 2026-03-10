import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, ShoppingCart, Pencil, LogOut } from 'lucide-react'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import UrbanRootsLogo from './UrbanRootsLogo'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from './ui/badge'
import { useCart } from '@/contexts/CartContext'

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navItems = [
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Apply for My Building', path: '/apply-for-building' },
    { name: 'Refer to a Friend', path: '/refer-friend' },
    { name: 'Rent a Pod', path: '/rent-a-pod' },
  ]

  const isActive = (path: string) => location.pathname === path

  const avatarSeed = user?.avatarSeed || user?.email || 'default'
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    setShowDropdown(true)
  }

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => setShowDropdown(false), 150)
  }

  const handleLogout = async () => {
    setShowDropdown(false)
    setIsOpen(false)
    await logout()
    navigate('/')
  }

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
              <span className="text-[hsl(var(--earth-brown))]" style={{ marginLeft: '0.25rem' }}>Farms</span>
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
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "text-primary"
                    : "text-foreground/70 hover:text-[hsl(var(--earth-brown))]"
                )}
              >
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
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

            {/* Auth */}
            <div className="ml-4 flex items-center gap-2">
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="rounded-full overflow-hidden w-9 h-9 ring-2 ring-primary/40 hover:ring-primary transition-all bg-white"
                    aria-label="User menu"
                  >
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="w-8 h-8 rounded-full ring-1 ring-primary/30 bg-white object-cover"
                        />
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                      </div>

                      <button
                        onClick={() => { setShowDropdown(false); navigate('/profile') }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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
        <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden pb-4 space-y-2"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { setIsOpen(false); scrollToTop() }}
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

            <Link
              to="/cart"
              onClick={() => { setIsOpen(false); scrollToTop() }}
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

            <div className="border-t border-primary/20 pt-2 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-9 h-9 rounded-full ring-2 ring-primary/30 bg-white object-cover"
                    />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.name}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-[hsl(var(--earth-brown))] hover:bg-[hsl(var(--earth-brown))]/10 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
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
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
