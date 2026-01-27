import { Link } from 'react-router-dom'
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary/5 border-t border-primary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">UrbanRoots</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transforming urban spaces into sustainable farming solutions. Grow fresh, organic produce right in your building.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 rounded-lg bg-primary/10 hover:bg-[hsl(var(--earth-brown))]/20 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4 text-primary hover:text-[hsl(var(--earth-brown))] transition-colors" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary/10 hover:bg-[hsl(var(--earth-brown))]/20 transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4 text-primary hover:text-[hsl(var(--earth-brown))] transition-colors" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary/10 hover:bg-[hsl(var(--earth-brown))]/20 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4 text-primary hover:text-[hsl(var(--earth-brown))] transition-colors" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary/10 hover:bg-[hsl(var(--earth-brown))]/20 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4 text-primary hover:text-[hsl(var(--earth-brown))] transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/rent-a-pod" className="text-sm text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                  Rent a Pod
                </Link>
              </li>
              <li>
                <Link to="/apply-for-building" className="text-sm text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                  Apply for Building
                </Link>
              </li>
              <li>
                <Link to="/refer-friend" className="text-sm text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                  Refer a Friend
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Pod Details</li>
              <li className="text-sm text-muted-foreground">Farming Services</li>
              <li className="text-sm text-muted-foreground">Equipment Rental</li>
              <li className="text-sm text-muted-foreground">Subscription Plans</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>123 Urban Street, Green City, 560001</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>hello@urbanroots.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2026 UrbanRoots Farms. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-[hsl(var(--earth-brown))] transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
