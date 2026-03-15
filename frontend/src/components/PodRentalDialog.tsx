import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Sprout,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPodRental } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { podPlansById, type PodPlan } from '@/data/podPlans'
import type { PodRentalRequest, PodRentalResponse } from '@/types'

interface PodRentalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pod: PodPlan | null
}

type FormState = PodRentalRequest

const initialFormState = (podId: PodRentalRequest['pod_plan_id'] = 'standard'): FormState => ({
  pod_plan_id: podId,
  full_name: '',
  email: '',
  phone: '',
  installation_address: '',
  city: '',
  state: '',
  zip_code: '',
  preferred_start_date: '',
  rental_term_months: 12,
  building_name: '',
  location_type: 'Residential Building',
  growing_goals: '',
  notes: '',
  terms_accepted: false,
})

const stepLabels = ['Your Details', 'Installation Plan', 'Review & Submit']

export default function PodRentalDialog({ open, onOpenChange, pod }: PodRentalDialogProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<PodRentalResponse | null>(null)
  const [form, setForm] = useState<FormState>(initialFormState(pod?.id ?? 'standard'))

  useEffect(() => {
    if (!open) {
      return
    }

    const nextPlanId = pod?.id ?? 'standard'
    setStep(0)
    setError('')
    setSuccess(null)
    setForm((current) => ({
      ...initialFormState(nextPlanId),
      full_name: user?.name ?? current.full_name,
      email: user?.email ?? current.email,
    }))
  }, [open, pod, user])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const selectedPod = podPlansById[form.pod_plan_id]

  const requiredFieldChecks = useMemo(
    () => [
      Boolean(form.full_name.trim()),
      Boolean(form.email.trim()),
      Boolean(form.phone.trim()),
      Boolean(form.installation_address.trim()),
      Boolean(form.city.trim()),
      Boolean(form.state.trim()),
      Boolean(form.zip_code.trim()),
      Boolean(form.preferred_start_date),
      Boolean(form.location_type.trim()),
      Boolean(form.rental_term_months),
      form.terms_accepted,
    ],
    [form]
  )

  const completion = Math.round((requiredFieldChecks.filter(Boolean).length / requiredFieldChecks.length) * 100)

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const resetAndClose = () => {
    setForm(initialFormState(pod?.id ?? 'standard'))
    setStep(0)
    setSubmitting(false)
    setError('')
    setSuccess(null)
    onOpenChange(false)
  }

  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
        setError('Fill in your name, email, and phone number before continuing.')
        return false
      }
    }

    if (step === 1) {
      if (
        !form.installation_address.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !form.zip_code.trim() ||
        !form.preferred_start_date
      ) {
        setError('Complete the installation address and preferred start date before continuing.')
        return false
      }
    }

    if (step === 2 && !form.terms_accepted) {
      setError('Accept the terms to start your rental request.')
      return false
    }

    setError('')
    return true
  }

  const handleNext = () => {
    if (!validateStep()) {
      return
    }
    setStep((current) => Math.min(current + 1, stepLabels.length - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep()) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await createPodRental(form)
      setSuccess(response)
    } catch (submissionError: any) {
      setError(submissionError?.response?.data?.detail || 'Unable to start the rental request right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && pod ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-md"
            onClick={resetAndClose}
            aria-label="Close rental dialog"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/60 bg-background/95 shadow-[0_30px_90px_rgba(25,42,30,0.28)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-primary/10">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-[hsl(var(--earth-brown))] to-primary"
                animate={{ width: `${success ? 100 : completion}%` }}
              />
            </div>

            <div className="grid lg:grid-cols-[1.05fr_1.45fr]">
              <div className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(105,182,93,0.24),_transparent_45%),linear-gradient(180deg,rgba(245,250,244,0.95),rgba(237,244,235,0.88))] p-6 lg:border-b-0 lg:border-r">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="absolute right-4 top-4 rounded-full border border-primary/15 bg-white/80 p-2 text-foreground/70 transition-colors hover:text-primary"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  <Sprout className="h-3.5 w-3.5" />
                  Rental Request
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-primary/80">Selected plan</p>
                    <h2 className="mt-2 text-3xl font-bold">{selectedPod.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedPod.tagline}</p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white/80">
                    <img src={selectedPod.images[0]} alt={selectedPod.name} className="h-52 w-full object-cover" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-primary/10 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monthly</p>
                      <p className="mt-2 text-2xl font-bold text-primary">₹{selectedPod.monthlyPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Capacity</p>
                      <p className="mt-2 text-lg font-semibold">{selectedPod.maxPlants}</p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-primary/10 bg-white/70 p-4">
                    {stepLabels.map((label, index) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${index <= step ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">Step {index + 1} of {stepLabels.length}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-h-[85vh] overflow-y-auto p-6 lg:p-8">
                {!user ? (
                  <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <AlertCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold">Sign in to rent a pod</h3>
                    <p className="mt-3 max-w-md text-sm text-muted-foreground">
                      Your rental request is linked to your UrbanRoots account so you can track status, schedule, and follow-up details from the My Orders section.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button onClick={() => navigate('/sign-in')}>Go to Sign In</Button>
                      <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
                    </div>
                  </div>
                ) : success ? (
                  <div className="flex min-h-[540px] flex-col justify-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold">Rental request submitted</h3>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {success.message}
                      </p>
                    </div>

                    <div className="mt-8 space-y-4 rounded-3xl border border-primary/15 bg-primary/5 p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Request ID</p>
                          <p className="mt-1 font-semibold">{success.rental.id}</p>
                        </div>
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                          {success.rental.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-background p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Plan</p>
                          <p className="mt-2 text-lg font-semibold">{success.rental.pod_name}</p>
                          <p className="text-sm text-muted-foreground">₹{success.rental.monthly_price.toLocaleString('en-IN')}/month</p>
                        </div>
                        <div className="rounded-2xl bg-background p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preferred start</p>
                          <p className="mt-2 text-lg font-semibold">{new Date(success.rental.preferred_start_date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{success.rental.rental_term_months} month plan</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-background p-4 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-muted-foreground">
                          {success.email_delivered
                            ? 'A summary has been emailed to you and UrbanRoots.'
                            : 'Your request was saved successfully. Email delivery could not be confirmed, so our team should still follow up from the dashboard.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button onClick={() => navigate('/my-orders')}>View My Orders</Button>
                      <Button variant="outline" onClick={resetAndClose}>Close</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-primary/80">{stepLabels[step]}</p>
                      <h3 className="mt-2 text-3xl font-bold">Tell us how you want this pod set up</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        We prefilled what we could from your account. Complete the request and UrbanRoots will follow up to confirm installation timing.
                      </p>
                    </div>

                    {step === 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">Selected plan</label>
                          <select
                            aria-label="Selected plan"
                            value={form.pod_plan_id}
                            onChange={(event) => updateField('pod_plan_id', event.target.value as FormState['pod_plan_id'])}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            {Object.values(podPlansById).map((plan) => (
                              <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Full name</label>
                          <Input value={form.full_name} onChange={(event) => updateField('full_name', event.target.value)} placeholder="Your full name" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Email</label>
                          <Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Phone</label>
                          <Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Phone number" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Location type</label>
                          <select
                            aria-label="Location type"
                            value={form.location_type}
                            onChange={(event) => updateField('location_type', event.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option>Residential Building</option>
                            <option>Commercial Building</option>
                            <option>School or Campus</option>
                            <option>Hospitality Space</option>
                            <option>Private Residence</option>
                          </select>
                        </div>
                      </div>
                    ) : null}

                    {step === 1 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">Installation address</label>
                          <textarea
                            value={form.installation_address}
                            onChange={(event) => updateField('installation_address', event.target.value)}
                            rows={3}
                            placeholder="Street address, floor, rooftop, or installation note"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">City</label>
                          <Input value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="City" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">State</label>
                          <Input value={form.state} onChange={(event) => updateField('state', event.target.value)} placeholder="State" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">ZIP code</label>
                          <Input value={form.zip_code} onChange={(event) => updateField('zip_code', event.target.value)} placeholder="ZIP / PIN" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Preferred start date</label>
                          <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input type="date" value={form.preferred_start_date} onChange={(event) => updateField('preferred_start_date', event.target.value)} className="pl-9" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Rental term</label>
                          <select
                            aria-label="Rental term"
                            value={String(form.rental_term_months)}
                            onChange={(event) => updateField('rental_term_months', Number(event.target.value))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                            <option value="24">24 months</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Building name</label>
                          <Input value={form.building_name} onChange={(event) => updateField('building_name', event.target.value)} placeholder="Optional" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">Growing goals</label>
                          <textarea
                            value={form.growing_goals}
                            onChange={(event) => updateField('growing_goals', event.target.value)}
                            rows={3}
                            placeholder="What do you want to grow, and who will use the harvest?"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className="space-y-5">
                        <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected pod</p>
                              <h4 className="mt-2 text-2xl font-semibold">{selectedPod.name}</h4>
                              <p className="mt-2 text-sm text-muted-foreground">{selectedPod.area} • {selectedPod.maxPlants}</p>
                            </div>
                            <div className="rounded-2xl bg-background px-4 py-3 text-right shadow-sm">
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
                              <p className="mt-1 text-lg font-semibold text-primary">₹{selectedPod.monthlyPrice.toLocaleString('en-IN')}/month</p>
                              <p className="text-xs text-muted-foreground">Installation fee ₹{selectedPod.installationFee.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
                            <p className="mt-2 font-medium">{form.full_name}</p>
                            <p className="text-sm text-muted-foreground">{form.email}</p>
                            <p className="text-sm text-muted-foreground">{form.phone}</p>
                          </div>
                          <div className="rounded-2xl border p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Installation</p>
                            <p className="mt-2 font-medium">{form.location_type}</p>
                            <p className="text-sm text-muted-foreground">{form.installation_address}</p>
                            <p className="text-sm text-muted-foreground">{form.city}, {form.state} {form.zip_code}</p>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Anything else we should know?</label>
                          <textarea
                            value={form.notes}
                            onChange={(event) => updateField('notes', event.target.value)}
                            rows={3}
                            placeholder="Access timings, rooftop lift limits, preferred contact hours, or anything useful for the install team."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>

                        <label className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-muted/30 p-4 text-sm">
                          <input
                            type="checkbox"
                            checked={form.terms_accepted}
                            onChange={(event) => updateField('terms_accepted', event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                          />
                          <span className="text-muted-foreground">
                            I confirm these details are accurate and agree to be contacted by UrbanRoots to finalize installation, scheduling, and rental terms. No payment will be collected in this form.
                          </span>
                        </label>
                      </div>
                    ) : null}

                    {error ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                      <div className="flex gap-3">
                        {step > 0 ? <Button variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 0))}>Back</Button> : null}
                        <Button
                          variant="ghost"
                          onClick={() => setForm(initialFormState(form.pod_plan_id))}
                        >
                          Reset
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
                        {step < stepLabels.length - 1 ? (
                          <Button onClick={handleNext}>Continue</Button>
                        ) : (
                          <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Starting rental
                              </>
                            ) : (
                              'Start Renting'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
