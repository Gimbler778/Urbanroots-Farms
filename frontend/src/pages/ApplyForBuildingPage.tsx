import Layout from '@/components/Layout'
import { Building2, Mail, Phone, User, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ApplyForBuildingPage() {
  return (
    <Layout>
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Building Application</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Apply for{' '}
              <span className="text-primary">Your Building</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your building into an urban farm. Fill out the form below and our team will get in touch with you.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Building Application Form</CardTitle>
              <p className="text-muted-foreground">
                Please provide your details and we'll reach out to discuss how UrbanRoots can work for your building.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
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
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
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
                    type="text"
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
                  placeholder="123 Green Street, City, State, PIN Code"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Building Type</label>
                <select aria-label="Building type" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                  <option value="">Select building type</option>
                  <option value="residential">Residential Apartment</option>
                  <option value="commercial">Commercial Building</option>
                  <option value="mixed">Mixed Use</option>
                  <option value="society">Housing Society</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Available Space (approx.)</label>
                <select aria-label="Available space size" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
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
                  placeholder="Tell us about your building, available spaces (rooftop, terrace, ground), number of residents, and any specific requirements..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to be contacted by UrbanRoots regarding this application and understand that my information will be used in accordance with the privacy policy.
                </label>
              </div>

              <Button size="lg" className="w-full text-lg py-6 rounded-xl">
                Submit Application
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Our team will review your application and contact you within 2-3 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  )
}
