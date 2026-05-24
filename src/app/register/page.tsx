'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TermsAndConditions } from '@/components/TermsAndConditions';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      alert('Please accept the Terms & Conditions');
      return;
    }

    try {
      await register({
        ...formData,
        role: 'LANDLORD',
      });
      router.push('/onboarding/welcome');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 sm:p-6 md:p-8">
        <Link href="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm sm:text-base font-medium">Back</span>
        </Link>
        
        <Link href="/" className="flex items-center gap-2 mb-6 sm:mb-8 group">
          <div className="bg-slate-900 p-1.5 rounded-md group-hover:bg-slate-800 transition-colors">
            <Home className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
        </Link>
        
        <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Create an account</CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-500">
              Enter your details to start managing your properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 text-sm">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required className="focus-visible:ring-emerald-500 h-10 sm:h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-sm">Email</Label>
              <Input id="email" type="email" placeholder="manager@example.com" required className="focus-visible:ring-emerald-500 h-10 sm:h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 text-sm">Password</Label>
              <Input id="password" type="password" required className="focus-visible:ring-emerald-500 h-10 sm:h-11" />
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <div className="h-4 w-4 mt-1 rounded-sm border border-slate-900" />
              <label className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                I have read and agree to the Terms & Conditions
              </label>
            </div>
            
            <Button 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-4 h-10 sm:h-11 text-sm sm:text-base opacity-50 cursor-not-allowed"
              disabled
            >
              Create Account
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-xs sm:text-sm text-slate-600 px-4 sm:px-6 pb-6">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 ml-1">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 sm:p-6 md:p-8">
      <Link href="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group">
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm sm:text-base font-medium">Back</span>
      </Link>
      
      <Link href="/" className="flex items-center gap-2 mb-6 sm:mb-8 group">
        <div className="bg-slate-900 p-1.5 rounded-md group-hover:bg-slate-800 transition-colors">
          <Home className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Create an account</CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-500">
            Enter your details to start managing your properties
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700 text-sm">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                required 
                value={formData.fullName}
                onChange={handleChange}
                className="focus-visible:ring-emerald-500 h-10 sm:h-11" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-sm">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="manager@example.com" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="focus-visible:ring-emerald-500 h-10 sm:h-11" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 text-sm">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="focus-visible:ring-emerald-500 h-10 sm:h-11" 
              />
              <p className="text-xs text-slate-500">Minimum 8 characters</p>
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed cursor-pointer"
              >
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-emerald-600 hover:text-emerald-500 font-medium underline"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-4 h-10 sm:h-11 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!acceptedTerms || isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center text-xs sm:text-sm text-slate-600 px-4 sm:px-6 pb-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
      
      <TermsAndConditions open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
