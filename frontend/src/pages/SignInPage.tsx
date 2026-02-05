import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import eyeopen from '../assets/eye_open.png'
import eyeclosed from '../assets/eye-close.svg'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function SignInPage() {
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
  }

  const isPasswordValid = Object.values(passwordRules).every(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const API_BASE = "http://127.0.0.1:8000/api/auth"

    try {
      if (isSignUp) {
        if (!isPasswordValid) throw new Error("Password requirements not met")
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match")

        await axios.post(`${API_BASE}/sign-up/email`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })

        navigate("/verify-email", { state: { email: formData.email } })
      } else {
        const response = await axios.post(
          `${API_BASE}/sign-in`,
          {
            email: formData.email,
            password: formData.password,
          },
          { withCredentials: true }
        )

        if (response.data.user) {
          navigate("/dashboard")
        }
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Something went wrong or Password not match"
      if (detail.includes("Email not verified")) {
        setError("Email not verified. Please signup again.")
        setIsSignUp(true)
      } else {
        setError(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  const Rule = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      <span className={valid ? 'text-green-600' : 'text-red-400'}>
        {valid ? '✔' : '✖'}
      </span>
      <p className={`text-xs ${valid ? 'text-green-700' : 'text-gray-500'}`}>{text}</p>
    </div>
  )

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-t-4 border-t-green-600">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-800">
                {isSignUp ? 'Create an account' : 'Sign in'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp ? 'Join UrbanRoots today' : 'Welcome back to UrbanRoots'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      name="name"
                      placeholder='Enter full name here'
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder='Enter email here'
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Input
                      name="password"
                      placeholder='Enter password here'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="pr-10"
                      required
                    />
                    <img
                      src={showPassword ? eyeopen : eyeclosed}
                      alt="toggle"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer opacity-60"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </div>

                  {isSignUp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1"
                    >
                      <Rule valid={passwordRules.length} text="Minimum 8 characters" />
                      <Rule valid={passwordRules.uppercase} text="At least one uppercase" />
                      <Rule valid={passwordRules.lowercase} text="At least one lowercase" />
                      <Rule valid={passwordRules.number} text="At least one number" />
                      <Rule valid={passwordRules.special} text="Special character (!@#$%^&*)" />
                    </motion.div>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        placeholder="Repeat password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="pr-10"
                      />
                      <img
                        src={showConfirmPassword ? eyeopen : eyeclosed}
                        alt="toggle"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer opacity-60"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </div>
                  </div>
                )}

                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-green-600 font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 h-11 text-base transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                }}
                className="text-sm text-gray-600"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span className="text-green-600 font-bold hover:underline">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}