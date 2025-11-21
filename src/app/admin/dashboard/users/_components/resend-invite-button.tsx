"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCcw, Loader2 } from "lucide-react";
import { useResendInvitation } from "@/hooks/use-users";

interface ResendInviteButtonProps {
  userId: string;
}

export function ResendInviteButton({ userId }: ResendInviteButtonProps) {
  const resendInvitation = useResendInvitation();
  const [isResending, setIsResending] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => {
              if (isResending) return;
              setIsResending(true);
              resendInvitation.mutate({ userId } as any, {
                onSettled: () => setIsResending(false),
              });
            }}
            disabled={isResending || resendInvitation.isPending}
            className="border-none shadow-none"
          >
            {isResending ? (
              <Loader2 className="size-4 animate-spin text-[#A4A7AE]" />
            ) : (
              <RefreshCcw className="size-4 text-[#A4A7AE]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isResending ? "Sending..." : "Resend invitation"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
