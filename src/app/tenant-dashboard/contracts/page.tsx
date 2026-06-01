'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ErrorHandler } from '@/lib/errorHandler';
import { formatDate } from '@/lib/dateUtils';

interface Contract {
  id: string;
  title: string;
  propertyName: string;
  unitNumber: string;
  address: string;
  rentAmount: number;
  deposit: number;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  landlord: {
    fullName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function TenantContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'Draft' },
      SENT: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, text: 'Awaiting Review' },
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

  const pendingContracts = contracts.filter((c) => c.status === 'SENT');
  const acceptedContracts = contracts.filter((c) => c.status === 'ACCEPTED');
  const rejectedContracts = contracts.filter((c) => c.status === 'REJECTED');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Lease Agreements</h1>
        <p className="text-slate-600 mt-1">Review and manage your tenancy contracts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Pending Review</p>
          <p className="text-2xl font-bold text-blue-700">{pendingContracts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Accepted</p>
          <p className="text-2xl font-bold text-emerald-700">{acceptedContracts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Rejected</p>
          <p className="text-2xl font-bold text-red-700">{rejectedContracts.length}</p>
        </div>
      </div>

      {/* Pending Contracts - Priority */}
      {pendingContracts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Pending Your Review
          </h2>
          <div className="grid gap-4">
            {pendingContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
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
                        <p className="text-xs text-slate-500">Landlord</p>
                        <p className="text-sm font-medium text-slate-900">
                          {contract.landlord.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Monthly Rent</p>
                        <p className="text-sm font-medium text-slate-900">
                          UGX {contract.rentAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="text-sm font-medium text-slate-900">
                          {contract.duration} months
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        {getStatusBadge(contract.status)}
                      </div>
                    </div>

                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">
                        ⚠️ Action Required: Please review and respond to this contract
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/tenant-dashboard/contracts/${contract.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                  >
                    Review Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Contracts */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Contracts</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No contracts yet</h3>
            <p className="text-slate-600">
              You don't have any tenancy contracts at the moment
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
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
                        <p className="text-xs text-slate-500 mt-1">{contract.address}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500">Landlord</p>
                        <p className="text-sm font-medium text-slate-900">
                          {contract.landlord.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Monthly Rent</p>
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
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-700 mb-1">Your Rejection Reason:</p>
                        <p className="text-sm text-red-600">{contract.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/tenant-dashboard/contracts/${contract.id}`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
