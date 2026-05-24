'use client';

import { Settings as SettingsIcon, User, Lock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div>
            <Label>Full Name</Label>
            <Input defaultValue={user?.fullName} className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user?.email} disabled className="mt-1 bg-slate-50" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input placeholder="+256 XXX XXX XXX" className="mt-1" />
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Security</h2>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div>
            <Label>Current Password</Label>
            <Input type="password" className="mt-1" />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" className="mt-1" />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" className="mt-1" />
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            Update Password
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-600">Receive updates via email</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">SMS Notifications</p>
              <p className="text-sm text-slate-600">Receive updates via SMS</p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Payment Reminders</p>
              <p className="text-sm text-slate-600">Get notified about due payments</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
