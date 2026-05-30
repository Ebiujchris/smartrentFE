"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  DollarSign,
} from "lucide-react";
import { usePaymentStore } from "@/store/paymentStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TenantPaymentsPage() {
  const { payments, loading, fetchPayments, recordPayment } = usePaymentStore();
  const [isPaying, setIsPaying] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePayNow = async (paymentId: string, amount: string | number) => {
    setIsPaying(paymentId);
    try {
      // Simulating a successful payment integration (e.g. Mobile Money prompt)
      // In a real app, this would redirect to a payment gateway or trigger a push USSD
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // We use the same backend endpoint to mark it as paid, or an equivalent tenant endpoint.
      await recordPayment(
        paymentId,
        "MTN_MOBILE_MONEY",
        `SIMULATED_TXN_${Math.floor(Math.random() * 100000)}`,
        "SOURCE:TENANT_PORTAL",
      );
      toast.success("Payment successful!", {
        description: `Your payment of UGX ${Number(amount).toLocaleString()} has been processed.`,
      });
      fetchPayments();
    } catch (error) {
      toast.error("Payment failed", {
        description:
          "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsPaying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700",
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
                    Status
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 font-medium">
                      {new Date(payment.dueDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">
                        UGX {Number(payment.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {payment.status !== "PAID" ? (
                        <Button
                          onClick={() =>
                            handlePayNow(payment.id, payment.amount)
                          }
                          disabled={isPaying === payment.id}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          {isPaying === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                          Pay Now
                        </Button>
                      ) : (
                        <span className="text-slate-500 text-xs">
                          Paid on{" "}
                          {new Date(payment.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
