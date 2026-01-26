"use client";

import { Loader, CheckCircle, XCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useMagicLinkVerify, useMagicLinkExtend } from "@/hooks/use-magic-link";

export function VerifyMagicLink() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const magicLinkVerify = useMagicLinkVerify();
  const magicLinkExtend = useMagicLinkExtend();

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
        <Button onClick={() => router.push("/auth")} className="flex-1 bg-brand text-brand-foreground border hover:bg-brand/90">
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

  // Extending magic link
  if (magicLinkExtend.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader className="size-10 animate-spin text-primary" />
        <p className="text-center text-sm text-balance">
          Extending your magic link...
        </p>
      </div>
    );
  }

  // Extension successful - trigger verification
  if (magicLinkExtend.isSuccess) {
    // Reset both mutations and trigger verification again
    magicLinkVerify.reset();
    magicLinkExtend.reset();
    
    if (token) {
      magicLinkVerify.mutate({ token });
    }
  }

  // Verification failed
  if (magicLinkVerify.isError) {
    const errorMessage = magicLinkVerify.error?.message || "Magic link verification failed. Please try again.";
    const isExpired = errorMessage.toLowerCase().includes("expired");
    const isUsed = errorMessage.toLowerCase().includes("used");

    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <XCircle className="size-10 text-destructive" />
        <p className="text-center text-sm text-balance">
          {errorMessage}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/auth")} className="flex-1 bg-primary/20 text-black border border-primary hover:bg-primary/50">
            Back to login
          </Button>
          {isExpired && !isUsed && (
            <Button 
              className="flex-1 bg-brand text-brand-foreground border hover:bg-brand/90"
              onClick={() => {
                if (token) {
                  magicLinkExtend.mutate({ token });
                }
              }}
              disabled={magicLinkExtend.isPending}
            >
              {magicLinkExtend.isPending ? "Extending..." : "Try Again"}
            </Button>
          )}
          {isUsed && (
            <Button 
              className="flex-1 bg-brand text-brand-foreground border hover:bg-brand/90"
              onClick={() => {
                magicLinkVerify.reset();
                if (token) {
                  magicLinkVerify.mutate({ token });
                }
              }}
            >
              Retry Verification
            </Button>
          )}
          {!isExpired && !isUsed && (
            <Button 
              className="flex-1 bg-brand text-brand-foreground border hover:bg-brand/90"
              onClick={() => {
                magicLinkVerify.reset();
                if (token) {
                  magicLinkVerify.mutate({ token });
                }
              }}
            >
              Try Again
            </Button>
          )}
          
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
