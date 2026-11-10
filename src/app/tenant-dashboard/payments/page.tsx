"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { usePaymentStore } from "@/store/paymentStore";
import { formatPaymentDate, isValidDate, formatDate } from "@/lib/dateUtils";
import { getPaymentStatus } from "@/lib/rentStatus";
import { paymentService } from "@/services/payment.service";

interface RentReceipt {
  id: string;
  type: "RENT" | "DEPOSIT";
  amount: number | string;
  paidAt: string;
  method: string;
  reference?: string | null;
  unallocatedAmount: number | string;
  allocations: Array<{
    amount: number | string;
    payment: { periodStart?: string | null; periodEnd?: string | null };
  }>;
}

export default function TenantPaymentsPage() {
  const { payments, loading, fetchPayments } = usePaymentStore();
  const [receipts, setReceipts] = useState<RentReceipt[]>([]);

  useEffect(() => {
    fetchPayments();
    paymentService
      .getRentReceipts()
      .then((rows) => setReceipts(Array.isArray(rows) ? rows : []))
      .catch((error) => {
        console.error("Failed to load rent receipts:", error);
      });
  }, [fetchPayments]);

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700",
      PARTIALLY_PAID: "bg-amber-100 text-amber-800",
      CANCELLED: "bg-slate-100 text-slate-700",
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4" />;
      case "PARTIALLY_PAID":
        return <Clock className="h-4 w-4" />;
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
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            My Payments
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage your rent payments and view history
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">
              No payments found
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              You do not have any pending or past payments.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payments.map((payment) => {
                  const status = getPaymentStatus(payment);

                  return (
                  <tr key={payment.id} className="hover:bg-slate-50">
                     <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 font-medium">
                       {payment.dueDate ? formatDate(payment.dueDate) : '-'}
                     </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">
                        UGX {Number(payment.amount).toLocaleString()}
                      </div>
                      {Number(payment.paidAmount || 0) > 0 && payment.status !== "PAID" && (
                        <div className="text-xs text-slate-500">
                          UGX {Number(payment.paidAmount).toLocaleString()} paid · UGX {Number(payment.outstandingAmount ?? Number(payment.amount) - Number(payment.paidAmount)).toLocaleString()} remaining
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-700">
                      {payment.periodStart && payment.periodEnd
                        ? `${formatDate(payment.periodStart)} – ${formatDate(payment.periodEnd)}`
                        : "Monthly rent"}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(status)}`}
                      >
                        {getStatusIcon(status)}
                        {status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {status === "PENDING" || status === "OVERDUE" ? (
                        <span className="text-slate-500 text-xs">
                          Pay your landlord directly; they will record the payment.
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">
                          {isValidDate(payment.paidDate)
                            ? `Paid on ${formatPaymentDate(payment.paidDate)}`
                            : "Paid"}
                        </span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payment receipts</h2>
          <p className="text-sm text-slate-600">Recorded rent and security-deposit payments, including the rent periods covered.</p>
        </div>
        {receipts.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No recorded receipts yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Rent periods covered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Method / reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipts.map((receipt) => {
                  const periods = receipt.allocations
                    .map(({ payment }) =>
                      payment.periodStart && payment.periodEnd
                        ? `${formatDate(payment.periodStart)} – ${formatDate(payment.periodEnd)}`
                        : null,
                    )
                    .filter((period): period is string => Boolean(period));

                  return (
                    <tr key={receipt.id}>
                      <td className="px-4 py-3 text-sm text-slate-700">{formatPaymentDate(receipt.paidAt)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{receipt.type === "DEPOSIT" ? "Security deposit" : "Rent"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">UGX {Number(receipt.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {periods.length ? periods.join(", ") : receipt.type === "DEPOSIT" ? "Not applied to rent" : "Rent credit"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {receipt.method.replaceAll("_", " ")}
                        {receipt.reference ? ` · ${receipt.reference}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
