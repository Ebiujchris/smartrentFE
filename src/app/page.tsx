'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Home, Users, CreditCard } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50" suppressHydrationWarning>
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <Home className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 pt-24 pb-32 text-center lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 bg-[url('/dashboard_mockup.png')] bg-cover bg-center opacity-5 blur-sm mix-blend-overlay"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Manage rentals, tenants & payments <span className="text-emerald-400">easily</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-300">
              The modern property management system built for Uganda. Automate rent collection, track arrears, and manage maintenance without the headache.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 px-8 text-base shadow-lg shadow-emerald-500/20">
                <Link href="/register">Start for free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 text-base bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                <Link href="#features">See how it works</Link>
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to run your properties</h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                No more messy spreadsheets or lost receipts. SmartRentUG brings order to your property business.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                {[
                  {
                    name: 'Rent Tracking',
                    description: 'Instantly see who has paid, who is in arrears, and total expected revenue for the month.',
                    icon: Home,
                  },
                  {
                    name: 'Tenant Management',
                    description: 'Keep a digital ledger of all tenant details, leases, and payment histories in one secure place.',
                    icon: Users,
                  },
                  {
                    name: 'Mobile Money Payments',
                    description: 'Tenants can pay directly via MTN MoMo or Airtel Money. Reconciliations are automatic.',
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How it works in 3 steps</h2>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white border-0 shadow-md">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xl mb-4">1</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Add your Properties</h3>
                  <p className="text-slate-600">Set up your buildings and units in minutes.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-md">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xl mb-4">2</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Invite Tenants</h3>
                  <p className="text-slate-600">Add tenant details and expected rent amounts.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-md">
                <CardContent className="pt-8 text-center">
                   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xl mb-4">3</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Collect Rent</h3>
                  <p className="text-slate-600">Receive payments via cash or Mobile Money.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-slate-900 sm:py-32">
          <div className="container mx-auto px-4 md:px-8 text-center">
             <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">Ready to simplify your property management?</h2>
             <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-12 px-8 text-base">
                <Link href="/register">Get Started Now</Link>
              </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SmartRentUG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
