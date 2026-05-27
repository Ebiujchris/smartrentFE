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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-600 mt-1">Track maintenance requests</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No maintenance requests
            </h2>
            <p className="text-slate-600 mb-6">
              All maintenance requests will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request: any) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{request.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">{request.description}</p>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div>
                      <span className="font-medium">Property:</span> {request.unit.property.name}
                    </div>
                    <div>
                      <span className="font-medium">Unit:</span> {request.unit.unitNumber}
                    </div>
                    <div>
                      <span className="font-medium">Tenant:</span> {request.tenant.user.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Reported:</span> {new Date(request.reportedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Select
                    value={request.status}
                    onValueChange={(value) => handleStatusChange(request.id, value as string)}
                    disabled={updatingId === request.id}
                  >
                    <SelectTrigger className="w-40">
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
                  <p className="text-sm text-slate-600">
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
