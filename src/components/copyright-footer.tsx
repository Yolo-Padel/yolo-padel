type CopyrightFooterVariant = "default" | "brand" | "primary";

interface CopyrightFooterProps {
  variant?: CopyrightFooterVariant;
}

export function CopyrightFooter({ variant = "default" }: CopyrightFooterProps) {
  const isBrand = variant === "brand";
  const isPrimary = variant === "primary";

  return (
    <div
      className={
        isBrand
          ? "py-3 text-center text-sm font-bold text-brand-foreground bg-brand"
          : isPrimary
            ? "py-3 text-center text-sm font-bold text-primary-foreground bg-primary"
            : "py-3 text-center text-sm text-muted-foreground"
      }
    >
      © PT Pluit Delapan Arena. All Rights Reserved.
    </div>
  );
}
