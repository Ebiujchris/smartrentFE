"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { tenantService } from "@/services/tenant.service";
import { formatDate } from "@/lib/dateUtils";

export default function TenantMaintenancePage() {
  const { requests, loading, fetchRequests, createRequest } =
    useMaintenanceStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantUnit, setTenantUnit] = useState<any>(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  // Fetch tenant's current unit on component mount
  useEffect(() => {
    const fetchTenantUnit = async () => {
      try {
        if (user?.tenantProfile?.id) {
          const tenant = await tenantService.getCurrentTenant();
          if (tenant?.leases && tenant.leases.length > 0) {
            const activeLeases = tenant.leases.filter(
              (lease: any) => lease.isActive === true
            );
            const lease = activeLeases[0] || tenant.leases[0];
            if (lease?.unit?.id) {
              setTenantUnit(lease);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch tenant unit:", error);
      } finally {
        setUnitLoading(false);
      }
    };

    fetchTenantUnit();
    fetchRequests();
  }, [fetchRequests, user?.tenantProfile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantUnit?.unit?.id) {
      toast.error("Unable to submit request", {
        description: "We couldn't find your current unit. Please contact support.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        unitId: tenantUnit.unit.id,
      });

      toast.success("Maintenance request submitted successfully", {
        description: "Your landlord will see this issue and respond soon.",
      });
      setIsModalOpen(false);
      setFormData({ title: "", description: "", priority: "MEDIUM" });
    } catch (error: any) {
      toast.error("Failed to submit request", {
        description: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-slate-100 text-slate-700",
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: "bg-slate-100 text-slate-700",
      MEDIUM: "bg-blue-100 text-blue-700",
      HIGH: "bg-orange-100 text-orange-700",
      URGENT: "bg-red-100 text-red-700",
    };
    return styles[priority as keyof typeof styles] || styles.MEDIUM;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            Maintenance
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Report issues to your landlord and track repairs
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
              disabled={unitLoading || !tenantUnit?.unit?.id}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {unitLoading ? "Loading..." : "Report Issue"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Maintenance Issue</DialogTitle>
              <DialogDescription>
                Describe the issue you're experiencing. Your landlord will receive this request and respond to you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Leaking Faucet, Broken Door, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value ?? "MEDIUM" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - No rush</SelectItem>
                    <SelectItem value="MEDIUM">
                      Medium - Needs attention soon
                    </SelectItem>
                    <SelectItem value="HIGH">High - Important issue</SelectItem>
                    <SelectItem value="URGENT">Urgent - Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Please describe the issue in detail so your landlord can address it quickly..."
                  required
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Request to Landlord"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!tenantUnit?.unit?.id && !unitLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">No Active Lease</h3>
              <p className="text-sm text-amber-800 mt-1">
                We couldn't find an active lease for your account. Please contact your landlord to report maintenance issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No maintenance requests
            </h2>
            <p className="text-slate-600">
              Everything seems to be working fine. Report an issue if you need
              help.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request: any) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}
                >
                  {request.status}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}
                >
                  {request.priority}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {request.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {request.description}
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Reported on{" "}
                {formatDate(request.createdAt || request.reportedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
