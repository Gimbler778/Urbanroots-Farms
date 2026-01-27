import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Leaf, Sprout, Heart, TrendingUp, Users, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sustainable Urban Farming</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Grow Fresh,{' '}
              <span className="text-primary">Organic Produce</span>
              <br />
              Right in Your Building
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Transform unused spaces into thriving urban farms. Farm-to-table freshness without leaving your building.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/rent-a-pod">
                <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-[hsl(var(--earth-brown))]/10 hover:border-[hsl(var(--earth-brown))]"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Pods</div>
              </div>
              <div className="text-center border-x border-primary/20">
                <div className="text-3xl md:text-4xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground mt-1">Organic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground mt-1">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-24 fill-primary/5">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Why UrbanRoots Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-primary">UrbanRoots</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              We're revolutionizing urban agriculture by bringing sustainable farming solutions directly to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card className="border-2 border-primary/20 hover:border-[hsl(var(--earth-brown))]/60 transition-all hover:shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">100% Organic</h3>
                <p className="text-muted-foreground">
                  Grow pesticide-free, organic produce using sustainable farming practices and natural nutrients.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="border-2 border-primary/20 hover:border-[hsl(var(--earth-brown))]/60 transition-all hover:shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Farm to Table</h3>
                <p className="text-muted-foreground">
                  Harvest fresh vegetables and herbs directly from your building. Maximum freshness, minimal carbon footprint.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="border-2 border-primary/20 hover:border-[hsl(var(--earth-brown))]/60 transition-all hover:shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Cost Effective</h3>
                <p className="text-muted-foreground">
                  Reduce grocery expenses while enjoying premium organic produce. Smart investment in health and sustainability.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card className="border-2 border-primary/20 hover:border-[hsl(var(--earth-brown))]/60 transition-all hover:shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community Building</h3>
                <p className="text-muted-foreground">
                  Foster community engagement through shared farming experiences and healthy living initiatives.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card className="border-2 border-primary/20 hover:border-[hsl(var(--earth-brown))]/60 transition-all hover:shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Full Support</h3>
                <p className="text-muted-foreground">
                  Expert guidance, maintenance services, and 24/7 support to ensure your farm thrives year-round.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card 6 */}
            <Card className="border-2 border-primary/20 hover:border-[hsl(var(--earth-brown))]/60 transition-all hover:shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Eco-Friendly</h3>
                <p className="text-muted-foreground">
                  Reduce environmental impact with water-efficient systems and zero-waste farming practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
              <CardContent className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/20">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Start Your Urban Farm?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join the urban farming revolution today. Transform your building's unused space into a sustainable food source.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Link to="/rent-a-pod">
                    <Button size="lg" className="text-lg px-10 py-6 rounded-xl">
                      Rent a Pod Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/apply-for-building">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-10 py-6 rounded-xl border-2"
                    >
                      Apply for Your Building
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  )
}
