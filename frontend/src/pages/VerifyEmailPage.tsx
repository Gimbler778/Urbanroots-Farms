import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/auth/verify-email?token=${token}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        )

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.detail || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
        console.error('Verification error:', error)
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Email Verification
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' ? 'Verifying your email...' : 
               status === 'success' ? 'Verification complete!' : 
               'Verification failed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-center text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-600" />
                <div className="text-center space-y-2">
                  <p className="font-semibold text-green-700">{message}</p>
                  <p className="text-sm text-gray-600">
                    You'll be redirected to the home page in a moment...
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Go to Home Page
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-600" />
                <div className="text-center space-y-2">
                  <p className="font-semibold text-red-700">{message}</p>
                  <p className="text-sm text-gray-600">
                    Please try signing up again or contact support if the problem persists.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/sign-in')}
                    variant="outline"
                  >
                    Back to Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Go to Home Page
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
