import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Heart,
  Zap,
  Target,
  Award,
  Users,
  ArrowRight
} from 'lucide-react';
import { LogoWithText } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 border-t border-blue-200 dark:border-blue-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Newsletter Section */}
        <div className="mb-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Ahead of the Game! 🏆
              </h3>
              <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                Get the latest training tips, course updates, and exclusive content delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 placeholder:text-gray-500 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white h-11"
                />
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 font-semibold shadow-lg h-11"
                >
                  Subscribe
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-4 left-4 text-white/20">
              <Target className="w-8 h-8" />
            </div>
            <div className="absolute top-8 right-8 text-white/20">
              <Award className="w-6 h-6" />
            </div>
            <div className="absolute bottom-4 left-8 text-white/20">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <LogoWithText className="mb-4" />
            <p className="text-muted-foreground leading-relaxed">
              Empowering athletes through cutting-edge digital learning,
              personalized training, and comprehensive progress tracking.
              Your journey to excellence starts here.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-xs text-muted-foreground">Athletes</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600">500+</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/sports", label: "🏃‍♂️ Courses", desc: "Expert-led training" },
                { href: "/quizzes", label: "🧠 Skill Quizzes", desc: "Test your knowledge" },
                { href: "/progress", label: "📈 Progress Tracking", desc: "Monitor your growth" },
                { href: "/dashboard", label: "🎯 Dashboard", desc: "Your training hub" }
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group block p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
                  >
                    <div className="font-medium text-foreground group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.desc}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/help", label: "❓ Help Center", desc: "Get instant help" },
                { href: "/contact", label: "💬 Contact Us", desc: "Reach our team" },
                { href: "/community", label: "👥 Community", desc: "Join athletes worldwide" },
                { href: "/tutorials", label: "📚 Tutorials", desc: "Learn the platform" }
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group block p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-200"
                  >
                    <div className="font-medium text-foreground group-hover:text-purple-600 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.desc}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Connect
            </h4>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="text-muted-foreground">hello@smartergoalie.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-muted-foreground">San Francisco, CA</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="font-semibold mb-3 text-foreground">Follow Us</h5>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, color: "text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900" },
                  { icon: Twitter, color: "text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900" },
                  { icon: Instagram, color: "text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-900" },
                  { icon: Youtube, color: "text-red-600 hover:bg-red-100 dark:hover:bg-red-900" }
                ].map((social, index) => (
                  <button
                    key={index}
                    className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-110 ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Trusted by 10,000+ athletes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-200 dark:border-blue-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">
                &copy; {currentYear} SmarterGoalie. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Made with <Heart className="inline w-3 h-3 text-red-500" /> for athletes worldwide
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
