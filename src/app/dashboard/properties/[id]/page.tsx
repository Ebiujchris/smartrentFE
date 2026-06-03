"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  DoorOpen,
  Home,
  MapPin,
  User,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/propertyStore";
import type { Lease, Property, Unit } from "@/services/property.service";
import { formatDate } from "@/lib/dateUtils";

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

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { currentProperty, fetchProperty, isLoading, error } =
    usePropertyStore();
  const property = currentProperty as Property | null;

  useEffect(() => {
    if (propertyId) {
      fetchProperty(propertyId);
    }
  }, [propertyId, fetchProperty]);

  const stats = useMemo(() => {
    const units: Unit[] = property?.units ?? [];
    const occupied = units.filter((unit) => unit.status === "OCCUPIED").length;
    const vacant = units.filter((unit) => unit.status === "VACANT").length;
    const maintenance = units.filter(
      (unit) => unit.status === "MAINTENANCE",
    ).length;

    return {
      total: units.length,
      occupied,
      vacant,
      maintenance,
    };
  }, [property]);

  if (isLoading && !property) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load property
        </h1>
        <p className="text-slate-600">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/properties")}
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-3 -ml-3 text-slate-600"
            onClick={() => router.push("/dashboard/properties")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {property.name}
              </h1>
              <div className="flex items-start gap-2 text-slate-600 mt-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{property.address}</span>
              </div>
              {property.description && (
                <p className="text-slate-600 mt-3 max-w-3xl">
                  {property.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Units</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {stats.total}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Occupied</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {stats.occupied}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Vacant</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">
            {stats.vacant}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Maintenance</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {stats.maintenance}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Units</h2>
            <p className="text-sm text-slate-600 mt-1">
              View all units and current occupancy for this property.
            </p>
          </div>
        </div>

        {property.units && property.units.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.units.map((unit: Unit) => {
              const activeLease: Lease | undefined = unit.leases?.find(
                (lease: Lease) => lease.isActive,
              );
              const tenant = activeLease?.tenant;

              return (
                <div
                  key={unit.id}
                  className="border border-slate-200 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="h-4 w-4 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Unit {unit.unitNumber}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        UGX {Number(unit.rentAmount).toLocaleString()} / month
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(unit.status)}`}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs">Bedrooms</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {unit.bedrooms ?? "—"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs">Bathrooms</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        {unit.bathrooms ?? "—"}
                      </p>
                    </div>
                  </div>

                  {tenant ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Current Tenant</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {tenant.user?.fullName ?? tenant.fullName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {tenant.user?.email ?? tenant.email}
                      </p>
                      {activeLease && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 pt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Agreement ends{" "}
                            {formatDate(activeLease.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 flex items-center gap-3 text-slate-600">
                      <DoorOpen className="h-5 w-5" />
                      <span>No tenant currently assigned</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/dashboard/properties")}
                    >
                      Manage from Properties
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <DoorOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">
              No units added yet
            </h3>
            <p className="text-slate-600 mt-1">
              This property has no units yet. Add units from the Properties
              page.
            </p>
            <Button
              className="mt-4 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => router.push("/dashboard/properties")}
            >
              Manage Property
            </Button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        Property details loaded successfully.
      </div>
    </div>
  );
}
