"use client";

import { useRef } from "react";
import {
  Building2,
  Calendar,
  CreditCard,
  User,
  MapPin,
  FileText,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentReceiptProps {
  payment: any;
  onClose: () => void;
}

export default function PaymentReceipt({
  payment,
  onClose,
}: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, you'd generate a PDF here
    window.print();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const receiptNumber = `RCP-${payment.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 print:hidden">
          <h2 className="text-xl font-bold text-slate-900">Payment Receipt</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-8">
          {/* Company Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-slate-900 p-2 rounded-md">
                <Building2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">SmartRentUG</h1>
            </div>
            <p className="text-slate-600">Property Management System</p>
            <p className="text-sm text-slate-500">Kampala, Uganda</p>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-8 pb-4 border-b-2 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              PAYMENT RECEIPT
            </h2>
            <p className="text-slate-600">Receipt No: {receiptNumber}</p>
          </div>

          {/* Receipt Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <User className="h-4 w-4" />
                  <span>Tenant Name</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {payment.tenant.user.fullName}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span>Property</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {payment.lease.unit.property.name}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>Unit Number</span>
                </div>
                <p className="font-semibold text-slate-900">
                  Unit {payment.lease.unit.unitNumber}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Payment Date</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {payment.paidDate
                    ? formatDate(payment.paidDate)
                    : formatDate(payment.createdAt)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment Method</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {payment.method?.replace("_", " ") || "N/A"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Payment Source</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {payment.notes?.includes("SOURCE:TENANT_PORTAL")
                    ? "Tenant Portal"
                    : payment.notes?.includes("SOURCE:MANUAL_CLEARANCE")
                      ? "Manual Clearance"
                      : "Recorded Payment"}
                </p>
              </div>

              {payment.reference && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <FileText className="h-4 w-4" />
                    <span>Reference</span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {payment.reference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Rent Amount</span>
                <span className="font-semibold text-slate-900">
                  UGX {Number(payment.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total Paid</span>
                <span className="text-2xl font-bold text-emerald-600">
                  UGX {Number(payment.amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Property Address */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-900 mb-2">
              Property Address
            </h3>
            <p className="text-slate-600">
              {payment.lease.unit.property.address || "N/A"}
            </p>
          </div>

          {/* Notes */}
          {payment.notes && !payment.notes.startsWith("SOURCE:") && (
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
              <p className="text-slate-600">{payment.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-slate-200 pt-6 mt-8">
            <div className="text-center text-sm text-slate-500">
              <p className="mb-2">
                This is a computer-generated receipt and does not require a
                signature.
              </p>
              <p>For any queries, please contact your property manager.</p>
              <p className="mt-4 font-semibold text-slate-900">
                Thank you for your payment!
              </p>
            </div>
          </div>

          {/* Print Timestamp */}
          <div className="text-center text-xs text-slate-400 mt-6">
            Generated on {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${receiptRef.current
            ? `
            #receipt-content,
            #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          `
            : ""}
        }
      `}</style>
    </div>
  );
}
