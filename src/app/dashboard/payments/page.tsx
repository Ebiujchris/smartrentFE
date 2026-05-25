'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, CheckCircle, Clock, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentStore } from '@/store/paymentStore';
import { useTenantStore } from '@/store/tenantStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import PaymentReceipt from '@/components/receipts/PaymentReceipt';

export default function PaymentsPage() {
  const { payments, loading, fetchPayments, recordPayment } = usePaymentStore();
  const { tenants, fetchTenants } = useTenantStore();
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);
  const [recordData, setRecordData] = useState({
    method: 'MTN_MOBILE_MONEY',
    reference: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchTenants();
  }, [fetchPayments, fetchTenants]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    
    try {
      const updatedPayment = await recordPayment(selectedPayment.id, recordData.method, recordData.reference);
      toast.success('Payment recorded successfully!', {
        description: `Payment of UGX ${Number(selectedPayment.amount).toLocaleString()} has been recorded.`,
      });
      setIsRecordOpen(false);
      setSelectedPayment(null);
      setRecordData({ method: 'MTN_MOBILE_MONEY', reference: '' });
      
      // Show receipt after recording payment
      setReceiptPayment(updatedPayment);
      setShowReceipt(true);
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast.error('Failed to record payment', {
        description: 'Please try again or contact support.',
      });
    }
  };

  const handleViewReceipt = (payment: any) => {
    setReceiptPayment(payment);
    setShowReceipt(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      OVERDUE: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-slate-100 text-slate-700',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading && payments.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">Track rent payments and receipts</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No payments recorded
            </h2>
            <p className="text-slate-600 mb-6">
              Payments will appear here once tenants are assigned to units with active leases
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Property/Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.tenant.user.fullName}
                      </div>
                      <div className="text-sm text-slate-500">{payment.tenant.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {payment.lease.unit.property.name}
                      </div>
                      <div className="text-sm text-slate-500">Unit {payment.lease.unit.unitNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        UGX {Number(payment.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status !== 'PAID' ? (
                        <Dialog open={isRecordOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                          setIsRecordOpen(open);
                          if (open) setSelectedPayment(payment);
                          else setSelectedPayment(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                              Record Payment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Record Payment</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleRecordPayment} className="space-y-4">
                              <div>
                                <Label>Amount</Label>
                                <Input value={`UGX ${Number(payment.amount).toLocaleString()}`} disabled />
                              </div>
                              <div>
                                <Label htmlFor="method">Payment Method *</Label>
                                <Select value={recordData.method} onValueChange={(value) => setRecordData({ ...recordData, method: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MTN_MOBILE_MONEY">MTN Mobile Money</SelectItem>
                                    <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="reference">Reference/Transaction ID</Label>
                                <Input
                                  id="reference"
                                  value={recordData.reference}
                                  onChange={(e) => setRecordData({ ...recordData, reference: e.target.value })}
                                  placeholder="e.g., TXN123456"
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsRecordOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                                  Confirm Payment
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">
                            Paid on {new Date(payment.paidDate).toLocaleDateString()}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewReceipt(payment)}
                            className="ml-2"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptPayment && (
        <PaymentReceipt 
          payment={receiptPayment} 
          onClose={() => {
            setShowReceipt(false);
            setReceiptPayment(null);
          }} 
        />
      )}
    </div>
  );
}
