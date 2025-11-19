import Image from "next/image";

export function OrderEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-30 h-30 flex items-center justify-center mb-6">
        <Image
          src="/order-history-illustration.svg"
          alt="order history"
          width={140}
          height={140}
        />
      </div>

      <h3 className="text-xl font-medium mb-2">No Orders Yet</h3>

      <p className="text-muted-foreground text-center mb-6 max-w-2xs font-light">
        You haven&apos;t made any purchases yet. Your order history will appear
        here once you complete a payment.
      </p>
    </div>
  );
}
