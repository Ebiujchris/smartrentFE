import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="bg-slate-900 p-1.5 rounded-md group-hover:bg-slate-800 transition-colors">
          <Home className="h-6 w-6 text-emerald-400" />
        </div>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input id="email" type="email" placeholder="manager@example.com" required className="focus-visible:ring-emerald-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Link href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" required className="focus-visible:ring-emerald-500" />
          </div>
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4 h-11 text-base">
            Login
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500 ml-1">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
