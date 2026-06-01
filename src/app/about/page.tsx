'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Users, Target, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
        {/* About Us Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">About SmartRentUG</h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              We're transforming property management in Uganda with modern, affordable technology that helps landlords and property managers streamline their operations.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <Target className="h-12 w-12 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h2>
                <p className="text-slate-600">
                  To empower landlords and property managers with affordable, reliable technology that simplifies rent collection, tenant management, and property maintenance.
                </p>
              </div>
              <div>
                <Heart className="h-12 w-12 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Vision</h2>
                <p className="text-slate-600">
                  To become Uganda's leading property management platform, trusted by thousands of landlords to manage their properties with confidence and ease.
                </p>
              </div>
              <div>
                <Users className="h-12 w-12 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Values</h2>
                <p className="text-slate-600">
                  We believe in transparency, reliability, and customer success. Every feature we build is designed with our users' success in mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-16 text-center">Why Choose SmartRentUG?</h2>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {[
                {
                  title: 'Built for Uganda',
                  description: 'Designed specifically for the Ugandan property market with support for local payment methods like MTN MoMo and Airtel Money.'
                },
                {
                  title: 'Affordable Pricing',
                  description: 'Flexible plans starting from just 75,000 UGX/month with a 30-day free trial. No hidden fees.'
                },
                {
                  title: 'Easy to Use',
                  description: 'Intuitive interface that requires no technical skills. Get up and running in minutes.'
                },
                {
                  title: '24/7 Support',
                  description: 'Our dedicated support team is here to help you succeed, available via email and phone.'
                },
                {
                  title: 'Secure & Reliable',
                  description: 'Your data is protected with industry-standard security. Never lose a transaction or tenant record again.'
                },
                {
                  title: 'Growing Features',
                  description: 'Regular updates and new features based on user feedback to keep you ahead of the curve.'
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Property Business?</h2>
            <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
              Join hundreds of Ugandan landlords and property managers who are already using SmartRentUG.
            </p>
            <Button asChild className="bg-white text-emerald-600 hover:bg-slate-100 rounded-full px-8 h-12 text-base font-semibold">
              <Link href="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
