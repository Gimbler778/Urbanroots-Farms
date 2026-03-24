import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './hooks/useAuth'
import ScrollToTop from './components/ScrollToTop'
import RouteSkeletonOverlay from './components/RouteSkeletonOverlay'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ApplyForBuildingPage from './pages/ApplyForBuildingPage'
import ReferFriendPage from './pages/ReferFriendPage'
import RentAPodPage from './pages/RentAPodPage'
import SignInPage from './pages/SignInPage'
import SignOutPage from './pages/SignOutPage'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import PodDetailPage from './pages/PodDetailPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProductOrdersPage from './pages/AdminProductOrdersPage'
import AdminCatalogPage from './pages/AdminCatalogPage'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="urbanroots-theme">
      <AuthProvider>
        <CartProvider>
          <Router>
            <RouteSkeletonOverlay />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/apply-for-building" element={<ApplyForBuildingPage />} />
              <Route path="/refer-friend" element={<ReferFriendPage />} />
              <Route path="/rent-a-pod" element={<RentAPodPage />} />
              <Route path="/rent-a-pod/:podId" element={<PodDetailPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-out" element={<SignOutPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/product-orders" element={<AdminProductOrdersPage />} />
              <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
