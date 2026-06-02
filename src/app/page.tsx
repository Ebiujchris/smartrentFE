'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Home, Users, CreditCard, ChevronDown, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">{/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <Home className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <X className="h-6 w-6 text-slate-600" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            <Link href="/houses-for-rent" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
              Houses for Rent
            </Link>
            
            {/* About Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setShowAboutDropdown(true)}
                onMouseLeave={() => setShowAboutDropdown(false)}
                className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors py-2"
              >
                About
                <ChevronDown className={`h-4 w-4 transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <div
                onMouseEnter={() => setShowAboutDropdown(true)}
                onMouseLeave={() => setShowAboutDropdown(false)}
                className={`absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden transition-all duration-200 ${
                  showAboutDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <Link href="/about" className="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100">
                  About Us
                </Link>
                <Link href="/features" className="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100">
                  Features
                </Link>
                <Link href="/pricing" className="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100">
                  Pricing
                </Link>
                <Link href="/contact" className="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <Link href="/login" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 sm:px-6 h-8 sm:h-10 text-xs sm:text-sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMounted && showMobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <Link href="/houses-for-rent" className="block px-4 py-3 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100">
              Houses for Rent
            </Link>
            
            {/* Mobile About Section */}
            <div>
              <button
                onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100"
              >
                About
                <ChevronDown className={`h-4 w-4 transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showAboutDropdown && (
                <div className="bg-slate-50">
                  <Link href="/about" className="block px-8 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                    About Us
                  </Link>
                  <Link href="/features" className="block px-8 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="block px-8 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                    Pricing
                  </Link>
                  <Link href="/contact" className="block px-8 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors border-b border-slate-100">
                    Contact
                  </Link>
                </div>
              )}
            </div>

            <Link href="/login" className="block px-4 py-3 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-b border-slate-100">
              Sign In
            </Link>
            <div className="p-4">
              <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-10 text-sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 pt-24 pb-32 text-center lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 bg-[url('/dashboard_mockup.png')] bg-cover bg-center opacity-5 blur-sm mix-blend-overlay"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Property management <span className="text-emerald-400">made simple</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-300">
              Track rent, manage tenants, and collect payments—all in one place. Built for Ugandan landlords.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 px-8 text-base shadow-lg shadow-emerald-500/20">
                <Link href="/register">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 text-base bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                <Link href="#features">See Features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="relative -mt-16 sm:-mt-24 z-20 pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur lg:rounded-2xl lg:p-4 shadow-2xl">
              <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-900/5 shadow-sm">
                <Image
                  src="/dashboard_mockup.png"
                  alt="SmartRentUG Dashboard Preview"
                  width={2400}
                  height={1600}
                  className="w-full h-auto object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-white sm:py-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need</h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Powerful tools to run your rental business efficiently.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                {[
                  {
                    name: 'Rent Tracking',
                    description: 'See who paid, who owes, and monthly revenue at a glance.',
                    icon: Home,
                  },
                  {
                    name: 'Tenant Management',
                    description: 'All tenant details, leases, and payment history in one place.',
                    icon: Users,
                  },
                  {
                    name: 'Mobile Money',
                    description: 'Accept MTN MoMo and Airtel Money. Auto-reconciliation included.',
                    icon: CreditCard,
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-slate-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <feature.icon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-slate-600">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-slate-50 sm:py-32 border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-8">
             <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Get started in 3 steps</h2>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white border-0 shadow-md">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xl mb-4">1</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Add Properties</h3>
                  <p className="text-slate-600">Set up buildings and units in minutes.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-md">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xl mb-4">2</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Add Tenants</h3>
                  <p className="text-slate-600">Register tenants and set rent amounts.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-md">
                <CardContent className="pt-8 text-center">
                   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xl mb-4">3</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Collect Rent</h3>
                  <p className="text-slate-600">Track payments via cash or Mobile Money.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tenant Marketing Section */}
        <section className="py-24 bg-white sm:py-32 border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mx-auto max-w-7xl flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100 shadow-xl overflow-hidden aspect-[4/3]">
                  <div className="absolute inset-0 bg-emerald-500/10 mix-blend-multiply rounded-xl z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent z-20" />
                  <div className="absolute bottom-6 left-6 z-30">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg inline-flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-semibold text-slate-900">Verified Landlords</span>
                    </div>
                  </div>
                  {/* We use a placeholder pattern here to represent the housing image */}
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center rounded-xl" />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  Looking for a place?
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Find your next home directly from verified landlords. No middlemen, no hidden fees.
                </p>
                <ul className="space-y-4 mb-10">
                  {['No agency fees', 'Direct landlord contact', 'Real-time availability'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-12 px-8 text-base shadow-lg">
                  <Link href="/houses-for-rent">Browse Houses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-slate-900 sm:py-32">
          <div className="container mx-auto px-4 md:px-8 text-center">
             <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">Ready to get started?</h2>
             <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">Join hundreds of landlords managing their properties smarter.</p>
             <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 px-8 text-base">
                <Link href="/register">Start Free Trial</Link>
              </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-slate-500 text-sm mb-2">
            &copy; {new Date().getFullYear()} SmartRentUG. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs">
            Made by <span className="font-semibold text-emerald-600">INFINITI ANALYTICS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
