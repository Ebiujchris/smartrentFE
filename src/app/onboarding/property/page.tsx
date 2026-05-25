'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePropertyStore } from '@/store/propertyStore';
import { toast } from 'sonner';

export default function PropertySetupPage() {
  const router = useRouter();
  const { createProperty, createUnit, isLoading, error } = usePropertyStore();
  
  const [property, setProperty] = useState({
    name: '',
    address: '',
    description: '',
  });
  const [units, setUnits] = useState([
    { unitNumber: '', rentAmount: '', bedrooms: '', bathrooms: '' },
  ]);

  const addUnit = () => {
    setUnits([...units, { unitNumber: '', rentAmount: '', bedrooms: '', bathrooms: '' }]);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create property
      const createdProperty = await createProperty({
        name: property.name,
        address: property.address,
        description: property.description || undefined,
      });

      // Create units for the property
      for (const unit of units) {
        if (unit.unitNumber && unit.rentAmount) {
          await createUnit(createdProperty.id, {
            unitNumber: unit.unitNumber,
            rentAmount: parseFloat(unit.rentAmount),
            bedrooms: unit.bedrooms ? parseInt(unit.bedrooms) : undefined,
            bathrooms: unit.bathrooms ? parseInt(unit.bathrooms) : undefined,
            status: 'VACANT',
          });
        }
      }

      toast.success('Property setup complete!', {
        description: `${property.name} with ${units.length} unit(s) has been added successfully.`,
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to create property:', err);
      toast.error('Failed to create property', {
        description: 'Please check the information and try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Add Your First Property
          </h1>
          <p className="text-lg text-slate-600">
            Let's set up your property and rental units
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  value={property.name}
                  onChange={(e) => setProperty({ ...property, name: e.target.value })}
                  placeholder="e.g., Sunrise Apartments"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={property.address}
                  onChange={(e) => setProperty({ ...property, address: e.target.value })}
                  placeholder="e.g., Plot 123, Kampala Road"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={property.description}
                  onChange={(e) => setProperty({ ...property, description: e.target.value })}
                  placeholder="Brief description of the property"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Units */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Rental Units</h2>
              <Button
                type="button"
                onClick={addUnit}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>

            <div className="space-y-6">
              {units.map((unit, index) => (
                <div key={index} className="relative border border-slate-200 rounded-lg p-6">
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit Number *</Label>
                      <Input
                        value={unit.unitNumber}
                        onChange={(e) => {
                          const newUnits = [...units];
                          newUnits[index].unitNumber = e.target.value;
                          setUnits(newUnits);
                        }}
                        placeholder="e.g., A1, B2"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Monthly Rent (UGX) *</Label>
                      <Input
                        type="number"
                        value={unit.rentAmount}
                        onChange={(e) => {
                          const newUnits = [...units];
                          newUnits[index].rentAmount = e.target.value;
                          setUnits(newUnits);
                        }}
                        placeholder="e.g., 450000"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Bedrooms</Label>
                      <Input
                        type="number"
                        value={unit.bedrooms}
                        onChange={(e) => {
                          const newUnits = [...units];
                          newUnits[index].bedrooms = e.target.value;
                          setUnits(newUnits);
                        }}
                        placeholder="e.g., 2"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Bathrooms</Label>
                      <Input
                        type="number"
                        value={unit.bathrooms}
                        onChange={(e) => {
                          const newUnits = [...units];
                          newUnits[index].bathrooms = e.target.value;
                          setUnits(newUnits);
                        }}
                        placeholder="e.g., 1"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={() => router.push('/onboarding/subscription')}
              variant="outline"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 px-8"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
