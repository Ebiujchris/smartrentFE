"use client";

import { useEffect, useState } from "react";
import {
  DoorOpen,
  Plus,
  Building2,
  MapPin,
  Loader2,
  UserPlus,
  Eye,
} from "lucide-react";
import { unitService } from "@/services/unit.service";
import type { Property, Unit } from "@/services/property.service";

interface UnitListItem extends Unit {
  propertyName: string;
  propertyAddress: string;
}
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/propertyStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import RegisterTenantModal from "@/components/tenants/RegisterTenantModal";
import { useTenantStore } from "@/store/tenantStore";

export default function UnitsPage() {
  const { properties, fetchProperties, createUnit, isLoading } =
    usePropertyStore();
  const { fetchTenants } = useTenantStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitListItem | null>(null);
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "",
    unitNumber: "",
    rentAmount: "",
    bedrooms: "",
    bathrooms: "",
  });

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Flatten all units from all properties
  const allUnits: UnitListItem[] = properties.flatMap((property: Property) =>
    (property.units || []).map((unit: Unit) => ({
      ...unit,
      propertyName: property.name,
      propertyAddress: property.address,
    })),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUnit(formData.propertyId, {
        unitNumber: formData.unitNumber,
        rentAmount: parseFloat(formData.rentAmount),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms
          ? parseInt(formData.bathrooms)
          : undefined,
        status: "VACANT",
      });

      toast.success("Unit added successfully!", {
        description: `Unit ${formData.unitNumber} has been added.`,
      });

      setFormData({
        propertyId: "",
        unitNumber: "",
        rentAmount: "",
        bedrooms: "",
        bathrooms: "",
      });
      setShowAddModal(false);

      // Refresh properties to show new unit
      await fetchProperties();
    } catch (error) {
      console.error("Failed to add unit:", error);
      toast.error("Failed to add unit", {
        description: "Please check the information and try again.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      VACANT: "bg-slate-100 text-slate-700",
      OCCUPIED: "bg-emerald-100 text-emerald-700",
      MAINTENANCE: "bg-amber-100 text-amber-700",
      RESERVED: "bg-blue-100 text-blue-700",
    };
    return styles[status as keyof typeof styles] || styles.VACANT;
  };

  const handleRegisterTenant = (unit: UnitListItem) => {
    setSelectedUnit(unit);
    setShowRegisterModal(true);
  };

  const handleRegistrationSuccess = async () => {
    await Promise.all([fetchProperties(), fetchTenants()]);
  };

  const handleMarkVacant = async (unitId: string) => {
    setUpdatingUnitId(unitId);
    try {
      await unitService.updateStatus(unitId, "VACANT");
      await fetchProperties();
      toast.success("Unit marked as vacant", {
        description:
          "The active lease was closed and the unit is now available again.",
      });
    } catch (error: any) {
      toast.error("Failed to update unit status", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setUpdatingUnitId(null);
    }
  };

  if (isLoading && allUnits.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Units</h1>
          <p className="text-slate-600 mt-1">
            Manage all rental units ({allUnits.length} total)
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-5 w-5 mr-2" />
              Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Unit</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new unit to a property.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="propertyId">Property *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, propertyId: value as string })
                  }
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, unitNumber: e.target.value })
                    }
                    placeholder="e.g., A1, 101"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rentAmount">Monthly Rent (UGX) *</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    value={formData.rentAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, rentAmount: e.target.value })
                    }
                    placeholder="e.g., 500000"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    placeholder="e.g., 2"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    placeholder="e.g., 1"
                    className="mt-1"
                  />
                </div>
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
                  {isLoading ? "Adding..." : "Add Unit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {allUnits.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No units yet
            </h2>
            <p className="text-slate-600 mb-6">
              {properties.length === 0
                ? "Add properties first, then create rental units within them"
                : "Start adding units to your properties"}
            </p>
            {properties.length > 0 && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Unit
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Units Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUnits.map((unit: UnitListItem) => (
            <div
              key={unit.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(unit.status)}`}
                >
                  {unit.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Unit {unit.unitNumber}
              </h3>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{unit.propertyName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{unit.propertyAddress}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Monthly Rent</span>
                  <span className="font-semibold text-slate-900">
                    UGX {Number(unit.rentAmount).toLocaleString()}
                  </span>
                </div>
                {unit.bedrooms && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Bedrooms</span>
                    <span className="font-semibold text-slate-900">
                      {unit.bedrooms}
                    </span>
                  </div>
                )}
                {unit.bathrooms && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Bathrooms</span>
                    <span className="font-semibold text-slate-900">
                      {unit.bathrooms}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {unit.status === "VACANT" ? (
                  <Button
                    onClick={() => handleRegisterTenant(unit)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register Tenant
                  </Button>
                ) : unit.status === "OCCUPIED" ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: Navigate to tenant details
                        toast.info("Tenant details coming soon");
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Tenant
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-amber-700 border-amber-200 hover:bg-amber-50"
                      disabled={updatingUnitId === unit.id}
                      onClick={() => handleMarkVacant(unit.id)}
                    >
                      {updatingUnitId === unit.id
                        ? "Updating..."
                        : "Mark as Vacant"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Unit {unit.status.toLowerCase()}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Tenant Modal */}
      {selectedUnit && (
        <RegisterTenantModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          unit={{
            id: selectedUnit.id,
            unitNumber: selectedUnit.unitNumber,
            rentAmount: Number(selectedUnit.rentAmount),
            propertyName: selectedUnit.propertyName,
          }}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
