"use client";

import { useState } from "react";
import { Loader2, CreditCard, Phone, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getApiEndpoint } from "@/lib/api-url";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
    id: string;
  };
  onSuccess: () => void;
}

type PaymentMethod = "MTN" | "AIRTEL";
type PaymentStatus = "idle" | "processing" | "pending_pin" | "success" | "failed";

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MTN");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [transactionId, setTransactionId] = useState("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  
  // Track the actively selected plan (defaults to the one passed in via props)
  const [selectedPlan, setSelectedPlan] = useState(plan);

  // Define available plans in case the user wants to switch
  const availablePlans = [
    { id: 'STARTER', name: 'Starter', price: 75000 },
    { id: 'PROFESSIONAL', name: 'Professional', price: 150000 },
    { id: 'PREMIUM', name: 'Premium', price: 300000 },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number (Uganda format)
    const cleanedNumber = phoneNumber.replace(/\s+/g, "");
    if (!/^(256|0)?[37]\d{8}$/.test(cleanedNumber)) {
      toast.error("Please enter a valid Uganda phone number");
      return;
    }

    setPaymentStatus("processing");

    try {
      // Format phone number to international format
      let formattedNumber = cleanedNumber;
      if (formattedNumber.startsWith("0")) {
        formattedNumber = "256" + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith("256")) {
        formattedNumber = "256" + formattedNumber;
      }

      // Call to initiate payment
      const response = await fetch(getApiEndpoint('/subscriptions/initiate-payment'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          amount: selectedPlan.price,
          planId: selectedPlan.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Payment initiation failed");
      }

      setTransactionId(data.txRef);

      // Redirect to Pesapal payment page if provided
      if (data.redirectUrl) {
        toast.success("Redirecting to payment page...");
        window.location.href = data.redirectUrl;
      } else {
        // Fallback: poll for payment status
        setPaymentStatus("pending_pin");
        checkPaymentStatus(data.txRef, formattedNumber);
      }

    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      toast.error(error.message || "Failed to initiate payment. Please try again.");
    }
  };

  const checkPaymentStatus = async (txnId: string, phone: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 2 minutes

    const poll = async () => {
      try {
        const response = await fetch(
          getApiEndpoint('/subscriptions/verify-and-purchase'),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              orderTrackingId: txnId,
              planId: selectedPlan.id,
              amount: selectedPlan.price,
              phoneNumber: phone,
            }),
          }
        );

        const result = await response.json();

        if (result.success) {
          setPaymentStatus("success");
          toast.success("Payment successful! Your subscription has been renewed.");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else if (result.status === 'failed') {
          setPaymentStatus("failed");
          toast.error("Payment was not completed. Please try again.");
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 4000); // Poll every 4 seconds
          } else {
            setPaymentStatus("failed");
            toast.error("Payment verification timeout.");
          }
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 4000);
        } else {
          setPaymentStatus("failed");
          toast.error("Verification failed. Please contact support.");
        }
      }
    };

    poll();
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    setTransactionId("");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-emerald-600" />
          </div>
          {isChangingPlan ? (
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Select a Plan
            </h2>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Renew Subscription
              </h2>
              <p className="text-slate-600">
                {selectedPlan.name} Plan - UGX {selectedPlan.price.toLocaleString()}/month
              </p>
              <button 
                onClick={() => setIsChangingPlan(true)}
                className="text-emerald-600 text-sm font-semibold mt-2 hover:underline"
              >
                Change Plan
              </button>
            </>
          )}
        </div>

        {/* Change Plan View */}
        {isChangingPlan && paymentStatus === "idle" && (
          <div className="space-y-3">
            {availablePlans.map((p) => (
              <div 
                key={p.id}
                onClick={() => {
                  setSelectedPlan(p);
                  setIsChangingPlan(false);
                }}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                  selectedPlan.id === p.id 
                    ? "border-emerald-500 bg-emerald-50" 
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-900">{p.name}</h3>
                  <p className="text-sm text-slate-500">UGX {p.price.toLocaleString()} / month</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan.id === p.id ? "border-emerald-500" : "border-slate-300"
                }`}>
                  {selectedPlan.id === p.id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
              </div>
            ))}
            
            <div className="pt-4">
              <Button
                type="button"
                onClick={() => setIsChangingPlan(false)}
                variant="outline"
                className="w-full"
              >
                Back to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {!isChangingPlan && paymentStatus === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                Select Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("MTN")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === "MTN"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-slate-900">MTN MoMo</div>
                  <div className="text-xs text-slate-600 mt-1">Mobile Money</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("AIRTEL")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === "AIRTEL"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-slate-900">Airtel Money</div>
                  <div className="text-xs text-slate-600 mt-1">Mobile Money</div>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">
                Phone Number
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0700 000 000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter the number registered with {paymentMethod} Mobile Money
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                Pay UGX {selectedPlan.price.toLocaleString()}
              </Button>
            </div>
          </form>
        )}

        {/* Processing State */}
        {paymentStatus === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900">Processing Payment...</p>
            <p className="text-sm text-slate-600 mt-2">Please wait</p>
          </div>
        )}

        {/* Pending PIN State */}
        {paymentStatus === "pending_pin" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">
              Check Your Phone
            </p>
            <p className="text-sm text-slate-600 mb-4">
              A payment request has been sent to<br />
              <span className="font-semibold">{phoneNumber}</span>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                📱 Enter your {paymentMethod} Mobile Money PIN on your phone to complete the payment
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Transaction ID: {transactionId}
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto mt-4" />
          </div>
        )}

        {/* Success State */}
        {paymentStatus === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">
              Payment Successful!
            </p>
            <p className="text-sm text-slate-600">
              Your subscription has been renewed
            </p>
          </div>
        )}

        {/* Failed State */}
        {paymentStatus === "failed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">
              Payment Failed
            </p>
            <p className="text-sm text-slate-600 mb-6">
              The payment was not completed. Please try again.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRetry}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
