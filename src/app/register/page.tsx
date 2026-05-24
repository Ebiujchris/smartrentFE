import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
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
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-4 h-10 sm:h-11 text-sm sm:text-base">
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
