import Layout from '@/components/Layout'
import { Leaf, Target, Users, Heart, Sprout, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About UrbanRoots</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Revolutionizing{' '}
              <span className="text-primary">Urban Agriculture</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Transforming unused building spaces into sustainable urban farms that provide fresh, organic produce to communities.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-10 space-y-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To make fresh, organic produce accessible to urban residents by transforming underutilized building spaces into thriving vertical farms. We believe everyone deserves access to healthy, sustainable food grown right in their community.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-10 space-y-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Our Vision</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To create a network of urban farms across cities, reducing food miles, promoting sustainability, and building resilient local food systems. We envision a future where every building has the potential to be a source of fresh, healthy food.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                UrbanRoots was founded with a simple yet powerful idea: what if we could transform the unused spaces in our buildings into productive urban farms? 
              </p>
            </div>
            <div className="prose prose-lg mx-auto text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                In 2023, our founders noticed that many residential and commercial buildings had rooftops, terraces, and unused spaces that were sitting idle. At the same time, urban residents were increasingly concerned about food quality, sustainability, and the environmental impact of long-distance food transportation.
              </p>
              <p className="leading-relaxed">
                We developed modular farming pods that could be installed in virtually any building space, complete with smart irrigation systems, climate control, and remote monitoring. Our first pilot project in Mumbai demonstrated that even in densely populated urban areas, it's possible to grow significant quantities of fresh produce.
              </p>
              <p className="leading-relaxed">
                Today, we've expanded to over 50 locations across multiple cities, helping communities grow their own food while reducing their carbon footprint and building stronger neighborhood connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Core Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do at UrbanRoots
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Sustainability</h3>
                <p className="text-muted-foreground">
                  We're committed to eco-friendly practices, from water conservation to zero-waste farming methods.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community</h3>
                <p className="text-muted-foreground">
                  Building connections through shared farming experiences and promoting healthy living together.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Quality</h3>
                <p className="text-muted-foreground">
                  We never compromise on quality - 100% organic, pesticide-free produce every time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Impact</h2>
            <p className="text-lg text-muted-foreground">
              Making a difference, one pod at a time
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Active Farming Pods</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Happy Residents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">KG Produce Grown</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">30%</div>
              <div className="text-muted-foreground">Cost Savings</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
