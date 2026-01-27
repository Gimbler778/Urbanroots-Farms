import Layout from '@/components/Layout'
import { Link } from 'react-router-dom'
import { 
  Leaf, Package, Wrench, Check, 
  Droplets, Thermometer, Wifi, ShieldCheck,
  Sprout, Carrot, Apple, ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RentAPodPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section id="hero" className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Pod Rental Service</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Rent Your Own{' '}
              <span className="text-primary">Farming Pod</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Get everything you need to start growing fresh, organic produce in your building. Complete farming solution with expert support.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a href="#pod-details">
                <Button variant="outline" size="lg" className="rounded-xl">
                  View Pods
                </Button>
              </a>
              <a href="#pricing">
                <Button size="lg" className="rounded-xl">
                  See Pricing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pod Details Section */}
      <section id="pod-details" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Our <span className="text-primary">Farming Pods</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from our range of modular farming pods designed for different space requirements and crop types.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Pod */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Starter Pod</CardTitle>
                <CardDescription>Perfect for small spaces and beginners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-square bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-24 h-24 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>4x4 ft growing area</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Grow up to 20 plants</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Smart drip irrigation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>LED grow lights</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Mobile app monitoring</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Best for</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Herbs</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Leafy Greens</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Microgreens</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standard Pod */}
            <Card className="border-2 border-primary hover:border-primary transition-all hover:shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Standard Pod</CardTitle>
                <CardDescription>Ideal for families and regular use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-square bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-24 h-24 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>8x4 ft growing area</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Grow up to 40 plants</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Advanced irrigation system</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Climate control</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>IoT monitoring & alerts</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Best for</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Vegetables</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Herbs</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Small Fruits</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Pod */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Premium Pod</CardTitle>
                <CardDescription>Maximum yield for serious growers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-square bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-24 h-24 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>12x8 ft growing area</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Grow up to 80 plants</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Automated hydroponic system</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Full climate control</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>AI-powered optimization</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Best for</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">All Crops</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Year-Round</span>
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">High Yield</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pod Features */}
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <Card className="border border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Droplets className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Water Efficient</h4>
                <p className="text-sm text-muted-foreground">90% less water usage vs traditional farming</p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Thermometer className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Climate Control</h4>
                <p className="text-sm text-muted-foreground">Optimal growing conditions year-round</p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Wifi className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Smart IoT</h4>
                <p className="text-sm text-muted-foreground">Monitor and control from your phone</p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Pest Free</h4>
                <p className="text-sm text-muted-foreground">Protected environment, no chemicals needed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services for Farming Section */}
      <section id="services" className="py-20 bg-primary/5 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Comprehensive <span className="text-primary">Farming Services</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for successful urban farming, all included in your subscription.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Seed Supply</h3>
                <p className="text-muted-foreground">
                  Premium organic seeds and seedlings delivered monthly. Choose from 50+ varieties.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wrench className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Setup & Installation</h3>
                <p className="text-muted-foreground">
                  Professional installation and setup by our expert team. Ready to grow in 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Maintenance & Support</h3>
                <p className="text-muted-foreground">
                  Regular maintenance visits and 24/7 technical support via phone or app.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Organic Nutrients</h3>
                <p className="text-muted-foreground">
                  100% organic fertilizers and nutrients tailored to your crops' needs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wifi className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Monitoring</h3>
                <p className="text-muted-foreground">
                  Real-time monitoring of water, nutrients, light, and temperature via mobile app.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Carrot className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Harvest Training</h3>
                <p className="text-muted-foreground">
                  Expert guidance on when and how to harvest for maximum yield and flavor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Farming Equipment Section */}
      <section id="equipment" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Premium <span className="text-primary">Farming Equipment</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              All equipment included with your pod rental. No hidden costs or additional purchases needed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">Included Equipment</h3>
              
              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Growing Containers</div>
                  <div className="text-sm text-muted-foreground">Food-grade, UV-resistant containers</div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Irrigation System</div>
                  <div className="text-sm text-muted-foreground">Automated drip irrigation with timer</div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">LED Grow Lights</div>
                  <div className="text-sm text-muted-foreground">Full-spectrum, energy-efficient lighting</div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Climate Sensors</div>
                  <div className="text-sm text-muted-foreground">Temperature, humidity, and light sensors</div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Support Structure</div>
                  <div className="text-sm text-muted-foreground">Sturdy frames and trellises for climbing plants</div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Tool Kit</div>
                  <div className="text-sm text-muted-foreground">Essential gardening tools and accessories</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold mb-4">What You Get</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <Apple className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Complete farming pod with all equipment</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Sprout className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Monthly seed and nutrient delivery</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Wrench className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Professional installation and training</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Warranty and insurance coverage</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Wifi className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Mobile app with smart controls</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <div className="text-lg font-semibold mb-2">Hassle-Free</div>
                  <p className="text-sm text-muted-foreground">
                    We handle maintenance, repairs, and upgrades. You just enjoy the harvest!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-primary/5 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Pricing */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>Perfect for beginners</CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold">₹2,499<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Starter Pod (4x4 ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Monthly seed delivery</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Basic support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Mobile app access</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Quarterly maintenance</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full py-6">
                  Choose Plan
                </Button>
              </CardContent>
            </Card>

            {/* Standard Pricing */}
            <Card className="border-2 border-primary shadow-xl relative scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-white font-medium rounded-full">
                Best Value
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Standard</CardTitle>
                <CardDescription>Most popular choice</CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold">₹4,999<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Standard Pod (8x4 ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Monthly seed delivery</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Priority support (24/7)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Advanced app features</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Monthly maintenance</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Free nutrient refills</span>
                  </li>
                </ul>
                <Button className="w-full py-6">
                  Choose Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Pricing */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>Maximum production</CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold">₹8,999<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Premium Pod (12x8 ft)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Unlimited seed varieties</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Dedicated support manager</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">AI-powered optimization</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Bi-weekly maintenance</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Premium nutrients & supplies</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full py-6">
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">All plans include free installation, training, and warranty</p>
            <p className="text-sm text-muted-foreground">
              One-time installation fee: ₹5,000 (waived for annual subscriptions)
            </p>
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section id="subscribe" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
              <CardContent className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/10 to-secondary/20">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Leaf className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Start Growing?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join hundreds of urban farmers already growing fresh, organic produce in their buildings. Start your journey today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button size="lg" className="text-lg px-10 py-6 rounded-xl">
                    Subscribe Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Link to="/apply-for-building">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-10 py-6 rounded-xl border-2"
                    >
                      Talk to Expert
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground pt-4">
                  💚 30-day money-back guarantee • 🌱 Cancel anytime • 🚀 Setup in 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  )
}
