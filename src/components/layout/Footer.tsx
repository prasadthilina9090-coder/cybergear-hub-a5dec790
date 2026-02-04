import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, Truck, RotateCcw, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      {/* Trust Badges */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $99</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">DOA Warranty</p>
                <p className="text-xs text-muted-foreground">Dead on Arrival protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">30-Day Returns</p>
                <p className="text-xs text-muted-foreground">Hassle-free returns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">256-bit encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-cyber-gradient" />
              <span className="font-display text-xl font-bold tracking-wider">
                NEXUS<span className="text-primary">GEAR</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your premium destination for high-performance gaming PCs, components, and mobile devices.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@nexusgear.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                1-800-NEXUS-99
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Tech District, Silicon Valley
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-display font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/pc" className="hover:text-primary transition-colors">Gaming PCs</Link></li>
              <li><Link to="/pc-parts" className="hover:text-primary transition-colors">PC Components</Link></li>
              <li><Link to="/mobile" className="hover:text-primary transition-colors">Smartphones</Link></li>
              <li><Link to="/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
              <li><Link to="/pc-builder" className="hover:text-primary transition-colors">PC Builder</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/warranty" className="hover:text-primary transition-colors">Warranty Policy</Link></li>
            </ul>
          </div>

          {/* Warranty Policy */}
          <div>
            <h3 className="font-display font-semibold mb-4">DOA Warranty Policy</h3>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">
                <strong className="text-foreground">Dead on Arrival Protection:</strong>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 14-day DOA replacement guarantee</li>
                <li>• No questions asked for defective items</li>
                <li>• Free return shipping on DOA claims</li>
                <li>• Express replacement available</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                All PC parts include manufacturer warranty. Extended protection plans available at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 NEXUS GEAR. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
