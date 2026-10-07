"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Home,
  Search,
  ArrowUpDown,
  Building2,
  LayoutGrid,
  Table2,
  Pencil,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenantStore } from "@/store/tenantStore";
import { usePaymentStore } from "@/store/paymentStore";
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
import { getLeaseStatus, getPaymentStatus, type LeaseStatus } from "@/lib/rentStatus";
import { ErrorHandler } from "@/lib/errorHandler";
import { leaseService } from "@/services/lease.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Tenant, TenantLeaseInfo } from "@/services/tenant.service";
import PaymentReceipt from "@/components/receipts/PaymentReceipt";

interface TenantPayment {
  id: string;
  tenant?: { id: string };
  leaseId?: string;
  lease?: { id: string };
  status: string;
  dueDate: string;
  amount: number;
}

interface TenantItem extends Tenant {
  leases?: TenantLeaseInfo[];
}

type SortOption = "name" | "unit" | "property";
type ViewMode = "cards" | "table";

const getDisplayedLease = (tenant: TenantItem) =>
  tenant.leases?.find((lease) => getLeaseStatus(lease) === "ACTIVE") ??
  tenant.leases?.[0];

const leaseStatusClasses: Record<LeaseStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  UPCOMING: "bg-blue-100 text-blue-700 border border-blue-200",
  EXPIRED: "bg-amber-100 text-amber-800 border border-amber-200",
  ENDED: "bg-slate-100 text-slate-600 border border-slate-200",
  UNASSIGNED: "bg-slate-100 text-slate-600 border border-slate-200",
};

const leaseStatusLabels: Record<LeaseStatus, string> = {
  ACTIVE: "Active tenancy",
  UPCOMING: "Upcoming tenancy",
  EXPIRED: "Past end date",
  ENDED: "Tenancy ended",
  UNASSIGNED: "No tenancy",
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getSuggestedDueDate = (lease: TenantLeaseInfo) => {
  const startDate = new Date(lease.startDate);
  const endDate = new Date(lease.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const anchorDate = startDate > today ? startDate : today;
  const rentDay = startDate.getDate();
  let dueDate = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    Math.min(rentDay, new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate()),
  );

  if (dueDate < anchorDate) {
    const nextMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);
    dueDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      Math.min(rentDay, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()),
    );
  }

  if (dueDate > endDate) dueDate = endDate;
  return formatDateInput(dueDate);
};

const emptyCreateForm = {
  email: "",
  password: "",
  fullName: "",
  phone: "",
  nationalId: "",
  emergencyContact: "",
  occupation: "",
};

const emptyEditForm = {
  fullName: "",
  phone: "",
  nationalId: "",
  emergencyContact: "",
  occupation: "",
};

