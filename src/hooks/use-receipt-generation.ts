"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useReceiptGeneration(): {
  generateReceipt: (orderId: string) => Promise<void>;
  isGenerating: boolean;
} {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReceipt = async (orderId: string): Promise<void> => {
    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    setIsGenerating(true);

    const toastId = toast.loading("Generating receipt...");

    try {
      const response = await fetch(`/api/order/${orderId}/receipt`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate receipt");
      }

      // Get PDF blob from response
      const blob = await response.blob();

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `receipt-${orderId}.pdf`;

      // Download PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Receipt generated successfully!", {
        description: "File PDF has been downloaded",
        id: toastId,
      });
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt", {
        description:
          error instanceof Error ? error.message : "An error occurred",
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReceipt,
    isGenerating,
  };
}
