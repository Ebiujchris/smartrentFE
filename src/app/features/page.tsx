'use client';

import Link from 'next/link';
import { CheckCircle2, Zap, BarChart3, Bell, Lock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: 'Rent Tracking',
      description: 'Instantly see who has paid, who is in arrears, and total expected revenue. Get real-time notifications for every payment.',
      highlights: ['Payment status dashboard', 'Arrears tracking', 'Monthly revenue overview', 'Payment reminders']
    },
    {
      icon: Smartphone,
      title: 'Mobile Money Integration',
      description: 'Accept payments via MTN MoMo and Airtel Money. Automatic reconciliation saves you hours of work.',
      highlights: ['MTN MoMo support', 'Airtel Money support', 'Instant payment notifications', 'Automatic reconciliation']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Powerful reports and dashboards to understand your property business at a glance.',
      highlights: ['Revenue analytics', 'Tenant insights', 'Payment trends', 'Custom reports']
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay informed with SMS and email notifications for important events.',
      highlights: ['Payment received alerts', 'Arrears reminders', 'Maintenance updates', 'System notifications']
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description: 'Your data is protected with industry-standard security. Never lose a transaction or record.',
      highlights: ['Bank-level encryption', 'Automatic backups', 'Data redundancy', 'Compliance with standards']
    },
    {
      icon: CheckCircle2,
      title: 'Tenant Management',
      description: 'Complete digital profiles for all tenants with lease history and payment records in one place.',
      highlights: ['Tenant profiles', 'Lease management', 'Payment history', 'Contact management']
    },
  ];

  const otherFeatures = [
    'Maintenance request tracking and management',
    'Receipt generation and digital receipts',
    'Multi-manager support with role-based access',
    'Bulk tenant import for quick setup',
    'Advanced search and filtering',
    'Export reports to PDF and Excel',
    'SMS and email notifications',
    ' 24/7 priority customer support',
    'Regular feature updates',
    'API access for integrations',
    'Custom branding options',
    'Dedicated account manager (Premium)',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-2m-9 2l4 2m0-11L7 7m7 0l-4 2" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/login" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 sm:px-6 h-8 sm:h-10 text-xs sm:text-sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Features Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Powerful Features Built for You</h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Everything you need to manage your rental properties efficiently and professionally.
            </p>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div key={feature.title} className="bg-white rounded-lg p-8 border border-slate-200">
                  <feature.icon className="h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">More Features That Matter</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {otherFeatures.map((feature) => (
                <div key={feature} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-12 border border-emerald-200">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Seamless Integration</h2>
              <p className="text-slate-600 text-lg mb-8">
                SmartRentUG works with the tools you already use. Integrate with your existing systems or use our API to build custom solutions.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['MTN MoMo', 'Airtel Money', 'Email Services', 'SMS Services', 'Google Sheets', 'Excel Import', 'Custom API', 'Webhooks'].map((integration) => (
                  <div key={integration} className="bg-white p-4 rounded-lg text-center text-sm font-medium text-slate-600 border border-slate-200">
                    {integration}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-emerald-50 mb-8">
              Start your 30-day free trial today. No credit card required.
            </p>
            <Button asChild className="bg-white text-emerald-600 hover:bg-slate-100 rounded-full px-8 h-12 text-base font-semibold">
              <Link href="/register">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">SmartRentUG</h3>
              <p className="text-sm">Modern property management for Uganda</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: smartrent@gmail.com</li>
                <li>Phone: +256 774 560 634</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 SmartRentUG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
