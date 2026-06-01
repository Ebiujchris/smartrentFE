'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMaintenanceStore } from '@/store/maintenanceStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { requests, loading, fetchRequests, updateStatus } = useMaintenanceStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      toast.success('Status updated successfully!', {
        description: `Maintenance request status changed to ${status.replace('_', ' ').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status', {
        description: 'Please try again.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-slate-100 text-slate-700',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      LOW: 'bg-slate-100 text-slate-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700',
    };
    return styles[priority as keyof typeof styles] || styles.MEDIUM;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading && requests.length === 0) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Track maintenance requests</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              No maintenance requests
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              All maintenance requests will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {requests.map((request: any) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 break-words">{request.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="hidden sm:inline">{request.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-slate-600 mb-3 break-words">{request.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm text-slate-500">
                    <div className="truncate">
                      <span className="font-medium">Property:</span> {request.unit.property.name}
                    </div>
                    <div>
                      <span className="font-medium">Unit:</span> {request.unit.unitNumber}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Tenant:</span> {request.tenant.user.fullName}
                    </div>
                     <div>
                       <span className="font-medium">Reported:</span> {request.reportedAt ? new Date(request.reportedAt).toLocaleDateString() : '-'}
                     </div>
                  </div>
                </div>
                <div className="w-full lg:w-auto lg:ml-4">
                  <Select
                    value={request.status}
                    onValueChange={(value) => handleStatusChange(request.id, value as string)}
                    disabled={updatingId === request.id}
                  >
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {request.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs md:text-sm text-slate-600 break-words">
                    <span className="font-medium">Notes:</span> {request.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
