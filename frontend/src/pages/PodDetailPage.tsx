import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Leaf, Ruler, Sprout, Star } from 'lucide-react'
import Layout from '@/components/Layout'
import PodRentalDialog from '@/components/PodRentalDialog'
import FarmBotDialog from '@/components/FarmBotDialog'
import GlowCard from '@/components/GlowCard'
import ScrollReveal from '@/components/ScrollReveal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { podPlansBySlug } from '@/data/podPlans'

export default function PodDetailPage() {
  const { podId } = useParams<{ podId: string }>()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [farmBotOpen, setFarmBotOpen] = useState(false)

  const pod = podId ? podPlansBySlug[podId] : undefined

  if (!pod) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-[28px] border border-border bg-card p-10 text-center shadow-sm">
            <h1 className="text-3xl font-bold">Pod Not Found</h1>
            <p className="mt-3 text-muted-foreground">The pod you selected is not available in the current catalog.</p>
            <Button className="mt-6" onClick={() => navigate('/rent-a-pod')}>Back to Rent a Pod</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(110,185,88,0.18),_transparent_42%),linear-gradient(180deg,rgba(245,250,244,0.95),rgba(255,255,255,0.92))] py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate('/rent-a-pod')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rent a Pod
          </Button>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ScrollReveal yOffset={24}>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-[28px] border border-primary/15 bg-white shadow-[0_20px_55px_rgba(52,77,48,0.12)]">
                  <img src={pod.images[selectedImage]} alt={pod.name} className="h-[460px] w-full object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {pod.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-2xl border-2 transition-all ${selectedImage === index ? 'border-primary shadow-lg shadow-primary/15' : 'border-transparent hover:border-primary/30'}`}
                    >
                      <img src={image} alt={`${pod.name} ${index + 1}`} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08} yOffset={24}>
              <div className="space-y-6 rounded-[30px] border border-primary/10 bg-card/95 p-8 shadow-[0_18px_50px_rgba(40,63,42,0.08)] backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <Sprout className="h-3.5 w-3.5" />
                  {pod.size} Pod
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{pod.name}</h1>
                  <p className="mt-3 text-lg text-muted-foreground">{pod.longDescription}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monthly</p>
                    <p className="mt-2 text-2xl font-bold text-primary">₹{pod.monthlyPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Area</p>
                    <p className="mt-2 text-lg font-semibold">{pod.area}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Capacity</p>
                    <p className="mt-2 text-lg font-semibold">{pod.maxPlants}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border p-4">
                    <Ruler className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Space match</p>
                      <p className="text-sm text-muted-foreground">{pod.bestFor.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border p-4">
                    <Leaf className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Best crops</p>
                      <p className="text-sm text-muted-foreground">{pod.crops.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="flex-1" onClick={() => setDialogOpen(true)}>
                    <CalendarDays className="mr-2 h-5 w-5" />
                    Choose Plan
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setFarmBotOpen(true)}>
                    Talk to FarmBot
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <ScrollReveal>
              <GlowCard className="h-full">
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>What makes this pod fit for long-term urban farming.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pod.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
                      <Star className="mt-1 h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </CardContent>
              </GlowCard>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <GlowCard className="h-full">
                <CardHeader>
                  <CardTitle>Included Services</CardTitle>
                  <CardDescription>The support layer bundled into the rental plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pod.services.map((service) => (
                    <div key={service} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
                      <Sprout className="mt-1 h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{service}</p>
                    </div>
                  ))}
                </CardContent>
              </GlowCard>
            </ScrollReveal>
          </div>

          <ScrollReveal className="mt-10">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Technical details for planning your installation.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {Object.entries(pod.specifications).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{key}</p>
                    <p className="mt-2 font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </ScrollReveal>

          <Separator className="my-12" />

          <div>
            <h2 className="text-3xl font-bold">Customer Reviews</h2>
            <Card className="mt-6 overflow-hidden">
              <CardHeader>
                <CardTitle>Reviews Coming Soon</CardTitle>
                <CardDescription>
                  Pod reviews and grower stories will appear here once rental feedback starts landing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0.4, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center"
                >
                  <p className="text-muted-foreground">Be the first to review the {pod.name.toLowerCase()} after your installation goes live.</p>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PodRentalDialog open={dialogOpen} onOpenChange={setDialogOpen} pod={pod} />
      <FarmBotDialog open={farmBotOpen} onOpenChange={setFarmBotOpen} />
    </Layout>
  )
}
