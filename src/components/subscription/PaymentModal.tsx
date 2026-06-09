"use client";

import { useState } from "react";
import { Loader2, CreditCard, Phone, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
      // TODO: Replace with actual payment gateway API call
      // For now, simulating the payment process
      
      // Format phone number to international format
      let formattedNumber = cleanedNumber;
      if (formattedNumber.startsWith("0")) {
        formattedNumber = "256" + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith("256")) {
        formattedNumber = "256" + formattedNumber;
      }

      // Simulate API call to initiate payment
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          amount: plan.price,
          planId: plan.id,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment initiation failed");
      }

      const data = await response.json();
      setTransactionId(data.transactionId || "TXN" + Date.now());
      setPaymentStatus("pending_pin");

      // Simulate checking payment status
      setTimeout(() => {
        checkPaymentStatus(data.transactionId || "TXN" + Date.now());
      }, 3000);

    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const checkPaymentStatus = async (txnId: string) => {
    // TODO: Replace with actual payment status check API
    // Simulating payment status check
    setTimeout(() => {
      // Randomly simulate success/failure for demo
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      if (isSuccess) {
        setPaymentStatus("success");
        toast.success("Payment successful! Your subscription has been renewed.");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setPaymentStatus("failed");
        toast.error("Payment was not completed. Please try again.");
      }
    }, 5000);
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Renew Subscription
          </h2>
          <p className="text-slate-600">
            {plan.name} Plan - UGX {plan.price.toLocaleString()}/month
          </p>
        </div>

        {/* Payment Form */}
        {paymentStatus === "idle" && (
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
                Pay UGX {plan.price.toLocaleString()}
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