export default function TenantsPage() {
  const {
    tenants,
    loading,
    fetchTenants,
    createTenant,
    updateTenant,
  } = useTenantStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [leaseToEnd, setLeaseToEnd] = useState<{
    tenant: TenantItem;
    lease: TenantLeaseInfo;
  } | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("unit");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [formData, setFormData] = useState(emptyCreateForm);
  const [editFormData, setEditFormData] = useState(emptyEditForm);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isEndingTenancy, setIsEndingTenancy] = useState(false);

  // Payment management state
  const { payments, fetchPayments, recordPayment, createPayment } =
    usePaymentStore();
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] =
    useState<TenantItem | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [recordData, setRecordData] = useState({
    amount: "",
    dueDate: "",
    method: "CASH",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchTenants();
    fetchPayments(); // Fetch payments to show status
  }, [fetchTenants, fetchPayments]);

  const typedTenants = tenants as TenantItem[];

  const propertyOptions = useMemo(() => {
    const propertyMap = new Map<string, string>();

    typedTenants.forEach((tenant) => {
      tenant.leases?.forEach((lease) => {
        propertyMap.set(lease.unit.property.id, lease.unit.property.name);
      });
    });

    return Array.from(propertyMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [typedTenants]);

  const filteredTenants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...typedTenants]
      .filter((tenant) => {
        const primaryLease = getDisplayedLease(tenant);
        const propertyName = primaryLease?.unit.property.name ?? "";
        const unitNumber = primaryLease?.unit.unitNumber ?? "";

        const matchesProperty =
          selectedProperty === "all" ||
          tenant.leases?.some(
            (lease) => lease.unit.property.id === selectedProperty,
          );

        const matchesSearch =
          normalizedSearch.length === 0 ||
          tenant.user.fullName.toLowerCase().includes(normalizedSearch) ||
          tenant.user.email.toLowerCase().includes(normalizedSearch) ||
          propertyName.toLowerCase().includes(normalizedSearch) ||
          unitNumber.toLowerCase().includes(normalizedSearch);

        return matchesProperty && matchesSearch;
      })
      .sort((a, b) => {
        const leaseA = getDisplayedLease(a);
        const leaseB = getDisplayedLease(b);

        const unitA = leaseA?.unit.unitNumber ?? "ZZZ";
        const unitB = leaseB?.unit.unitNumber ?? "ZZZ";
        const propertyA = leaseA?.unit.property.name ?? "ZZZ";
        const propertyB = leaseB?.unit.property.name ?? "ZZZ";
        const nameA = a.user.fullName;
        const nameB = b.user.fullName;

        if (sortBy === "property") {
          return (
            propertyA.localeCompare(propertyB) ||
            unitA.localeCompare(unitB, undefined, {
              numeric: true,
              sensitivity: "base",
            }) ||
            nameA.localeCompare(nameB)
          );
        }

        if (sortBy === "name") {
          return nameA.localeCompare(nameB);
        }

        return (
          unitA.localeCompare(unitB, undefined, {
            numeric: true,
            sensitivity: "base",
          }) ||
          propertyA.localeCompare(propertyB) ||
          nameA.localeCompare(nameB)
        );
      });
  }, [typedTenants, searchTerm, selectedProperty, sortBy]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTenant(formData);
      toast.success("Tenant added successfully!", {
        description: `${formData.fullName} has been added to your system.`,
      });
      setIsCreateOpen(false);
      setFormData(emptyCreateForm);
      await fetchTenants();
    } catch (error) {
      console.error("Failed to create tenant:", error);
      toast.error("Failed to add tenant", {
        description: "Please check the information and try again.",
      });
    }
  };

  const openEditDialog = (tenant: TenantItem) => {
    setSelectedTenant(tenant);
    setEditFormData({
      fullName: tenant.user.fullName || "",
      phone: tenant.user.phone || "",
      nationalId: tenant.nationalId || "",
      emergencyContact: tenant.emergencyContact || "",
      occupation: tenant.occupation || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setIsSavingEdit(true);
    try {
      await updateTenant(selectedTenant.id, editFormData);
      await fetchTenants();
      toast.success("Tenant updated", {
        description: `${editFormData.fullName} has been updated successfully.`,
      });
      setIsEditOpen(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error("Failed to update tenant:", error);
      toast.error("Failed to update tenant", {
        description: "Please try again.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEndTenancy = async () => {
    if (!leaseToEnd) return;

    setIsEndingTenancy(true);
    try {
      await leaseService.terminateLease(leaseToEnd.lease.id);
      await fetchTenants();
      toast.success("Tenancy ended", {
        description: `${leaseToEnd.tenant.user.fullName}'s lease has ended and unit ${leaseToEnd.lease.unit.unitNumber} is now vacant.`,
      });
      setLeaseToEnd(null);
    } catch (error) {
      console.error("Failed to end tenancy:", error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsEndingTenancy(false);
    }
  };

  // Keep the next charge actionable while showing the tenant's total balance.
  const getNextUnpaidPayment = (tenantId: string) => {
    const tenantPayments = (payments as TenantPayment[]).filter(
      (payment) =>
        payment.tenant?.id === tenantId &&
        !["PAID", "CANCELLED"].includes(payment.status),
    );

    if (tenantPayments.length === 0) return null;

    // Sort by due date and get the earliest
    const nextPayment = tenantPayments.sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];

    const statuses = tenantPayments.map(getPaymentStatus);
    const status = statuses.includes("OVERDUE")
      ? "OVERDUE"
      : getPaymentStatus(nextPayment);

    return {
      ...nextPayment,
      status,
      outstandingCount: tenantPayments.length,
      outstandingTotal: tenantPayments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0,
      ),
    };
  };

  const getNoRentLabel = (tenantId: string, leaseId?: string) => {
    const tenantPayments = (payments as TenantPayment[]).filter(
      (payment) =>
        payment.tenant?.id === tenantId &&
        (!leaseId || (payment.leaseId || payment.lease?.id) === leaseId),
    );
    return tenantPayments.some((payment) => payment.status === "PAID")
      ? "Paid up"
      : "No rent scheduled";
  };

  const getRentStatusLabel = (payment: TenantPayment) => {
    const status = getPaymentStatus(payment);
    if (status === "OVERDUE") return "Overdue";

    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() ? "Due today" : "Upcoming";
  };

  // Handle marking existing payment as paid
  const handleMarkAsPaid = (payment: TenantPayment) => {
    setSelectedPayment(payment);
    setIsCreatingNew(false);
    setIsMarkPaidOpen(true);
  };

  // Handle creating a new payment (for tenants without pending payments)
  const handleRecordNewPayment = (tenant: TenantItem) => {
    const lease = tenant.leases?.find((item) => {
      const status = getLeaseStatus(item);
      return status === "ACTIVE" || status === "UPCOMING";
    });
    if (!lease) {
      toast.error("There is no active or upcoming tenancy to schedule rent against");
      return;
    }

    setSelectedTenantForPayment(tenant);
    setSelectedPayment(null);
    setIsCreatingNew(true);
    setRecordData({
      amount: String(Number(lease.rentAmount)),
      dueDate: getSuggestedDueDate(lease),
      method: "CASH",
      reference: "",
      notes: "",
    });
    setIsMarkPaidOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const noteValue = recordData.notes?.trim();
      const combinedNotes = noteValue
        ? `SOURCE:MANUAL_CLEARANCE\n${noteValue}`
        : "SOURCE:MANUAL_CLEARANCE";

      let updatedPayment;

      if (isCreatingNew) {
        // Creating a new payment
        if (!selectedTenantForPayment || !recordData.amount) {
          toast.error("Please enter payment amount");
          return;
        }

        const activeLease = selectedTenantForPayment.leases?.find((lease) => {
          const status = getLeaseStatus(lease);
          return status === "ACTIVE" || status === "UPCOMING";
        });
        if (!activeLease || !recordData.dueDate) {
          toast.error("Choose an active or upcoming tenancy and due date");
          return;
        }

        await createPayment({
          leaseId: activeLease.id,
          tenantId: selectedTenantForPayment.id,
          amount: parseFloat(recordData.amount),
          dueDate: recordData.dueDate,
        });

        toast.success("Rent due date scheduled", {
          description: `UGX ${Number(recordData.amount).toLocaleString()} is due ${recordData.dueDate} for ${selectedTenantForPayment.user.fullName}.`,
        });
      } else {
        // Marking existing payment as paid
        if (!selectedPayment) return;

        updatedPayment = await recordPayment(
          selectedPayment.id,
          recordData.method,
          recordData.reference,
          combinedNotes,
        );
        toast.success("Payment marked as paid!", {
          description: `UGX ${Number(selectedPayment.amount).toLocaleString()} has been recorded.`,
        });
      }

      setIsMarkPaidOpen(false);
      setSelectedPayment(null);
      setSelectedTenantForPayment(null);
      setIsCreatingNew(false);
      setRecordData({ amount: "", dueDate: "", method: "CASH", reference: "", notes: "" });

      // Refresh the ledger after adding a due date or recording a receipt.
      await fetchPayments();
      if (updatedPayment) {
        setReceiptPayment(updatedPayment);
        setShowReceipt(true);
      }
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment", {
        description: "Please try again or contact support.",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewReceipt = (payment: any) => {
    setReceiptPayment(payment);
    setShowReceipt(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700",
      CANCELLED: "bg-slate-100 text-slate-700",
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Tenants
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Manage your tenants like a rent roll
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-sm md:text-base"
              size="sm"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) =>
                      setFormData({ ...formData, nationalId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Add Tenant
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information. Unit assignment stays linked to the
              active lease.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-fullName">Full Name *</Label>
                <Input
                  id="edit-fullName"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-nationalId">National ID</Label>
                <Input
                  id="edit-nationalId"
                  value={editFormData.nationalId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nationalId: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-occupation">Occupation</Label>
                <Input
                  id="edit-occupation"
                  value={editFormData.occupation}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      occupation: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
                <Input
                  id="edit-emergencyContact"
                  value={editFormData.emergencyContact}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      emergencyContact: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={isSavingEdit}
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!leaseToEnd}
        onOpenChange={(open) => !open && !isEndingTenancy && setLeaseToEnd(null)}
      >
        <DialogContent className="max-w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Tenancy</DialogTitle>
            <DialogDescription>
              End {leaseToEnd?.tenant.user.fullName}&apos;s lease for unit{" "}
              {leaseToEnd?.lease.unit.unitNumber}? The lease will be deactivated
              and the unit marked vacant. Payment and agreement history will be
              kept.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLeaseToEnd(null)}
              disabled={isEndingTenancy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-amber-700 hover:bg-amber-800 text-white"
              onClick={handleEndTenancy}
              disabled={isEndingTenancy}
            >
              {isEndingTenancy ? "Ending..." : "End Tenancy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {tenants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              No tenants yet
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Add tenants to start tracking rent payments and leases
            </p>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Tenant
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-emerald-50 via-white to-purple-50 rounded-xl shadow-sm border border-emerald-100 p-3 md:p-5 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3">
              <div className="relative md:col-span-2">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tenant, unit, or property"
                  className="pl-9 text-sm md:text-base"
                />
              </div>

              <Select
                value={selectedProperty}
                onValueChange={(value) => setSelectedProperty(value ?? "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All properties</SelectItem>
                  {propertyOptions.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy((value as SortOption | null) ?? "unit")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort tenants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Sort by unit number</SelectItem>
                  <SelectItem value="property">Sort by property</SelectItem>
                  <SelectItem value="name">Sort by tenant name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-center md:justify-between text-xs md:text-sm text-slate-600">
              <span>
                Showing <strong>{filteredTenants.length}</strong> of{" "}
                <strong>{typedTenants.length}</strong> tenants
              </span>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
                <span className="hidden sm:inline-flex items-center gap-2 text-slate-500 text-xs md:text-sm">
                  <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                  Organized for quick rent-roll scanning
                </span>

                <div className="inline-flex rounded-lg border border-emerald-100 p-1 bg-white/80 shadow-sm">
                  <Button
                    type="button"
                    size="sm"
                    variant={viewMode === "table" ? "default" : "ghost"}
                    className={
                      viewMode === "table"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 text-xs md:text-sm"
                        : "text-slate-600 hover:text-emerald-700 text-xs md:text-sm"
                    }
                    onClick={() => setViewMode("table")}
                  >
                    <Table2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Table</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    className={
                      viewMode === "cards"
                        ? "bg-purple-500 text-white hover:bg-purple-600 text-xs md:text-sm"
                        : "text-slate-600 hover:text-purple-700 text-xs md:text-sm"
                    }
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Cards</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {filteredTenants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-12 text-center">
              <Search className="h-8 w-8 md:h-10 md:w-10 text-slate-300 mx-auto mb-3" />
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                No matching tenants
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                Try changing the property filter, search term, or sort option.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px]">
                  <thead className="bg-gradient-to-r from-emerald-50 to-purple-50 border-b border-emerald-100">
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Tenant
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Property
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Unit
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Contact
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Tenancy
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Rent status
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 md:px-6 py-3 md:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => {
                      const displayedLease = getDisplayedLease(tenant);
                      const leaseStatus = getLeaseStatus(displayedLease);
                      const propertyName = displayedLease?.unit.property.name ?? "—";
                      const unitNumber = displayedLease?.unit.unitNumber ?? "—";
                      const nextPayment = getNextUnpaidPayment(tenant.id);

                      return (
                        <tr
                          key={tenant.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div>
                              <div className="font-semibold text-slate-900">
                                {tenant.user.fullName}
                              </div>
                              <div className="text-sm text-slate-500">
                                {tenant.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-slate-700">
                            {propertyName}
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                              <Home className="h-3.5 w-3.5" />
                              Unit {unitNumber}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-slate-600">
                            <div>{tenant.user.phone || "No phone"}</div>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${leaseStatusClasses[leaseStatus]}`}
                            >
                              {leaseStatusLabels[leaseStatus]}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            {nextPayment ? (
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                    nextPayment.status,
                                  )}`}
                                >
                                  {getStatusIcon(nextPayment.status)}
                                  {getRentStatusLabel(nextPayment)}
                                </span>
                                <span className="text-xs text-slate-500">
                                  UGX {Number(nextPayment.outstandingTotal).toLocaleString()} outstanding
                                  {nextPayment.outstandingCount > 1 ? ` · ${nextPayment.outstandingCount} items` : ` · Due ${new Date(nextPayment.dueDate).toLocaleDateString("en-UG")}`}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">
                                {getNoRentLabel(tenant.id, displayedLease?.id)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                              {nextPayment ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs w-full md:w-auto"
                                    onClick={() =>
                                      handleMarkAsPaid(nextPayment)
                                    }
                                  >
                                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    Record payment
                                  </Button>
                              ) : leaseStatus === "ACTIVE" || leaseStatus === "UPCOMING" ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs w-full md:w-auto"
                                    onClick={() =>
                                      handleRecordNewPayment(tenant)
                                    }
                                  >
                                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    Schedule rent
                                  </Button>
                              ) : null}
                              {displayedLease?.isActive && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-amber-800 border-amber-200 hover:bg-amber-50 bg-white text-xs w-full md:w-auto"
                                  onClick={() => setLeaseToEnd({ tenant, lease: displayedLease })}
                                >
                                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                  End tenancy
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-xs w-full md:w-auto"
                                onClick={() => openEditDialog(tenant)}
                              >
                                <Pencil className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span className="md:inline">Edit</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTenants.map((tenant) => {
                const displayedLease = getDisplayedLease(tenant);
                const leaseStatus = getLeaseStatus(displayedLease);
                const unitNumber = displayedLease?.unit.unitNumber;
                const propertyName = displayedLease?.unit.property.name;
                const propertyAddress = displayedLease?.unit.property.address;
                const nextPayment = getNextUnpaidPayment(tenant.id);

                return (
                  <div
                    key={tenant.id}
                    className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${leaseStatusClasses[leaseStatus]}`}>
                        {leaseStatusLabels[leaseStatus]}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {tenant.user.fullName}
                    </h3>

                    {displayedLease ? (
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                            <Home className="h-3.5 w-3.5" />
                            Unit {unitNumber}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                            <Building2 className="h-3.5 w-3.5" />
                            {propertyName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{propertyAddress}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                        This tenant has no current or upcoming tenancy assigned.
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{tenant.user.email}</span>
                      </div>
                      {tenant.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{tenant.user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Rent status */}
                    {nextPayment ? (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-600">
                            Rent status
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              nextPayment.status,
                            )}`}
                          >
                            {getStatusIcon(nextPayment.status)}
                            {getRentStatusLabel(nextPayment)}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          UGX {Number(nextPayment.outstandingTotal).toLocaleString()} outstanding
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Next due {new Date(nextPayment.dueDate).toLocaleDateString("en-UG")}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        {getNoRentLabel(tenant.id, displayedLease?.id)}
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2">
                      {nextPayment ? (
                          <Button
                            type="button"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => handleMarkAsPaid(nextPayment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Record payment
                          </Button>
                      ) : leaseStatus === "ACTIVE" || leaseStatus === "UPCOMING" ? (
                          <Button
                            type="button"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleRecordNewPayment(tenant)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule rent
                          </Button>
                      ) : null}
                      {displayedLease?.isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full text-amber-800 border-amber-200 hover:bg-amber-50 bg-white"
                          onClick={() => setLeaseToEnd({ tenant, lease: displayedLease })}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          End tenancy
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Mark as Paid / Record Payment Dialog */}
      <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
        <DialogContent className="max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingNew ? "Schedule Rent Due" : "Record Rent Payment"}
            </DialogTitle>
            <DialogDescription>
              {isCreatingNew
                ? "Add a rent charge with its due date. It will remain outstanding until recorded as received."
                : "Record money received against this rent charge."}
            </DialogDescription>
          </DialogHeader>
          {(selectedPayment || isCreatingNew) && (
            <form onSubmit={handleRecordPayment} className="space-y-4 pb-2">
              <div className="space-y-2">
                <Label>Amount</Label>
                {isCreatingNew ? (
                  <Input
                    type="number"
                    placeholder="Enter amount in UGX"
                    value={recordData.amount}
                    onChange={(e) =>
                      setRecordData({ ...recordData, amount: e.target.value })
                    }
                    required
                  />
                ) : (
                  <Input
                    value={`UGX ${Number(selectedPayment.amount).toLocaleString()}`}
                    disabled
                    className="bg-slate-50"
                  />
                )}
              </div>
              {isCreatingNew && (
                <div className="space-y-2">
                  <Label htmlFor="rentDueDate">Rent due date</Label>
                  <Input
                    id="rentDueDate"
                    type="date"
                    value={recordData.dueDate}
                    onChange={(e) =>
                      setRecordData({ ...recordData, dueDate: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-slate-500">
                    This schedules rent; it does not mark the rent as received.
                  </p>
                </div>
              )}
              {!isCreatingNew && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select
                      value={recordData.method}
                      onValueChange={(value) =>
                        setRecordData({
                          ...recordData,
                          method: value || "CASH",
                        })
                      }
                    >
                      <SelectTrigger id="method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="MTN_MOBILE_MONEY">
                          MTN Mobile Money
                        </SelectItem>
                        <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
                        <SelectItem value="CHECK">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Number (Optional)</Label>
                    <Input
                      id="reference"
                      value={recordData.reference}
                      onChange={(e) =>
                        setRecordData({
                          ...recordData,
                          reference: e.target.value,
                        })
                      }
                      placeholder="Transaction reference"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={recordData.notes}
                      onChange={(e) =>
                        setRecordData({
                          ...recordData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Additional notes"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6 sticky bottom-0 bg-white pb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsMarkPaidOpen(false);
                    setSelectedPayment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6"
                >
                  {isCreatingNew ? "Schedule rent due" : "Record payment received"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {receiptPayment && (
            <PaymentReceipt
              payment={receiptPayment}
              onClose={() => setShowReceipt(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
