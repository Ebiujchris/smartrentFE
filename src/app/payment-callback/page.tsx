"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get order tracking ID from URL
      const orderTrackingId = searchParams.get("OrderTrackingId");
      const merchantReference = searchParams.get("OrderMerchantReference");

      if (!orderTrackingId && !merchantReference) {
        setStatus("failed");
        setMessage("Invalid payment callback");
        return;
      }

      // Get pending purchase from localStorage
      const pendingPurchase = localStorage.getItem("pending_contact_purchase");
      
      if (!pendingPurchase) {
        setStatus("failed");
        setMessage("Payment session expired");
        return;
      }

      const purchaseData = JSON.parse(pendingPurchase);

      // Verify payment with backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-purchases/verify-and-purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderTrackingId: orderTrackingId || merchantReference,
            listingId: purchaseData.listingId,
            buyerPhone: purchaseData.buyerPhone,
            buyerEmail: purchaseData.buyerEmail,
            buyerName: purchaseData.buyerName,
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.contact) {
        setStatus("success");
        setMessage("Payment successful! Contact details revealed.");
        
        // Store contact in localStorage
        localStorage.setItem(
          `contact_${purchaseData.listingId}`,
          JSON.stringify(result.contact)
        );
        
        // Clear pending purchase
        localStorage.removeItem("pending_contact_purchase");

        // Redirect back to houses page after 2 seconds
        setTimeout(() => {
          router.push("/houses-for-rent");
        }, 2000);
      } else {
        setStatus("failed");
        setMessage(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("failed");
      setMessage("Failed to verify payment. Please contact support.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {status === "verifying" && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-slate-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <p className="text-sm text-slate-500">
              Redirecting you back to listings...
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <Button
              onClick={() => router.push("/houses-for-rent")}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Back to Listings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
