import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { CartProvider } from './contexts/CartContext'
import ScrollToTop from './components/ScrollToTop'
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
import CartPage from './pages/CartPage'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="urbanroots-theme">
      <CartProvider>
        <Router>
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
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-out" element={<SignOutPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Router>
      </CartProvider>
    </ThemeProvider>
  )
}

export default App
