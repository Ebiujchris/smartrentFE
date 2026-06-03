'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Send, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ErrorHandler } from '@/lib/errorHandler';
import { formatDate } from '@/lib/dateUtils';

interface Contract {
  id: string;
  title: string;
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  tenant: {
    user: {
      fullName: string;
      email: string;
    };
  };
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function ContractsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      await api.delete(`/contracts/${id}`);
      toast.success('Contract deleted successfully');
      fetchContracts();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Send this contract to the tenant?')) return;

    try {
      await api.post(`/contracts/${id}/send`);
      toast.success('Contract sent to tenant');
      fetchContracts();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'Draft' },
      SENT: { color: 'bg-blue-100 text-blue-700', icon: Send, text: 'Sent' },
      ACCEPTED: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, text: 'Accepted' },
      REJECTED: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejected' },
      EXPIRED: { color: 'bg-orange-100 text-orange-700', icon: Clock, text: 'Expired' },
    };

    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filter === 'ALL') return true;
    return contract.status === filter;
  });

  const stats = {
    total: contracts.length,
    draft: contracts.filter((c) => c.status === 'DRAFT').length,
    sent: contracts.filter((c) => c.status === 'SENT').length,
    accepted: contracts.filter((c) => c.status === 'ACCEPTED').length,
    rejected: contracts.filter((c) => c.status === 'REJECTED').length,
  };

  if (user?.role === 'TENANT') {
    router.push('/tenant-dashboard/contracts');
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenancy Agreements</h1>
          <p className="text-slate-600 mt-1">Create and manage tenancy contracts</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/contracts/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Contract</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Draft</p>
          <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Sent</p>
          <p className="text-2xl font-bold text-blue-700">{stats.sent}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Accepted</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.accepted}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Rejected</p>
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {filter === 'ALL' ? 'No contracts yet' : `No ${filter.toLowerCase()} contracts`}
          </h3>
          <p className="text-slate-600 mb-6">
            {filter === 'ALL'
              ? 'Create your first tenancy contract to get started'
              : `You don't have any ${filter.toLowerCase()} contracts`}
          </p>
          {filter === 'ALL' && (
            <button
              onClick={() => router.push('/dashboard/contracts/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Contract</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {contract.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {contract.propertyName} - Unit {contract.unitNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Tenant</p>
                      <p className="text-sm font-medium text-slate-900">
                        {contract.tenant.user.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rent Amount</p>
                      <p className="text-sm font-medium text-slate-900">
                        UGX {contract.rentAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(contract.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      {getStatusBadge(contract.status)}
                    </div>
                  </div>

                  {contract.status === 'REJECTED' && contract.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-600">{contract.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  {contract.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleSend(contract.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
