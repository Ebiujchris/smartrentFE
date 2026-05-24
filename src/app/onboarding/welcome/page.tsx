'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 mb-8 sm:mb-12">
        <div className="bg-slate-900 p-2 rounded-md">
          <Home className="h-8 w-8 text-emerald-400" />
        </div>
        <span className="text-3xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
      </div>
      
      <Card className="w-full max-w-2xl shadow-lg border-0 ring-1 ring-slate-200 text-center">
        <CardHeader className="space-y-4 px-6 sm:px-12 pt-12 pb-6">
          <div className="text-6xl mb-4">👋</div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-slate-900">
            Welcome to SmartRentUG
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Let's set up your rental management workspace. This will only take a few minutes.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 sm:px-12 pb-12">
          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Choose Your Plan</h3>
                <p className="text-sm text-slate-600">Select a subscription plan that fits your property portfolio</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-left">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Add Your Properties</h3>
                <p className="text-sm text-slate-600">Set up your properties and rental units</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-left">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Start Managing</h3>
                <p className="text-sm text-slate-600">Track payments, tenants, and maintenance all in one place</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push('/onboarding/subscription')}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base"
          >
            Continue Setup
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
