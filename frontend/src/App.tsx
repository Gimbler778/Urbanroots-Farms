import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ApplyForBuildingPage from './pages/ApplyForBuildingPage'
import ReferFriendPage from './pages/ReferFriendPage'
import RentAPodPage from './pages/RentAPodPage'
import SignInPage from './pages/SignInPage'
import SignOutPage from './pages/SignOutPage'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="urbanroots-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/apply-for-building" element={<ApplyForBuildingPage />} />
          <Route path="/refer-friend" element={<ReferFriendPage />} />
          <Route path="/rent-a-pod" element={<RentAPodPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-out" element={<SignOutPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
