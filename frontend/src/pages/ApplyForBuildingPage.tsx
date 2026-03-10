import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import ScrollReveal from '@/components/ScrollReveal'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Mail, Phone, User, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { submitBuildingApplication } from '@/services/api'
import type { BuildingApplicationPayload }
  from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const defaultForm: BuildingApplicationPayload = {
  full_name: '',
  phone: '',
  building_name: '',
  address: '',
  building_type: '',
  space_size: '',
  additional_info: '',
}

export default function ApplyForBuildingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<BuildingApplicationPayload>(defaultForm)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (key: keyof BuildingApplicationPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return

    if (!user) {
      setError('Please sign in to apply.')
      return
    }

    if (!agreed) {
      setError('Please agree to be contacted before submitting.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await submitBuildingApplication(form)
      setSuccess(true)
      setForm(defaultForm)
      setAgreed(false)
    } catch (err) {
      setError('Could not send your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Header skeleton */}
              <div className="text-center space-y-4">
                <Skeleton className="h-8 w-48 mx-auto rounded-full" />
                <Skeleton className="h-12 w-80 mx-auto rounded-lg" />
                <Skeleton className="h-5 w-96 mx-auto rounded-lg" />
              </div>
              {/* Form card skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-12 w-48 rounded-xl" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  if (!loading && !user) {
    return (
      <Layout>
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Building Application</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Sign in to apply</h1>
              <p className="text-lg text-muted-foreground">Please sign in so we can attach your email to the application.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/sign-in')}>Go to Sign In</Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Building Application</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-6xl font-bold"
            >
              Apply for{' '}
              <span className="text-primary">Your Building</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-muted-foreground"
            >
              Transform your building into an urban farm. Fill out the form below and our team will get in touch with you.
            </motion.p>
          </div>

          <ScrollReveal>
          <Card className="max-w-3xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Building Application Form</CardTitle>
              <p className="text-muted-foreground">
                Please provide your details and we'll reach out to discuss how UrbanRoots can work for your building.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>Full Name</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.full_name}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>Email Address</span>
                    </label>
                    <input
                      disabled
                      type="email"
                      value={user?.email ?? ''}
                      placeholder="Sign in to apply"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">We will use your signed-in email for this application.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>Building Name</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.building_name}
                      onChange={(e) => updateField('building_name', e.target.value)}
                      placeholder="Green Heights Apartments"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Building Address</span>
                  </label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Green Street, City, State, PIN Code"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Building Type</label>
                  <select
                    required
                    aria-label="Building type"
                    value={form.building_type}
                    onChange={(e) => updateField('building_type', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select building type</option>
                    <option value="residential">Residential Apartment</option>
                    <option value="commercial">Commercial Building</option>
                    <option value="mixed">Mixed Use</option>
                    <option value="society">Housing Society</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Space (approx.)</label>
                  <select
                    required
                    aria-label="Available space size"
                    value={form.space_size}
                    onChange={(e) => updateField('space_size', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select space size</option>
                    <option value="small">Small (&lt; 500 sq ft)</option>
                    <option value="medium">Medium (500-1000 sq ft)</option>
                    <option value="large">Large (1000-2000 sq ft)</option>
                    <option value="xlarge">Extra Large (&gt; 2000 sq ft)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Information</label>
                  <textarea
                    value={form.additional_info}
                    onChange={(e) => updateField('additional_info', e.target.value)}
                    placeholder="Tell us about your building, available spaces (rooftop, terrace, ground), number of residents, and any specific requirements..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to be contacted by UrbanRoots regarding this application and understand that my information will be used in accordance with the privacy policy.
                  </label>
                </div>

                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

                <Button
                  size="lg"
                  type="submit"
                  disabled={submitting}
                  className="w-full text-lg py-6 rounded-xl flex items-center justify-center"
                >
                  {submitting ? 'Sending...' : 'Submit Application'}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Our team will review your application and contact you within 2-3 business days.
                </p>
              </form>
            </CardContent>
          </Card>
          </ScrollReveal>
        </div>
      </section>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-w-md w-full bg-background border border-primary/20 rounded-2xl shadow-xl p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-semibold">Application sent</h2>
            <p className="text-muted-foreground">
              We emailed a copy to you and shared your application with the UrbanRoots team. We will get back to you soon.
            </p>
            <Button onClick={() => setSuccess(false)} className="w-full">Close</Button>
          </div>
        </div>
      )}
    </Layout>
  )
}
