import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { authClient } from '../lib/auth-client'

export default function SignOutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await authClient.signOut()
        navigate('/')
      } catch (error) {
        console.error('Sign out error:', error)
        // Still redirect even if there's an error
        navigate('/')
      }
    }

    performSignOut()
  }, [navigate])

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Signing out...</h2>
          <p className="text-gray-600">Please wait while we sign you out.</p>
        </div>
      </div>
    </Layout>
  )
}
