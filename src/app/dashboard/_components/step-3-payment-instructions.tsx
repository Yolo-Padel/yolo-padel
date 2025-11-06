"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

type PaymentInstructionsProps = {
  paymentMethod: string;
  orderCode: string;
  totalAmount: number;
  onComplete: () => void;
};

export function PaymentInstructions({
  paymentMethod,
  orderCode,
  totalAmount,
  onComplete,
}: PaymentInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  // Mock VA numbers
  const vaNumber =
    paymentMethod === "BNI_VA" ? "8808123456789012" : "7778123456789012";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Payment Instructions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your payment to confirm booking
        </p>
      </div>

      {/* Order Info */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Order Code</div>
            <div className="font-semibold mt-1">{orderCode}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">Total Amount</div>
            <div className="font-semibold mt-1">
              Rp{totalAmount.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Specific Instructions */}
      {paymentMethod === "QRIS" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            <h3 className="font-semibold mb-3">Scan QR Code</h3>
            {/* Mock QR Code */}
            <Image src="/qris.png" alt="QR Code" width={200} height={200} />
          </div>
        </div>
      )}

      {(paymentMethod === "BNI_VA" || paymentMethod === "BCA_VA") && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Virtual Account Number</h3>
            <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {paymentMethod === "BNI_VA" ? "BNI" : "BCA"} Virtual Account
                </div>
                <div className="font-mono text-lg font-semibold">
                  {vaNumber}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(vaNumber, "VA Number")}
              >
                {copiedField === "VA Number" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4 mt-3">
              <div className="text-xs text-muted-foreground mb-1">
                Total Amount
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-lg font-semibold">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(totalAmount.toString(), "Amount")}
                >
                  {copiedField === "Amount" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">How to pay:</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>
                Open your {paymentMethod === "BNI_VA" ? "BNI" : "BCA"} mobile
                banking or ATM
              </li>
              <li>Select Transfer or Payment menu</li>
              <li>Choose Virtual Account</li>
              <li>Enter the Virtual Account number above</li>
              <li>Verify the payment amount</li>
              <li>Complete the payment</li>
            </ol>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
        <h4 className="font-medium text-sm mb-2">⚠️ Important Notes:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Payment must be completed within 15 minutes</li>
          <li>Use the exact amount shown above</li>
          <li>Your booking will be auto-confirmed after payment</li>
          <li>Keep this page open until payment is completed</li>
        </ul>
      </div>

      {/* Action Button */}
      <Button className="w-full h-11" onClick={onComplete}>
        I Have Completed Payment
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          // In real implementation, this would check payment status
          onComplete();
        }}
      >
        Check Payment Status
      </Button>
    </div>
  );
}
