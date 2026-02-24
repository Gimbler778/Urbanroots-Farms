import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Layout from '../components/Layout'
import { Button } from '../components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const API_BASE = 'http://localhost:8000/api/auth'

const AVATAR_SEEDS = [
  'Lucky', 'Shadow', 'Biscuit', 'Cookie', 'Peanut', 'Coco',
  'Jasmine', 'Olive', 'Cedar', 'Maple', 'River', 'Storm',
  'Mango', 'Pepper', 'Dusty', 'Sunny', 'Clover', 'Ember',
  'Hazel', 'Sable', 'Frost', 'Blaze', 'Dune', 'Sage',
  'Rusty', 'Finch', 'Wren', 'Briar', 'Vale', 'Wisp',
]

export default function ProfilePage() {
  const { user, logout, setUser, refreshSession } = useAuth()
  const navigate = useNavigate()

  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || user?.email || 'default')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/sign-in')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user) {
      setAvatarSeed(user.avatarSeed || user.email || 'default')
      setBio(user.bio || '')
    }
  }, [user])

  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`

  const handleRandomizeAvatar = () => {
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)]
    setAvatarSeed(randomSeed)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await axios.put(
        `${API_BASE}/update-profile`,
        { bio, avatarSeed },
        { withCredentials: true }
      )
      setUser({ ...user!, ...res.data.user })
      await refreshSession()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gray-50/30">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-primary/10 px-6 py-5 border-b border-primary/10">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 bg-white shadow-md">
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Seed: <span className="font-mono">{avatarSeed}</span></p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomizeAvatar}
                className="border-primary/40 text-primary hover:bg-primary/5"
              >
                🎲 Change Avatar
              </Button>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); setSaved(false) }}
                placeholder="Tell us a little about yourself…"
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
            )}

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary hover:bg-primary/90 h-10"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : saved ? '✓ Saved!' : 'Save Changes'}
            </Button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-2 text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
