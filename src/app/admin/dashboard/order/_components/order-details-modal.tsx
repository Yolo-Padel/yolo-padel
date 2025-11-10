"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OrderDetailsContainer } from "@/app/dashboard/order-history/_components/order-details-container";
import { Order } from "@/hooks/use-order";

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsModal({
  open,
  onOpenChange,
  order,
}: OrderDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <OrderDetailsContainer
          showButtons={false}
          onOpenChange={onOpenChange}
          orderDetails={order}
          mode="order-details"
          onChangeMode={() => {
            // No-op function for admin context
            // Admin doesn't need payment actions
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
