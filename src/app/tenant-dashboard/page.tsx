"use client";

import { useEffect, useState } from "react";
import { Home, CreditCard, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import { tenantService, type Tenant } from "@/services/tenant.service";
import { getLeaseStatus, getPaymentStatus } from "@/lib/rentStatus";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TenantOverviewPage() {
  const { user } = useAuthStore();
  const { payments, fetchPayments } = usePaymentStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);

  useEffect(() => {
    tenantService
      .getCurrentTenant()
      .then(setTenant)
      .catch((error) => console.error("Failed to load tenant overview:", error))
      .finally(() => setTenantLoading(false));
    fetchPayments();
  }, [fetchPayments]);

  const currentLease = tenant?.leases?.find(
    (lease) => getLeaseStatus(lease) === "ACTIVE",
  );
  const leaseForDisplay = currentLease ?? tenant?.leases?.[0];
  const leaseStatus = getLeaseStatus(leaseForDisplay);
  const nextPayment = payments
    .filter(
      (payment) =>
        payment.tenant?.id === tenant?.id &&
        !["PAID", "CANCELLED"].includes(payment.status),
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];
  const paymentStatus = nextPayment ? getPaymentStatus(nextPayment) : null;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
          Welcome, {user?.fullName}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Here is your tenant dashboard overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Quick Stats / Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg flex-shrink-0">
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Your Unit
              </p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
                {tenantLoading
                  ? "Loading..."
                  : leaseForDisplay?.unit.unitNumber ??
                    (leaseStatus === "UPCOMING" ? "Upcoming Lease" : "No Lease")}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {leaseForDisplay
                  ? `${leaseForDisplay.unit.property.name} · ${leaseStatus.toLowerCase()}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Next Payment
              </p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
                {nextPayment
                  ? `UGX ${Number(nextPayment.amount).toLocaleString()}`
                  : "No rent invoice"}
              </p>
              {nextPayment && (
                <p className={`text-xs mt-1 ${paymentStatus === "OVERDUE" ? "text-red-600" : "text-slate-500"}`}>
                  {paymentStatus} · Due {new Date(nextPayment.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Link href="/tenant-dashboard/payments">
            <Button
              variant="outline"
              className="w-full mt-3 sm:mt-4 text-sm sm:text-base"
            >
              View Payments
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-amber-100 rounded-lg flex-shrink-0">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Maintenance
              </p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
                Need Help?
              </p>
            </div>
          </div>
          <Link href="/tenant-dashboard/maintenance">
            <Button
              variant="outline"
              className="w-full mt-3 sm:mt-4 text-sm sm:text-base"
            >
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
          Messages & Notices
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-slate-600">
            No new notices from your property manager.
          </p>
        </div>
      </div>
    </div>
  );
}
