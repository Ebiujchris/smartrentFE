"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiEndpoint } from "@/lib/api-url";

type CallbackState = "checking" | "success" | "failed";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>("checking");
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const orderTrackingId = searchParams.get("OrderTrackingId") || searchParams.get("orderTrackingId");
      const contactPayment = localStorage.getItem("pending_contact_purchase");
      const subscriptionPayment = localStorage.getItem("pending_subscription_payment");

      if (!orderTrackingId || (!contactPayment && !subscriptionPayment)) {
        setState("failed");
        setMessage("Payment details were not found. Please start the payment again.");
        return;
      }

      try {
        let response: Response;

        if (contactPayment) {
          const payment = JSON.parse(contactPayment);
          response = await fetch(getApiEndpoint("/contact-purchases/verify-and-purchase"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderTrackingId,
              listingId: payment.listingId,
              buyerPhone: payment.buyerPhone,
              buyerEmail: payment.buyerEmail || undefined,
              buyerName: payment.buyerName || undefined,
            }),
          });
        } else {
          const payment = JSON.parse(subscriptionPayment!);
          response = await fetch(getApiEndpoint("/subscriptions/verify-and-purchase"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              orderTrackingId,
              planId: payment.planId,
              amount: payment.amount,
              phoneNumber: payment.phoneNumber,
            }),
          });
        }

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Payment was not confirmed.");
        }

        localStorage.removeItem("pending_contact_purchase");
        localStorage.removeItem("pending_subscription_payment");
        setState("success");
        setMessage(result.message || "Payment successful.");
      } catch (error) {
        setState("failed");
        setMessage(error instanceof Error ? error.message : "Payment verification failed.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">
          {state === "checking" ? "Confirming payment" : state === "success" ? "Payment successful" : "Payment not completed"}
        </h1>
        <p className="mt-3 text-slate-600">{message}</p>
        {state !== "checking" && (
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Return to dashboard
          </button>
        )}
      </section>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center">Confirming payment...</main>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}