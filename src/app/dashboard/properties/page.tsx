"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  MapPin,
  Home,
  X,
  ChevronRight,
  User,
  Calendar,
  CreditCard,
  Wrench,
  DoorOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/propertyStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import RegisterTenantModal from "@/components/tenants/RegisterTenantModal";
import { unitService } from "@/services/unit.service";
import { useTenantStore } from "@/store/tenantStore";
import { formatDate } from "@/lib/dateUtils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case "VACANT":
      return "bg-slate-100 text-slate-600";
    case "OCCUPIED":
      return "bg-emerald-100 text-emerald-700";
    case "MAINTENANCE":
      return "bg-amber-100 text-amber-700";
    case "RESERVED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function paymentStatusColor(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// ─── Unit Detail Panel ────────────────────────────────────────────────────────

function UnitDetailPanel({
  unit,
  property,
  onClose,
  onRefresh,
  onTenantRefresh,
}: {
  unit: any;
  property: any;
  onClose: () => void;
  onRefresh: () => void | Promise<void>;
  onTenantRefresh: () => void | Promise<void>;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch full unit info including active lease, tenant, payments
        const res = await api.get(`/properties/units/${unit.id}`);
        setDetail(res.data);
      } catch {
        // Fallback to the unit data we already have from property list
        setDetail(unit);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [unit.id]);

  const activeLease =
    detail?.leases?.find((l: any) => l.isActive) ?? detail?.activeLease ?? null;
  const tenant = activeLease?.tenant ?? detail?.tenant ?? null;
  const payments = activeLease?.payments ?? [];

  const handleMarkVacant = async () => {
    setIsUpdatingStatus(true);
    try {
      await unitService.updateStatus(unit.id, "VACANT");
      await onRefresh();
      toast.success("Unit marked as vacant", {
        description: `Unit ${unit.unitNumber} is now available for a new tenant.`,
      });
      onClose();
    } catch (error: any) {
      toast.error("Failed to update unit status", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              {property.name}
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              Unit {unit.unitNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Unit Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Monthly Rent</p>
                  <p className="text-lg font-bold text-slate-900">
                    UGX{" "}
                    {Number(
                      detail?.rentAmount ?? unit.rentAmount,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(detail?.status ?? unit.status)}`}
                  >
                    {detail?.status ?? unit.status}
                  </span>
                </div>
                {(detail?.bedrooms || unit.bedrooms) && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Bedrooms</p>
                    <p className="text-lg font-bold text-slate-900">
                      {detail?.bedrooms ?? unit.bedrooms}
                    </p>
                  </div>
                )}
                {(detail?.bathrooms || unit.bathrooms) && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Bathrooms</p>
                    <p className="text-lg font-bold text-slate-900">
                      {detail?.bathrooms ?? unit.bathrooms}
                    </p>
                  </div>
                )}
              </div>

              {/* Active Tenant / Lease */}
              {activeLease && tenant ? (
                <>
                  {/* Tenant Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Current Tenant</p>
                        <p className="font-bold text-slate-900">
                          {tenant.user?.fullName ?? tenant.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Email</p>
                        <p className="font-medium text-slate-800 truncate">
                          {tenant.user?.email ?? tenant.email}
                        </p>
                      </div>
                      {(tenant.user?.phone || tenant.phone) && (
                        <div>
                          <p className="text-slate-500 text-xs">Phone</p>
                          <p className="font-medium text-slate-800">
                            {tenant.user?.phone ?? tenant.phone}
                          </p>
                        </div>
                      )}
                      {tenant.nationalId && (
                        <div>
                          <p className="text-slate-500 text-xs">National ID</p>
                          <p className="font-medium text-slate-800">
                            {tenant.nationalId}
                          </p>
                        </div>
                      )}
                      {tenant.occupation && (
                        <div>
                          <p className="text-slate-500 text-xs">Occupation</p>
                          <p className="font-medium text-slate-800">
                            {tenant.occupation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                      disabled={isUpdatingStatus}
                      onClick={handleMarkVacant}
                    >
                      {isUpdatingStatus ? "Updating..." : "Mark as Vacant"}
                    </Button>
                  </div>

                  {/* Lease Info */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-slate-900">
                        Active Lease
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Start Date</p>
                        <p className="font-medium text-slate-800">
                           {activeLease.startDate ? formatDate(activeLease.startDate) : '-'}
                         </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">End Date</p>
                         <p className="font-medium text-slate-800">
                           {activeLease.endDate ? formatDate(activeLease.endDate) : '-'}
                         </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Rent Amount</p>
                        <p className="font-medium text-slate-800">
                          UGX {Number(activeLease.rentAmount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">
                          Security Deposit
                        </p>
                        <p className="font-medium text-slate-800">
                          UGX {Number(activeLease.deposit).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-purple-500" />
                      <h3 className="font-semibold text-slate-900">
                        Payment History
                      </h3>
                    </div>
                    {payments.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No payments recorded yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {payments.slice(0, 5).map((p: any) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                UGX {Number(p.amount).toLocaleString()}
                              </p>
                               <p className="text-xs text-slate-500">
                                 Due: {p.dueDate ? formatDate(p.dueDate) : '-'}
                               </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${paymentStatusColor(p.status)}`}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Vacant unit — show register prompt */
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <DoorOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">
                    Unit is Vacant
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    No tenant is currently assigned to this unit.
                  </p>
                  <Button
                    onClick={() => setRegisterOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register Tenant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Register Tenant Modal */}
      {registerOpen && (
        <RegisterTenantModal
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          unit={{
            id: unit.id,
            unitNumber: unit.unitNumber,
            rentAmount: Number(unit.rentAmount),
            propertyName: property.name,
          }}
          onSuccess={async () => {
            await Promise.all([onRefresh(), onTenantRefresh()]);
            onClose();
          }}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, fetchProperties, createProperty, createUnit, isLoading } =
    usePropertyStore();
  const { fetchTenants } = useTenantStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
  });
  const [unitFormData, setUnitFormData] = useState({
    unitNumber: "",
    rentAmount: "",
    bedrooms: "",
    bathrooms: "",
  });

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProperty(formData);
      toast.success("Property added successfully!", {
        description: `${formData.name} has been added to your properties.`,
      });
      setFormData({ name: "", address: "", description: "" });
      setShowAddModal(false);
    } catch {
      toast.error("Failed to add property", {
        description: "Please check the information and try again.",
      });
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    try {
      await createUnit(selectedProperty.id, {
        unitNumber: unitFormData.unitNumber,
        rentAmount: parseFloat(unitFormData.rentAmount),
        bedrooms: unitFormData.bedrooms
          ? parseInt(unitFormData.bedrooms)
          : undefined,
        bathrooms: unitFormData.bathrooms
          ? parseInt(unitFormData.bathrooms)
          : undefined,
        status: "VACANT",
      });
      toast.success("Unit added successfully!", {
        description: `Unit ${unitFormData.unitNumber} has been added to ${selectedProperty.name}.`,
      });
      setUnitFormData({
        unitNumber: "",
        rentAmount: "",
        bedrooms: "",
        bathrooms: "",
      });
      await fetchProperties();
    } catch {
      toast.error("Failed to add unit", {
        description: "Please check the information and try again.",
      });
    }
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Properties
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Manage your rental properties
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-sm md:text-base"
          size="sm"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" /> Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              No properties yet
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Start by adding your first property to manage rental units
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-sm md:text-base"
              size="sm"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" /> Add Your First
              Property
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {properties.map((property) => {
            const vacant =
              property.units?.filter((u: any) => u.status === "VACANT")
                .length ?? 0;
            const occupied =
              property.units?.filter((u: any) => u.status === "OCCUPIED")
                .length ?? 0;
            return (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {property.units?.length ?? 0} units
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {property.name}
                  </h3>
                  <div className="flex items-start gap-1.5 text-sm text-slate-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{property.address}</span>
                  </div>
                  {property.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {property.description}
                    </p>
                  )}
                  {/* Quick stats */}
                  <div className="flex gap-3 text-xs mb-4">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle className="h-3 w-3" /> {occupied} occupied
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <DoorOpen className="h-3 w-3" /> {vacant} vacant
                    </span>
                  </div>
                </div>

                {/* Units list */}
                {property.units && property.units.length > 0 && (
                  <div className="border-t border-slate-100 px-6 py-3 space-y-1">
                    {property.units.slice(0, 4).map((unit: any) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          setSelectedProperty(property);
                          setSelectedUnit(unit);
                        }}
                        className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700 font-medium">
                            Unit {unit.unitNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(unit.status)}`}
                          >
                            {unit.status}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                    {property.units.length > 4 && (
                      <p className="text-xs text-center text-slate-400 pt-1">
                        +{property.units.length - 4} more units
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 md:px-6 py-3 md:py-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs md:text-sm"
                    onClick={() =>
                      router.push(`/dashboard/properties/${property.id}`)
                    }
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-xs md:text-sm"
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowUnitsModal(true);
                    }}
                  >
                    Manage Units
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unit Detail Panel */}
      {selectedUnit && selectedProperty && !showUnitsModal && (
        <UnitDetailPanel
          unit={selectedUnit}
          property={selectedProperty}
          onClose={() => setSelectedUnit(null)}
          onRefresh={fetchProperties}
          onTenantRefresh={fetchTenants}
        />
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-full sm:max-w-md w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              Add New Property
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="prop-name">Property Name *</Label>
                <Input
                  id="prop-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Sunrise Apartments"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="prop-address">Address *</Label>
                <Input
                  id="prop-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g., Plot 123, Kampala Road"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="prop-desc">Description (Optional)</Label>
                <textarea
                  id="prop-desc"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
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
                  {isLoading ? "Creating..." : "Create Property"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Units Modal */}
      {showUnitsModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-full sm:max-w-3xl w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  Manage Units
                </h2>
                <p className="text-slate-600">{selectedProperty.name}</p>
              </div>
              <Button
                onClick={() => setShowUnitsModal(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>

            {/* Existing Units */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                Existing Units ({selectedProperty.units?.length ?? 0})
              </h3>
              {selectedProperty.units?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {selectedProperty.units.map((unit: any) => (
                    <div
                      key={unit.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          Unit {unit.unitNumber}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(unit.status)}`}
                        >
                          {unit.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>
                          Rent: UGX {Number(unit.rentAmount).toLocaleString()}
                        </div>
                        {unit.bedrooms && <div>Bedrooms: {unit.bedrooms}</div>}
                        {unit.bathrooms && (
                          <div>Bathrooms: {unit.bathrooms}</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full text-xs"
                        onClick={() => {
                          setSelectedUnit(unit);
                          setShowUnitsModal(false);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No units added yet
                </p>
              )}
            </div>

            {/* Add New Unit Form */}
            <div className="border-t border-slate-200 pt-4 md:pt-6">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">
                Add New Unit
              </h3>
              <form onSubmit={handleAddUnit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitNumber">Unit Number *</Label>
                    <Input
                      id="unitNumber"
                      value={unitFormData.unitNumber}
                      onChange={(e) =>
                        setUnitFormData({
                          ...unitFormData,
                          unitNumber: e.target.value,
                        })
                      }
                      placeholder="e.g., A1, 101"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitRent">Monthly Rent (UGX) *</Label>
                    <Input
                      id="unitRent"
                      type="number"
                      value={unitFormData.rentAmount}
                      onChange={(e) =>
                        setUnitFormData({
                          ...unitFormData,
                          rentAmount: e.target.value,
                        })
                      }
                      placeholder="e.g., 500000"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitBedrooms">Bedrooms</Label>
                    <Input
                      id="unitBedrooms"
                      type="number"
                      value={unitFormData.bedrooms}
                      onChange={(e) =>
                        setUnitFormData({
                          ...unitFormData,
                          bedrooms: e.target.value,
                        })
                      }
                      placeholder="e.g., 2"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitBathrooms">Bathrooms</Label>
                    <Input
                      id="unitBathrooms"
                      type="number"
                      value={unitFormData.bathrooms}
                      onChange={(e) =>
                        setUnitFormData({
                          ...unitFormData,
                          bathrooms: e.target.value,
                        })
                      }
                      placeholder="e.g., 1"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? "Adding..." : "Add Unit"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
