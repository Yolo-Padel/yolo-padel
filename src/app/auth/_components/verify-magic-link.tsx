"use client";

import { Loader, CheckCircle, XCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useMagicLinkVerify } from "@/hooks/use-magic-link";

export function VerifyMagicLink() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const magicLinkVerify = useMagicLinkVerify();

  useEffect(() => {
    if (token && !magicLinkVerify.isPending && !magicLinkVerify.isSuccess && !magicLinkVerify.isError) {
      magicLinkVerify.mutate({ token });
    }
  }, [token, magicLinkVerify]);

  // No token in URL
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <XCircle className="size-10 text-destructive" />
        <p className="text-center text-sm text-balance">
          Uh-oh! Seems like the link is invalid or expired. Please try again.
        </p>
        <Button variant={"outline"} onClick={() => router.push("/admin/auth")}>
          Back to login
        </Button>
      </div>
    );
  }

  // Verification successful
  if (magicLinkVerify.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <CheckCircle className="size-10 text-green-500" />
        <p className="text-center text-sm text-balance">
          Magic link verified successfully! Redirecting you now...
        </p>
      </div>
    );
  }

  // Verification failed
  if (magicLinkVerify.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <XCircle className="size-10 text-destructive" />
        <p className="text-center text-sm text-balance">
          {magicLinkVerify.error?.message || "Magic link verification failed. Please try again."}
        </p>
        <div className="flex gap-2">
          <Button 
            variant={"outline"} 
            onClick={() => {
              magicLinkVerify.reset();
              if (token) {
                magicLinkVerify.mutate({ token });
              }
            }}
          >
            Try Again
          </Button>
          <Button variant={"outline"} onClick={() => router.push("/admin/auth")}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  // Loading state (verification in progress)
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader className="size-10 animate-spin text-primary" />
      <p className="text-center text-sm text-balance">
        Hang tight while we verify your magic link...
      </p>
    </div>
  );
}
