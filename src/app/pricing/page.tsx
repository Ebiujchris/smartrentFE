'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const plans = [
    {
      id: 'STARTER',
      name: 'Starter',
      price: '75,000',
      period: '/month',
      units: '15 Units',
      description: 'Perfect for small-scale landlords starting out',
      features: [
        'Manage up to 15 rental units',
        'Tenant management',
        'Rent tracking & payment recording',
        'Lease management',
        'Maintenance request tracking',
        'Receipt generation',
        'SMS & email notifications',
        'Multi-manager support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      id: 'PROFESSIONAL',
      name: 'Professional',
      price: '150,000',
      period: '/month',
      units: '30 Units',
      description: 'Most popular for growing property portfolios',
      features: [
        'Manage up to 30 rental units',
        'Everything in Starter, plus:',
        'Advanced analytics & reports',
        'Priority support',
        'Custom branding options',
        'Payment gateway integration',
        'Bulk tenant import',
        'Advanced filtering & search',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: '250,000',
      period: '/month',
      units: 'Unlimited',
      description: 'Enterprise-grade solution for large portfolios',
      features: [
        'Unlimited rental units',
        'Everything in Professional, plus:',
        'API access for integrations',
        'Dedicated account manager',
        '24/7 premium support',
        'Custom reports & dashboards',
        'Advanced security features',
        'Priority feature requests',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
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
        {/* Pricing Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              All plans include 30 days free trial. No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl overflow-hidden transition-all duration-300 ${
                    plan.popular
                      ? 'ring-2 ring-emerald-500 shadow-2xl scale-105'
                      : 'ring-1 ring-slate-200 shadow-lg'
                  }`}
                >
                  {/* Plan Header */}
                  <div className={plan.popular ? 'bg-emerald-500 text-white p-8' : 'bg-white p-8'}>
                    {plan.popular && (
                      <div className="mb-4">
                        <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    <h2 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h2>
                    <p className={`mb-6 ${plan.popular ? 'text-emerald-50' : 'text-slate-600'}`}>
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                        UGX {plan.price}
                      </span>
                      <span className={plan.popular ? 'text-emerald-50' : 'text-slate-600'}>
                        {plan.period}
                      </span>
                    </div>
                    <div className={`text-sm font-semibold ${plan.popular ? 'text-emerald-50' : 'text-emerald-600'}`}>
                      {plan.units}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex gap-3">
                          <Check className={`h-5 w-5 flex-shrink-0 ${plan.popular ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className={index === 1 ? 'text-slate-500 italic' : 'text-slate-600'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`w-full rounded-full h-12 font-semibold ${
                        plan.popular
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      }`}
                    >
                      <Link href="/register" className="flex items-center justify-center gap-2">
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-24 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {[
                  {
                    q: 'Can I change my plan later?',
                    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                  },
                  {
                    q: 'What happens after my free trial?',
                    a: 'We\'ll remind you 3 days before your trial ends. You can start a paid subscription or downgrade to a free plan if available.'
                  },
                  {
                    q: 'Do you offer discounts for annual billing?',
                    a: 'Contact our sales team for enterprise pricing and custom plans suited to your needs.'
                  },
                  {
                    q: 'What if I exceed my unit limit?',
                    a: 'You\'ll receive a warning when approaching your limit. You can upgrade immediately to add more units or contact support.'
                  },
                ].map((faq, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                    <p className="text-slate-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Still have questions?</h2>
            <p className="text-lg text-emerald-50 mb-8">
              Contact our support team and we'll be happy to help you find the right plan.
            </p>
            <Button asChild className="bg-white text-emerald-600 hover:bg-slate-100 rounded-full px-8 h-12 text-base font-semibold">
              <Link href="/contact">Contact Us</Link>
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
