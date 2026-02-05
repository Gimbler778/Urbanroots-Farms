import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { redirect, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import eyeopen from "../assets/eye_open.png"
import eyeclosed from "../assets/eye-close.svg"

export default function ForgotPassword() {
    const API_BASE = "http://127.0.0.1:8000/api/auth"
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [timer, setTimer] = useState(30)
    const [canResend, setCanResend] = useState(false)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const passwordRules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password),
    }

    const isPasswordValid = Object.values(passwordRules).every(Boolean)

    useEffect(() => {
        if (step !== 2) return

        if (timer <= 0) {
            setCanResend(true)
            return
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [timer, step])

    const Rule = ({ valid, text }: any) => (
        <div className="flex items-center gap-2">
            <span className={valid ? "text-green-600" : "text-red-500"}>
                {valid ? "✔" : "✖"}
            </span>
            <p className={valid ? "text-green-700 text-sm" : "text-red-500 text-sm"}>
                {text}
            </p>
        </div>
    )

    const handleSendEmail = async () => {
        if (!email) {
            setError("Email is required");
            return;
        }
        setLoading(true);
        setError("");

        try {
            await axios.post(`${API_BASE}/forgot-password-email`, { email });
            setStep(2);
            setTimer(30);
            setCanResend(false);
        } catch (err: any) {
            setLoading(false);
            const detail = err.response?.data?.detail;

            if (err.response?.status === 404 || detail === "User not found") {
                alert("Email not registered. Please check your email.");
                setEmail("");
                setError("");
                setStep(1);
            } else {
                setError(detail || "Failed to send OTP");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleResendOtp = async () => {
        if (!canResend) return

        setLoading(true)
        setError("")

        try {
            await axios.post(`${API_BASE}/forgotpassword-resend-otp`, { email })

            setTimer(30)
            setCanResend(false)
            setOtp(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()

        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to resend OTP")
        } finally {
            setLoading(false)
        }
    }

    const handleOtpChange = (val: string, i: number) => {
        if (!/^\d?$/.test(val)) return

        const newOtp = [...otp]
        newOtp[i] = val
        setOtp(newOtp)

        if (val && i < 5) inputRefs.current[i + 1]?.focus()
    }

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join("")

        if (enteredOtp.length !== 6) {
            setError("Enter full OTP")
            return
        }

        setLoading(true)
        setError("")

        try {
            await axios.post(`${API_BASE}/verify-forgot-otp`, {
                email,
                otp: enteredOtp,
            })

            setStep(3)

        } catch (err: any) {
            setError(err.response?.data?.detail)
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!isPasswordValid) {
            setError("Password rules not satisfied")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            await axios.post(`${API_BASE}/reset-password`, {
                email,
                newPassword: password,
            })

            alert("Password updated successfully")
            navigate("/sign-in")

        } catch (err: any) {
            setError(err.response?.data?.detail)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen flex justify-center items-center">
                <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">

                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-bold">
                            Forgot Password
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        {step === 1 && (
                            <>
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="w-full border p-3 rounded"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <Button onClick={handleSendEmail} disabled={loading}>
                                    {loading ? "Sending OTP..." : "Send OTP"}
                                </Button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="flex justify-between">
                                    {otp.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => (inputRefs.current[i] = el)}
                                            maxLength={1}
                                            value={d}
                                            onChange={(e) => handleOtpChange(e.target.value, i)}
                                            className="w-12 h-12 text-center border rounded"
                                        />
                                    ))}
                                </div>

                                <Button onClick={handleVerifyOtp} disabled={loading}>
                                    Verify OTP
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
                                        <span>Resend OTP in {timer}s</span>
                                    )}
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        className="w-full border p-3 rounded pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <img
                                        src={showPassword ? eyeopen : eyeclosed}
                                        className="absolute right-3 top-3 w-5 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="w-full border p-3 rounded pr-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <img
                                        src={showConfirmPassword ? eyeopen : eyeclosed}
                                        className="absolute right-3 top-3 w-5 cursor-pointer"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                    />
                                </div>

                                <div className="bg-gray-50 border rounded-lg p-3 space-y-1">
                                    <Rule valid={passwordRules.length} text="Minimum 8 characters" />
                                    <Rule valid={passwordRules.uppercase} text="Uppercase letter" />
                                    <Rule valid={passwordRules.lowercase} text="Lowercase letter" />
                                    <Rule valid={passwordRules.number} text="Number" />
                                    <Rule valid={passwordRules.special} text="Special character (!@#$%^&*)" />
                                </div>

                                <Button onClick={handleResetPassword}>
                                    Reset Password
                                </Button>
                            </>
                        )}

                        {error && <p className="text-red-500">{error}</p>}

                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}
