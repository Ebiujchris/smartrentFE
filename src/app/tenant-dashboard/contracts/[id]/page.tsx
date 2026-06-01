'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, DollarSign, Home, User } from 'lucide-react';
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

export default function TenantContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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
      router.push('/tenant-dashboard/contracts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this tenancy contract?')) return;

    try {
      setIsProcessing(true);
      await api.post(`/contracts/${contractId}/accept`);
      toast.success('Contract accepted successfully!');
      fetchContract();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsProcessing(true);
      await api.post(`/contracts/${contractId}/reject`, { reason: rejectionReason });
      toast.success('Contract rejected');
      setShowRejectModal(false);
      fetchContract();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsProcessing(false);
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

  const canRespond = contract.status === 'SENT';
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
          <p className="text-slate-600 mt-1">Review contract details</p>
        </div>
      </div>

      {/* Status Banner */}
      {canRespond && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Action Required</h3>
              <p className="text-sm text-blue-700">
                Please review this tenancy contract carefully and respond by accepting or rejecting it.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAccepted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">You accepted this contract on {formatDate(contract.acceptedAt)}</span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-700">You rejected this contract</p>
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

      {/* Landlord Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Landlord Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-medium text-slate-900">{contract.landlord.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900">{contract.landlord.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="text-sm font-medium text-slate-900">{contract.landlord.phone}</p>
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
      {canRespond && (
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white p-4 border-t border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium"
          >
            Reject Contract
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 font-medium"
          >
            {isProcessing ? 'Processing...' : 'Accept Contract'}
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Contract</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejecting this contract. This will be sent to the landlord.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter your reason for rejection..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
