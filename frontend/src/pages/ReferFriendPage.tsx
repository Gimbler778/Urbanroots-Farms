import Layout from '@/components/Layout'
import { Share2, Copy, QrCode, Gift, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function ReferFriendPage() {
  const [copied, setCopied] = useState(false)
  const referralLink = 'https://urbanroots.com/ref/UR12345'

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-6 mb-16">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Referral Program</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold">
                Refer a{' '}
                <span className="text-primary">Friend</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Share the joy of urban farming with your friends and earn rewards together!
              </p>
            </div>

            {/* Rewards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">You Get</h3>
                  <div className="text-4xl font-bold text-primary">₹500</div>
                  <p className="text-muted-foreground">
                    Discount on your next subscription when your friend signs up
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Friend Gets</h3>
                  <div className="text-4xl font-bold text-primary">₹500</div>
                  <p className="text-muted-foreground">
                    Discount on their first pod rental subscription
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link */}
            <Card className="border-2 border-primary/20 shadow-xl mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Your Referral Link</CardTitle>
                <p className="text-muted-foreground">
                  Share this link with your friends to give them ₹500 off
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    aria-label="Referral link"
                    className="flex-1 px-4 py-3 rounded-lg border border-input bg-muted text-sm"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full py-6 text-base">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Link
                  </Button>
                  <Button variant="outline" className="w-full py-6 text-base">
                    <QrCode className="w-5 h-5 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Share Your Link</h4>
                    <p className="text-muted-foreground">
                      Send your unique referral link to friends and family who might be interested in urban farming.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Friend Signs Up</h4>
                    <p className="text-muted-foreground">
                      Your friend uses your referral link to sign up and rent their first pod with ₹500 off.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">You Both Get Rewards</h4>
                    <p className="text-muted-foreground">
                      Once they complete their first month, you'll receive ₹500 credit on your next subscription!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="mt-12 p-6 bg-muted rounded-xl">
              <h4 className="font-semibold mb-3">Terms & Conditions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Referral credits are valid for 1 year from the date of issue</li>
                <li>• Credits can only be used towards UrbanRoots pod subscriptions</li>
                <li>• Referral rewards are issued after the referred friend completes their first month</li>
                <li>• There is no limit to the number of friends you can refer</li>
                <li>• Credits cannot be transferred or redeemed for cash</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
