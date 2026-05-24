'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, MapPin, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePropertyStore } from '@/store/propertyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PropertiesPage() {
  const { properties, fetchProperties, createProperty, isLoading } = usePropertyStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProperty(formData);
      setFormData({ name: '', address: '', description: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
          <p className="text-slate-600 mt-1">Manage your rental properties</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No properties yet
            </h2>
            <p className="text-slate-600 mb-6">
              Start by adding your first property to manage rental units
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Property
            </Button>
          </div>
        </div>
      ) : (
        /* Properties Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {property.units?.length || 0} units
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {property.name}
              </h3>
              
              <div className="flex items-start gap-2 text-sm text-slate-600 mb-4">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{property.address}</span>
              </div>

              {property.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {property.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <Button variant="outline" className="flex-1 text-sm">
                  View Details
                </Button>
                <Button className="flex-1 text-sm bg-emerald-500 hover:bg-emerald-600">
                  Manage Units
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Property</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sunrise Apartments"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., Plot 123, Kampala Road"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Property'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
