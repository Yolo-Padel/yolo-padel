"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Mail, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useResendInvitation } from "@/hooks/use-users"
import { Role, UserStatus } from "@/types/prisma"

interface ResendInviteButtonProps {
  userId: string
  status: UserStatus
}

export function ResendInviteButton({ userId, status }: ResendInviteButtonProps) {
  const { user: currentUser } = useAuth()
  const resendInvitation = useResendInvitation()
  const [isResending, setIsResending] = useState(false)

  if (status !== UserStatus.INVITED) return null
  if (currentUser?.role !== Role.SUPER_ADMIN) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isResending) return
              setIsResending(true)
              resendInvitation.mutate({ userId } as any, {
                onSettled: () => setIsResending(false),
              })
            }}
            disabled={isResending || resendInvitation.isPending}
            className="border-none shadow-none h-7 w-7 p-0"
          >
            {isResending ? (
              <Loader2 className="size-4 animate-spin text-[#A4A7AE]" />
            ) : (
              <Mail className="size-4 text-[#A4A7AE]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isResending ? "Sending..." : "Resend invitation"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


