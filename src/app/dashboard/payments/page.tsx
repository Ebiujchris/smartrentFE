"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentStore } from "@/store/paymentStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PaymentReceipt, { type PaymentReceiptData } from "@/components/receipts/PaymentReceipt";
import { formatPaymentDate, isValidDate, formatDate } from "@/lib/dateUtils";
import { paymentService, type RentReceipt } from "@/services/payment.service";

interface PaymentCharge {
  id: string;
  leaseId?: string;
  status: string;
  amount: number;
  paidAmount?: number;
  outstandingAmount?: number;
  dueDate?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  paidDate?: string | null;
  notes?: string | null;
  tenant: {
    user: {
      fullName: string;
      email: string;
    };
  };
  lease: {
    id: string;
    unit: {
      unitNumber: string;
      property: {
        name: string;
        address?: string | null;
      };
    };
  };
}

export default function PaymentsPage() {
  const { payments, loading, fetchPayments, recordRentReceipt } = usePaymentStore();
  const [expandedLeaseIds, setExpandedLeaseIds] = useState<string[]>([]);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentCharge | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentReceiptData | null>(null);
  const [rentReceipts, setRentReceipts] = useState<RentReceipt[]>([]);
  const [recordData, setRecordData] = useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
    paymentService
      .getRentReceipts()
      .then((rows) => setRentReceipts(Array.isArray(rows) ? rows : []))
      .catch((error) => {
        console.error("Failed to load rent receipts:", error);
        toast.error("Could not load received rent receipts");
      });
  }, [fetchPayments]);

  const rentReceivedTotal = rentReceipts
    .filter((receipt) => receipt.type === "RENT")
    .reduce((total, receipt) => total + Number(receipt.amount), 0);
  const depositsReceivedTotal = rentReceipts
    .filter((receipt) => receipt.type === "DEPOSIT")
    .reduce((total, receipt) => total + Number(receipt.amount), 0);
  const paymentCharges = payments as PaymentCharge[];
  const outstandingCharges = paymentCharges.filter((payment) => {
    if (payment.status === "CANCELLED" || payment.status === "PAID") return false;
    return Number(
      payment.outstandingAmount ??
        Math.max(0, Number(payment.amount) - Number(payment.paidAmount || 0)),
    ) > 0;
  });
  const coveredChargeGroups = Array.from(
    paymentCharges.reduce((groups, payment) => {
      if (payment.status === "CANCELLED") return groups;
      const outstanding = Number(
        payment.outstandingAmount ??
          Math.max(0, Number(payment.amount) - Number(payment.paidAmount || 0)),
      );
      if (payment.status !== "PAID" && outstanding > 0) return groups;

      const leaseId = payment.leaseId || payment.lease.id;
      const group = groups.get(leaseId) ?? {
        leaseId,
        tenantName: payment.tenant.user.fullName,
        propertyName: payment.lease.unit.property.name,
        unitNumber: payment.lease.unit.unitNumber,
        charges: [],
      };
      group.charges.push(payment);
      groups.set(leaseId, group);
      return groups;
    }, new Map<string, {
      leaseId: string;
      tenantName: string;
      propertyName: string;
      unitNumber: string;
      charges: PaymentCharge[];
    }>()),
  ).map(([, group]) => ({
    ...group,
    charges: [...group.charges].sort(
      (a, b) => new Date(a.dueDate || "").getTime() - new Date(b.dueDate || "").getTime(),
    ),
  }));

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      const noteValue = recordData.notes?.trim();
      const combinedNotes = noteValue
        ? `SOURCE:MANUAL_CLEARANCE\n${noteValue}`
        : "SOURCE:MANUAL_CLEARANCE";

      const amount = Number(recordData.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Enter a valid payment amount");
        return;
      }

      const updatedPayment = await recordRentReceipt({
        leaseId: selectedPayment.leaseId || selectedPayment.lease.id,
        amount,
        method: recordData.method,
        reference: recordData.reference || undefined,
        notes: combinedNotes,
      });
      setRentReceipts((receipts) => [
        updatedPayment,
        ...receipts.filter((receipt) => receipt.id !== updatedPayment.id),
      ]);
      toast.success("Manual payment recorded", {
        description: `UGX ${amount.toLocaleString()} has been applied to the earliest rent due.`,
      });
      setIsRecordOpen(false);
      setSelectedPayment(null);
      setRecordData({ amount: "", method: "CASH", reference: "", notes: "" });

      // Show receipt after recording payment
      setReceiptPayment({ ...updatedPayment, paidDate: updatedPayment.paidAt });
      setShowReceipt(true);
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment", {
        description: "Please try again or contact support.",
      });
    }
  };

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

  const toggleCoveredPeriods = (leaseId: string) => {
    setExpandedLeaseIds((current) =>
      current.includes(leaseId)
        ? current.filter((id) => id !== leaseId)
        : [...current, leaseId],
    );
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Track rent charges separately from money received
          </p>
        </div>
      </div>

      {outstandingCharges.length === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          No outstanding rent charges. See the receipt list below for amounts collected.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Outstanding or partially paid rent charges only. Fully covered rent periods are grouped below; the receipts section records the actual money received.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Property/Unit
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rent Charge
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {outstandingCharges.map((payment) => {
                  const paymentSource = payment.notes?.includes(
                    "SOURCE:TENANT_PORTAL",
                  )
                    ? "Tenant Portal"
                    : payment.notes?.includes("SOURCE:MANUAL_CLEARANCE")
                      ? "Manual Clearance"
                      : payment.status === "PAID"
                        ? "Recorded Payment"
                        : "Pending";

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-medium text-slate-900">
                          {payment.tenant.user.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {payment.tenant.user.email}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-slate-900">
                          {payment.lease.unit.property.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Unit {payment.lease.unit.unitNumber}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-semibold text-slate-900">
                          UGX {Number(payment.amount).toLocaleString()}
                        </div>
                        {Number(payment.paidAmount || 0) > 0 && payment.status !== "PAID" && (
                          <div className="text-xs text-slate-500">
                            UGX {Number(payment.paidAmount).toLocaleString()} paid · UGX {Number(payment.outstandingAmount ?? Number(payment.amount) - Number(payment.paidAmount)).toLocaleString()} due
                          </div>
                        )}

                      </td>
                       <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">
                         {payment.dueDate ? formatDate(payment.dueDate) : '-'}
                       </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentSource === "Tenant Portal" ? "bg-blue-100 text-blue-700" : paymentSource === "Manual Clearance" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {paymentSource}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                        {payment.status !== "PAID" ? (
                          <Dialog
                            open={
                              isRecordOpen && selectedPayment?.id === payment.id
                            }
                            onOpenChange={(open) => {
                              setIsRecordOpen(open);
                              if (open) {
                                setSelectedPayment(payment);
                                setRecordData({
                                  amount: String(payment.outstandingAmount ?? Number(payment.amount) - Number(payment.paidAmount || 0)),
                                  method: "CASH",
                                  reference: "",
                                  notes: "",
                                });
                              }
                              else setSelectedPayment(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-xs"
                              >
                                <span className="hidden md:inline">
                                  Manual Clearance
                                </span>
                                <span className="md:hidden">Clear</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-full sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  Manual Payment Clearance
                                </DialogTitle>
                                <DialogDescription>
                                  Use this when you have received payment
                                  offline and want it reflected in landlord
                                  records and the tenant payment status.
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                onSubmit={handleRecordPayment}
                                className="space-y-4"
                              >
                                <div>
                                  <Label>Amount</Label>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={recordData.amount}
                                    onChange={(e) =>
                                      setRecordData({ ...recordData, amount: e.target.value })
                                    }
                                  />
                                  <p className="mt-1 text-xs text-slate-500">
                                    Remaining on this charge is UGX {Number(payment.outstandingAmount ?? Number(payment.amount) - Number(payment.paidAmount || 0)).toLocaleString()}; any extra stays available toward upcoming rent.
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="method">
                                    Payment Method *
                                  </Label>
                                  <Select
                                    value={recordData.method}
                                    onValueChange={(value) =>
                                      setRecordData({
                                        ...recordData,
                                        method: value as string,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MTN_MOBILE_MONEY">
                                        MTN Mobile Money
                                      </SelectItem>
                                      <SelectItem value="AIRTEL_MONEY">
                                        Airtel Money
                                      </SelectItem>
                                      <SelectItem value="BANK_TRANSFER">
                                        Bank Transfer
                                      </SelectItem>
                                      <SelectItem value="CASH">Cash</SelectItem>
                                      <SelectItem value="OTHER">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="reference">
                                    Reference / Transaction ID
                                  </Label>
                                  <Input
                                    id="reference"
                                    value={recordData.reference}
                                    onChange={(e) =>
                                      setRecordData({
                                        ...recordData,
                                        reference: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., CASH-BOOK-001 or TXN123456"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes</Label>
                                  <Input
                                    id="notes"
                                    value={recordData.notes}
                                    onChange={(e) =>
                                      setRecordData({
                                        ...recordData,
                                        notes: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., Paid in cash at office"
                                  />
                                </div>
                                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800">
                                  The receipt will be applied to the oldest
                                  outstanding rent first. Any extra remains as
                                  an advance balance for upcoming rent.
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsRecordOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                  >
                                    Mark as Paid
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                            <span className="text-slate-500 text-xs">
                              {isValidDate(payment.paidDate)
                                ? `Paid on ${formatPaymentDate(payment.paidDate)}`
                                : "Paid"}
                            </span>
                          </div>
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

      {coveredChargeGroups.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Rent periods covered
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              These are monthly rent charges paid from receipts, not additional
              payments received.
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {coveredChargeGroups.map((group) => {
              const isExpanded = expandedLeaseIds.includes(group.leaseId);
              const totalCovered = group.charges.reduce(
                (total, charge) =>
                  total + Number(charge.paidAmount ?? charge.amount),
                0,
              );
              const firstPeriod = group.charges[0];
              const lastPeriod = group.charges[group.charges.length - 1];
              return (
                <div key={group.leaseId}>
                  <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {group.tenantName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {group.propertyName} · Unit {group.unitNumber}
                      </p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {group.charges.length} rent period
                        {group.charges.length === 1 ? "" : "s"} covered · UGX{" "}
                        {totalCovered.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(
                          firstPeriod.periodStart || firstPeriod.dueDate || "",
                        )}
                        {" – "}
                        {formatDate(
                          lastPeriod.periodEnd || lastPeriod.dueDate || "",
                        )}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCoveredPeriods(group.leaseId)}
                    >
                      {isExpanded ? "Hide periods" : "Show periods"}
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                      {group.charges.map((charge) => (
                        <div
                          key={charge.id}
                          className="flex flex-col gap-1 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-slate-700">
                            {formatDate(
                              charge.periodStart || charge.dueDate || "",
                            )}
                            {" – "}
                            {formatDate(
                              charge.periodEnd || charge.dueDate || "",
                            )}
                          </span>
                          <span className="font-medium text-emerald-800">
                            Covered · UGX{" "}
                            {Number(
                              charge.paidAmount ?? charge.amount,
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 md:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Receipts received</h2>
          <p className="mt-1 text-sm text-slate-600">
            Actual rent and security-deposit receipts, including advance payments.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-800">Rent received</p>
              <p className="mt-1 text-lg font-bold text-emerald-900">
                UGX {rentReceivedTotal.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-800">Security deposits received</p>
              <p className="mt-1 text-lg font-bold text-blue-900">
                UGX {depositsReceivedTotal.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs font-medium text-slate-700">Total receipts</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                UGX {(rentReceivedTotal + depositsReceivedTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        {rentReceipts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No rent or deposit receipts have been recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50">
                <tr>
                  {["Tenant", "Property / Unit", "Receipt Type", "Amount Received", "Date", "Method", ""].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rentReceipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {receipt.tenant.user.fullName}
                      <span className="block text-xs text-slate-500">
                        RCP-{receipt.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {receipt.lease.unit.property.name} · Unit {receipt.lease.unit.unitNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {receipt.type === "DEPOSIT" ? "Security deposit" : "Rent"}
                      {receipt.type === "RENT" && Number(receipt.unallocatedAmount || 0) > 0 && (
                        <span className="mt-1 block text-xs text-amber-800">
                          {Number(receipt.amount) - Number(receipt.unallocatedAmount) > 0 && (
                            <>Applied to rent: UGX {(Number(receipt.amount) - Number(receipt.unallocatedAmount)).toLocaleString()}<br /></>
                          )}
                          Advance left for upcoming rent: UGX {Number(receipt.unallocatedAmount).toLocaleString()}
                          {Number(receipt.lease.rentAmount) > 0 && (
                            <> (about {Math.ceil(Number(receipt.unallocatedAmount) / Number(receipt.lease.rentAmount))} month{Math.ceil(Number(receipt.unallocatedAmount) / Number(receipt.lease.rentAmount)) === 1 ? "" : "s"})</>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                      UGX {Number(receipt.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatPaymentDate(receipt.paidAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {receipt.method?.replaceAll("_", " ") || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReceiptPayment(receipt);
                          setShowReceipt(true);
                        }}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
