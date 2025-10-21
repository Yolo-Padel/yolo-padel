import { VerifyMagicLink } from "@/app/admin/auth/_components/verify-magic-link";
import { Suspense } from "react";

export default function AdminVerifyMagicLinkPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyMagicLink />
      </Suspense>
    </div>
  );
}
