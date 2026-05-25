'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, FileText, Key } from 'lucide-react';
import { tenantRegistrationService, RegisterTenantData } from '@/services/tenant-registration.service';
import { toast } from 'sonner';

interface RegisterTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: {
    id: string;
    unitNumber: string;
    rentAmount: number;
    propertyName: string;
  };
  onSuccess: () => void;
}

export default function RegisterTenantModal({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: RegisterTenantModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RegisterTenantData>>({
    unitId: unit.id,
    rentAmount: unit.rentAmount,
    createAccount: true,
    deposit: unit.rentAmount, // Default deposit = 1 month rent
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    try {
      await tenantRegistrationService.registerTenant(formData as RegisterTenantData);
      
      toast.success('Tenant registered successfully!', {
        description: `${formData.fullName} has been registered to Unit ${unit.unitNumber}`,
      });
      
      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setStep(1);
      setFormData({
        unitId: unit.id,
        rentAmount: unit.rentAmount,
        createAccount: true,
        deposit: unit.rentAmount,
      });
    } catch (error: any) {
      console.error('Failed to register tenant:', error);
      toast.error('Failed to register tenant', {
        description: error.response?.data?.message || 'Please check the information and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Register Tenant - Unit {unit.unitNumber}
          </DialogTitle>
          <p className="text-sm text-slate-600">{unit.propertyName}</p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Tenant Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Tenant Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+256 700 000000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="nationalId">National ID / Passport</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId || ''}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="CM12345678"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Software Engineer"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Jane Doe - +256 700 111111"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lease Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Lease Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Lease Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Lease End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rentAmount">Monthly Rent (UGX) *</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    value={formData.rentAmount || ''}
                    onChange={(e) => setFormData({ ...formData, rentAmount: parseFloat(e.target.value) })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="deposit">Security Deposit (UGX) *</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.deposit || ''}
                    onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) })}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="paymentDueDay">Payment Due Day (1-31)</Label>
                  <Input
                    id="paymentDueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDueDay || ''}
                    onChange={(e) => setFormData({ ...formData, paymentDueDay: parseInt(e.target.value) })}
                    placeholder="e.g., 1 for 1st of month"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Day of the month when rent is due
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Account Creation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Tenant Portal Access</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  Create a portal account for the tenant to view payments, submit maintenance requests, and manage their lease online.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createAccount"
                  checked={formData.createAccount}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, createAccount: checked as boolean })
                  }
                />
                <Label htmlFor="createAccount" className="cursor-pointer">
                  Create tenant portal account and send login credentials via email
                </Label>
              </div>

              {formData.createAccount && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to auto-generate"
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      If left blank, a secure password will be generated automatically
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-50 rounded-lg p-4 mt-6 space-y-2">
                <h4 className="font-semibold text-slate-900 mb-3">Registration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-600">Tenant:</span>
                  <span className="font-medium">{formData.fullName}</span>
                  
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                  
                  <span className="text-slate-600">Unit:</span>
                  <span className="font-medium">{unit.unitNumber}</span>
                  
                  <span className="text-slate-600">Monthly Rent:</span>
                  <span className="font-medium">UGX {formData.rentAmount?.toLocaleString()}</span>
                  
                  <span className="text-slate-600">Lease Period:</span>
                  <span className="font-medium">
                    {formData.startDate} to {formData.endDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {step > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : step < 3 ? (
                'Next'
              ) : (
                'Register Tenant'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
