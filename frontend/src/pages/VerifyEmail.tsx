import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import axios from "axios"

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const API_BASE = "http://127.0.0.1:8000/api/auth"

  useEffect(() => {
    if (!email) navigate("/signin")
  }, [email, navigate])

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true)
      return
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("")

    if (enteredOtp.length !== 6) {
      setError("Please enter 6 digits")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        `${API_BASE}/verify-email`,
        { email, otp: enteredOtp },
        { withCredentials: true }
      )

      if (response.data.status === "success") {
        navigate("/dashboard")
      }

    } catch (err: any) {
      setError(err.response?.data?.detail || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return

    setLoading(true)
    setError("")

    try {
      await axios.post(`${API_BASE}/resend-otp`, { email })

      setCanResend(false)
      setTimer(30)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()

    } catch {
      setError("Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg border-t-4 border-t-green-600">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Verify Your Email
              </CardTitle>
              <p className="text-center text-sm text-gray-500">
                Sent to <span className="font-semibold">{email}</span>
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-xl border-2 rounded-lg focus:border-green-500"
                  />
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center text-sm">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend code in {timer}s</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}
