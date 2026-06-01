'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ErrorHandler } from '@/lib/errorHandler';

interface Tenant {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
  leases?: Array<{
    id: string;
    isActive: boolean;
    unit: {
      id: string;
      unitNumber: string;
      property: {
        id: string;
        name: string;
        address: string;
      };
    };
    rentAmount: number;
    deposit: number;
  }>;
}

export default function NewContractPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [newTerm, setNewTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tenantId: '',
    propertyName: '',
    unitNumber: '',
    address: '',
    rentAmount: '',
    deposit: '',
    startDate: '',
    endDate: '',
    duration: '',
    terms: [] as string[],
  });

  useEffect(() => {
    fetchTenants();
    // Set default contract content
    setFormData((prev) => ({
      ...prev,
      content: getDefaultContractContent(),
    }));
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const getDefaultContractContent = () => {
    return `TENANCY AGREEMENT

This Tenancy Agreement is made on [DATE] between:

LANDLORD: [LANDLORD_NAME]
Address: [LANDLORD_ADDRESS]

AND

TENANT: [TENANT_NAME]
Address: [TENANT_ADDRESS]

PROPERTY DETAILS:
The Landlord agrees to let and the Tenant agrees to take the property located at:
[PROPERTY_ADDRESS]
Unit Number: [UNIT_NUMBER]

TERMS AND CONDITIONS:

1. RENT
The monthly rent for the property is UGX [RENT_AMOUNT], payable in advance on the first day of each month.

2. DEPOSIT
The Tenant shall pay a security deposit of UGX [DEPOSIT_AMOUNT] which will be held for the duration of the tenancy and returned at the end of the tenancy period, subject to any deductions for damages or unpaid rent.

3. TENANCY PERIOD
The tenancy shall commence on [START_DATE] and continue until [END_DATE], a period of [DURATION] months.

4. TENANT'S OBLIGATIONS
- Pay rent on time
- Keep the property clean and in good condition
- Report any damages or repairs needed promptly
- Not sublet the property without written permission
- Use the property for residential purposes only
- Comply with all building rules and regulations

5. LANDLORD'S OBLIGATIONS
- Ensure the property is habitable and in good repair
- Carry out necessary repairs in a timely manner
- Respect the tenant's right to quiet enjoyment
- Provide 24 hours notice before entering the property (except in emergencies)

6. UTILITIES
The Tenant is responsible for paying all utility bills including electricity, water, and internet.

7. MAINTENANCE AND REPAIRS
The Tenant must report any defects or repairs needed to the Landlord immediately. The Landlord will arrange for repairs to be carried out within a reasonable time.

8. TERMINATION
Either party may terminate this agreement by giving [NOTICE_PERIOD] days written notice to the other party.

9. GOVERNING LAW
This agreement shall be governed by the laws of Uganda.

SIGNATURES:

Landlord: _________________________ Date: _____________

Tenant: _________________________ Date: _____________`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-populate property and unit when tenant is selected
    if (name === 'tenantId' && value) {
      const selectedTenant = tenants.find(t => t.id === value);
      if (selectedTenant && selectedTenant.leases && selectedTenant.leases.length > 0) {
        // Get the active lease
        const activeLease = selectedTenant.leases.find(l => l.isActive) || selectedTenant.leases[0];
        if (activeLease) {
          setFormData((prev) => ({
            ...prev,
            tenantId: value,
            propertyName: activeLease.unit.property.name,
            unitNumber: activeLease.unit.unitNumber,
            address: activeLease.unit.property.address,
            rentAmount: activeLease.rentAmount.toString(),
            deposit: activeLease.deposit.toString(),
          }));
          toast.success('Property and unit details auto-filled from active lease');
          return; // Exit early since we've already updated formData
        }
      }
    }

    // Auto-calculate duration when dates change
    if (name === 'startDate' || name === 'endDate') {
      const startValue = name === 'startDate' ? value : formData.startDate;
      const endValue = name === 'endDate' ? value : formData.endDate;
      
      // Only calculate if both dates are provided
      if (startValue && endValue) {
        const start = new Date(startValue);
        const end = new Date(endValue);
        
        // Check if dates are valid (not Invalid Date)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
          const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
          setFormData((prev) => ({ ...prev, duration: months.toString() }));
        } else {
          // Clear duration if dates are invalid or end is before start
          setFormData((prev) => ({ ...prev, duration: '' }));
        }
      } else {
        // Clear duration if either date is missing
        setFormData((prev) => ({ ...prev, duration: '' }));
      }
    }
  };

  const addTerm = () => {
    if (newTerm.trim()) {
      setFormData((prev) => ({
        ...prev,
        terms: [...prev.terms, newTerm.trim()],
      }));
      setNewTerm('');
    }
  };

  const removeTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (sendImmediately: boolean = false) => {
    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        rentAmount: parseFloat(formData.rentAmount),
        deposit: parseFloat(formData.deposit),
        duration: parseInt(formData.duration),
      };

      const response = await api.post('/contracts', payload);

      if (sendImmediately) {
        await api.post(`/contracts/${response.data.id}/send`);
        toast.success('Contract created and sent to tenant');
      } else {
        toast.success('Contract saved as draft');
      }

      router.push('/dashboard/contracts');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Lease Agreement</h1>
          <p className="text-slate-600 mt-1">Create a new tenancy contract</p>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contract Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Tenancy Agreement - John Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Tenant *
              </label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Choose a tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.user.fullName} ({tenant.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                name="propertyName"
                value={formData.propertyName}
                onChange={handleChange}
                placeholder="e.g., Sunrise Apartments"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unit Number *
              </label>
              <input
                type="text"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                placeholder="e.g., A101"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full property address"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Terms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Rent (UGX) *
              </label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                placeholder="e.g., 500000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Security Deposit (UGX) *
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="e.g., 500000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Lease Period */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Lease Period</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (Months) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Additional Terms */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Terms & Clauses</h2>
          
          <div className="space-y-3 mb-4">
            {formData.terms.map((term, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 flex-1">{term}</span>
                <button
                  onClick={() => removeTerm(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
              placeholder="Add a custom term or clause"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={addTerm}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contract Content */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contract Content</h2>
          
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={20}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
            required
          />
          <p className="text-xs text-slate-500 mt-2">
            Edit the contract template above. Placeholders will be automatically replaced when the contract is generated.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>Save as Draft</span>
          </button>
          
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            <span>Save & Send to Tenant</span>
          </button>

          <button
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
