'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, DollarSign, Home, User, Edit, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ErrorHandler } from '@/lib/errorHandler';
import { formatDate } from '@/lib/dateUtils';

interface Contract {
  id: string;
  title: string;
  content: string;
  propertyName: string;
  unitNumber: string;
  address: string;
  rentAmount: number;
  deposit: number;
  startDate: string;
  endDate: string;
  duration: number;
  terms: string[];
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  tenant: {
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  };
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function LandlordContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/contracts/${contractId}`);
      setContract(response.data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      router.push('/dashboard/contracts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm('Send this contract to the tenant?')) return;

    try {
      setIsProcessing(true);
      await api.post(`/contracts/${contractId}/send`);
      toast.success('Contract sent to tenant successfully!');
      fetchContract();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await api.delete(`/contracts/${contractId}`);
      toast.success('Contract deleted');
      router.push('/dashboard/contracts');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Contract not found</p>
      </div>
    );
  }

  const isDraft = contract.status === 'DRAFT';
  const isSent = contract.status === 'SENT';
  const isAccepted = contract.status === 'ACCEPTED';
  const isRejected = contract.status === 'REJECTED';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
          <p className="text-slate-600 mt-1">Contract details and management</p>
        </div>
      </div>

      {/* Status Banner */}
      {isDraft && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <FileText className="h-5 w-5" />
            <span className="font-medium">This contract is still a draft. Send it to the tenant when ready.</span>
          </div>
        </div>
      )}

      {isSent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-700">
            <Send className="h-5 w-5" />
            <span className="font-medium">Contract sent to tenant on {formatDate(contract.sentAt)}. Awaiting response.</span>
          </div>
        </div>
      )}

      {isAccepted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Tenant accepted this contract on {formatDate(contract.acceptedAt)}</span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-700">Tenant rejected this contract</p>
              {contract.rejectionReason && (
                <p className="text-sm text-red-600 mt-1">Reason: {contract.rejectionReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Property Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Property Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Property</p>
              <p className="text-sm font-medium text-slate-900">{contract.propertyName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Unit Number</p>
              <p className="text-sm font-medium text-slate-900">{contract.unitNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Address</p>
              <p className="text-sm font-medium text-slate-900">{contract.address}</p>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Financial Terms</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Monthly Rent</p>
              <p className="text-lg font-bold text-slate-900">UGX {contract.rentAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Security Deposit</p>
              <p className="text-sm font-medium text-slate-900">UGX {contract.deposit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Lease Period */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Lease Period</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Start Date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(contract.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">End Date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(contract.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="text-sm font-medium text-slate-900">{contract.duration} months</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Tenant Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-medium text-slate-900">{contract.tenant.user.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900">{contract.tenant.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="text-sm font-medium text-slate-900">{contract.tenant.user.phone}</p>
          </div>
        </div>
      </div>

      {/* Additional Terms */}
      {contract.terms && contract.terms.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Additional Terms & Clauses</h3>
          <ul className="space-y-2">
            {contract.terms.map((term, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 mt-1">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contract Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">Full Contract</h3>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
            {contract.content}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white p-4 border-t border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8">
        {isDraft && (
          <>
            <button
              onClick={() => router.push(`/dashboard/contracts/edit/${contractId}`)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" />
              <span>Edit Contract</span>
            </button>
            <button
              onClick={handleSend}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              <span>{isProcessing ? 'Sending...' : 'Send to Tenant'}</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete</span>
            </button>
          </>
        )}
        {!isDraft && (
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Back to Contracts
          </button>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Contract</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this contract? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Delete Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
