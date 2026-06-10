"use client";

import { useState } from "react";
import { Loader2, Phone, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ContactRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  onSuccess: (contact: { contactName: string; contactPhone: string; contactEmail?: string }, buyerPhone: string) => void;
}

type PaymentStatus = "form" | "processing" | "pending_pin" | "success" | "failed";

export default function ContactRevealModal({ isOpen, onClose, listingId, onSuccess }: ContactRevealModalProps) {
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("form");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone
    const cleanedNumber = buyerPhone.replace(/\s+/g, "");
    if (!/^(256|0)?[37]\d{8}$/.test(cleanedNumber)) {
      toast.error("Please enter a valid Uganda phone number");
      return;
    }

    setStatus("processing");

    try {
      // Format phone number
      let formattedNumber = cleanedNumber;
      if (formattedNumber.startsWith("0")) {
        formattedNumber = "256" + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith("256")) {
        formattedNumber = "256" + formattedNumber;
      }

      // Initiate payment with Pesapal
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact-purchases/initiate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          buyerPhone: formattedNumber,
          buyerEmail: buyerEmail || `buyer${Date.now()}@smartrentug.com`,
          buyerName: buyerName || "Buyer",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setStatus("failed");
        toast.error(result.message || "Payment initiation failed");
        return;
      }

      // Store payment info in localStorage for when user returns
      localStorage.setItem('pending_contact_purchase', JSON.stringify({
        listingId,
        buyerPhone: formattedNumber,
        buyerEmail,
        buyerName,
        txRef: result.txRef,
        timestamp: Date.now(),
      }));

      // Redirect to Pesapal payment page
      if (result.redirectUrl) {
        toast.success("Redirecting to payment page...");
        window.location.href = result.redirectUrl;
      } else {
        // Fallback: poll for payment status
        setStatus("pending_pin");
        pollPaymentStatus(result.txRef, formattedNumber);
      }

    } catch (error) {
      console.error("Payment error:", error);
      setStatus("failed");
      toast.error("Payment failed. Please try again.");
    }
  };

  const pollPaymentStatus = async (txRef: string, phone: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 2 minutes (30 * 4 seconds)

    const poll = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/contact-purchases/verify-and-purchase`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderTrackingId: txRef,
              listingId,
              buyerPhone: phone,
              buyerEmail: buyerEmail || undefined,
              buyerName: buyerName || undefined,
            }),
          }
        );

        const result = await response.json();

        if (result.success && result.contact) {
          setStatus("success");
          toast.success("Payment successful!");
          
          // Clear pending purchase from localStorage
          localStorage.removeItem('pending_contact_purchase');
          
          setTimeout(() => {
            onSuccess(result.contact, phone);
            onClose();
          }, 1500);
        } else if (result.status === 'failed') {
          setStatus("failed");
          toast.error("Payment failed. Please try again.");
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 4000); // Poll every 4 seconds
          } else {
            setStatus("failed");
            toast.error("Payment verification timeout. Please contact support if amount was deducted.");
          }
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 4000);
        } else {
          setStatus("failed");
          toast.error("Verification failed. Please contact support.");
        }
      }
    };

    poll();
  };

  const handleRetry = () => {
    setStatus("form");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        {status === "form" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Reveal Landlord Contact
              </h2>
              <p className="text-slate-600">
                Pay UGX 10,000 to view landlord contact details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number */}
              <div>
                <Label htmlFor="buyerPhone">Your Phone Number *</Label>
                <Input
                  id="buyerPhone"
                  type="tel"
                  placeholder="0700 000 000"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter your Uganda mobile number
                </p>
              </div>

              {/* Optional Fields */}
              <div>
                <Label htmlFor="buyerName">Your Name (Optional)</Label>
                <Input
                  id="buyerName"
                  type="text"
                  placeholder="John Doe"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="buyerEmail">Your Email (Optional)</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                  Pay UGX 10,000
                </Button>
              </div>
            </form>
          </>
        )}

        {status === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900">Processing Payment...</p>
            <p className="text-sm text-slate-600 mt-2">Please wait</p>
          </div>
        )}

        {status === "pending_pin" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">Complete Payment</p>
            <p className="text-sm text-slate-600 mb-4">
              Follow the instructions on the payment page to complete your purchase
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📱 Waiting for payment confirmation...
              </p>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto mt-4" />
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">Payment Successful!</p>
            <p className="text-sm text-slate-600">Revealing contact details...</p>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">Payment Failed</p>
            <p className="text-sm text-slate-600 mb-6">
              The payment was not completed. Please try again.
            </p>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRetry} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
