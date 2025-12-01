"use client";

import { useState, useEffect } from "react";
import { ReadonlyURLSearchParams } from "next/navigation";
import { PaymentFeedbackState } from "@/app/dashboard/booking/_components/payment-feedback-dialog";

export function usePaymentFeedback(searchParams: ReadonlyURLSearchParams) {
  const [paymentFeedback, setPaymentFeedback] =
    useState<PaymentFeedbackState | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get("paymentStatus");
    const paymentIdParam = searchParams.get("paymentId");
    const reason = searchParams.get("reason") || undefined;

    if (
      !statusParam ||
      !paymentIdParam ||
      (statusParam !== "success" && statusParam !== "failed")
    ) {
      setPaymentFeedback(null);
      return;
    }

    let cancelled = false;

    setPaymentFeedback({
      status: statusParam as "success" | "failed",
      reason,
      paymentId: paymentIdParam,
      loading: true,
    });

    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/payment/${paymentIdParam}/status`, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to fetch payment");
        }

        const data = await response.json();
        if (!data.success || !data.data) {
          throw new Error("Payment not found");
        }

        if (!cancelled) {
          setPaymentFeedback((prev) =>
            prev && prev.paymentId === paymentIdParam
              ? { ...prev, payment: data.data, loading: false }
              : {
                  status: statusParam as "success" | "failed",
                  reason,
                  paymentId: paymentIdParam,
                  payment: data.data,
                  loading: false,
                }
          );
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch payment";
          setPaymentFeedback((prev) =>
            prev && prev.paymentId === paymentIdParam
              ? { ...prev, error: message, loading: false }
              : {
                  status: statusParam as "success" | "failed",
                  reason,
                  paymentId: paymentIdParam,
                  loading: false,
                  error: message,
                }
          );
        }
      }
    };

    fetchPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return { paymentFeedback, setPaymentFeedback };
}

