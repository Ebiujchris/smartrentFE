"use client";

import { useEffect, useMemo, useCallback } from "react";
import {
  DollarSign,
  Home,
  AlertCircle,
  Wrench,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { usePropertyStore } from "@/store/propertyStore";
import { usePaymentStore } from "@/store/paymentStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import StatCard from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { properties, fetchProperties } = usePropertyStore();
  const { payments, fetchPayments } = usePaymentStore();
  const { requests, fetchRequests } = useMaintenanceStore();

  useEffect(() => {
    fetchProperties();
    fetchPayments();
    fetchRequests();
  }, [fetchProperties, fetchPayments, fetchRequests]);

  // Memoize calculated stats to prevent recalculation on every render
  const stats = useMemo(() => {
    const totalUnits = properties.reduce(
      (sum, prop) => sum + (prop.units?.length || 0),
      0,
    );
    const occupiedUnits = properties.reduce(
      (sum, prop) =>
        sum +
        (prop.units?.filter((u: any) => u.status === "OCCUPIED").length || 0),
      0,
    );
    const vacantUnits = totalUnits - occupiedUnits;

    const paidPayments = payments.filter((p: any) => p.status === "PAID");
    const monthlyRevenue = paidPayments.reduce(
      (sum, p: any) => sum + Number(p.amount),
      0,
    );
    const outstandingPayments = payments.filter(
      (p: any) => p.status === "PENDING" || p.status === "OVERDUE",
    );
    const outstandingAmount = outstandingPayments.reduce(
      (sum, p: any) => sum + Number(p.amount),
      0,
    );

    const pendingMaintenance = requests.filter(
      (r: any) => r.status === "PENDING" || r.status === "IN_PROGRESS",
    ).length;

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      monthlyRevenue,
      outstandingAmount,
      pendingMaintenance,
      paidPayments,
      outstandingPayments,
    };
  }, [properties, payments, requests]);

  // Memoize recent payments
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort(
        (a: any, b: any) =>
          new Date(b.paidDate || b.createdAt).getTime() -
          new Date(a.paidDate || a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [payments]);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Here's what's happening with your properties today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`UGX ${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconBgColor="bg-emerald-100"
          trend={{ value: "0%", isPositive: true }}
        />
        <StatCard
          title="Occupied Units"
          value={`${stats.occupiedUnits} / ${stats.totalUnits}`}
          icon={Home}
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Outstanding Rent"
          value={`UGX ${stats.outstandingAmount.toLocaleString()}`}
          icon={AlertCircle}
          iconBgColor="bg-amber-100"
        />
        <StatCard
          title="Maintenance Requests"
          value={stats.pendingMaintenance.toString()}
          icon={Wrench}
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
            Revenue Overview
          </h3>
          <div className="h-56 md:h-64 flex items-center justify-center">
            {payments.length > 0 ? (
              <div className="text-center w-full">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 mb-2">
                  UGX {stats.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6">
                  Total Revenue
                </p>
                <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-md mx-auto">
                  <div className="p-3 md:p-4 bg-emerald-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-emerald-700">
                      {stats.paidPayments.length}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600">
                      Paid
                    </div>
                  </div>
                  <div className="p-3 md:p-4 bg-amber-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-amber-700">
                      {stats.outstandingPayments.length}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600">
                      Outstanding
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <BarChart3 className="h-16 w-16 mx-auto mb-2 text-slate-300" />
                <p>Revenue chart will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
            Unit Occupancy
          </h3>
          <div className="h-56 md:h-64 flex items-center justify-center">
            {stats.totalUnits > 0 ? (
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-2">
                  {stats.totalUnits > 0
                    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
                    : 0}
                  %
                </div>
                <p className="text-sm md:text-base text-slate-600">
                  Occupancy Rate
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      Occupied: {stats.occupiedUnits}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      Vacant: {stats.vacantUnits}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <PieChart className="h-16 w-16 mx-auto mb-2 text-slate-300" />
                <p>Occupancy chart will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Summary or Empty State */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              Get Started with Your First Property
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Add your first property to start managing tenants, tracking
              payments, and more.
            </p>
            <button
              onClick={() => handleNavigate("/dashboard/properties")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors inline-flex items-center gap-2"
            >
              <Home className="h-4 md:h-5 w-4 md:w-5" />
              Add Property
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">
              Your Properties
            </h3>
            <button
              onClick={() => handleNavigate("/dashboard/properties")}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer"
                  onClick={() => handleNavigate(`/dashboard/properties`)}
                >
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {property.name}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    {property.address}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{property.units?.length || 0} units</span>
                    <span>•</span>
                    <span>
                      {property.units?.filter(
                        (u: any) => u.status === "OCCUPIED",
                      ).length || 0}{" "}
                      occupied
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 md:p-6 border-b border-slate-200">
          <h3 className="text-base md:text-lg font-semibold text-slate-900">
            Recent Payments
          </h3>
        </div>
        <div className="p-4 md:p-6">
          {recentPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {recentPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-200 rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <div className="text-sm md:text-base font-medium text-slate-900">
                      {payment.tenant.user.fullName}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500">
                      {payment.lease.unit.property.name} - Unit{" "}
                      {payment.lease.unit.unitNumber}
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <div className="text-sm md:text-base font-semibold text-slate-900">
                      UGX {Number(payment.amount).toLocaleString()}
                    </div>
                    <div
                      className={`text-xs ${payment.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {payment.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
