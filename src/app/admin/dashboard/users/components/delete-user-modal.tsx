"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { User, Profile } from "@/types/prisma"
import { useDeleteUser } from "@/hooks/use-users"
import { userDeleteSchema, UserDeleteData } from "@/lib/validations/user.validation"

interface DeleteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User & { profile?: Profile | null }
}

export function DeleteUserModal({ 
  open, 
  onOpenChange,
  user
}: DeleteUserModalProps) {
  const deleteUserMutation = useDeleteUser()
  
  const {
    formState: { errors, isSubmitting },
    reset,
    setValue,
    handleSubmit
  } = useForm<UserDeleteData>({
    resolver: zodResolver(userDeleteSchema),
    defaultValues: {
      userId: user?.id || ""
    }
  })

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        setValue("userId", user.id)
      } else {
        reset({
          userId: ""
        })
      }
    }
  }, [open, user, setValue, reset])

  const onSubmit = async (data: UserDeleteData) => {
    try {
      if (user) {
        await deleteUserMutation.mutateAsync(data)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Delete user error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[545px]" showCloseButton={false}>
        <div className="relative">
          <DialogHeader className="pr-8 gap-0">
            <DialogTitle className="text-xl font-semibold">
              Remove User
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to remove <b>{user?.profile?.fullName}</b> from the system?
              They won't be able to log in anymore, but their data (bookings, orders, and payment history) will still be stored for record purposes.
            </DialogDescription>
          </DialogHeader>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-3 pt-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-primary text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Delete User"}
            </Button>
          </div>
        </form>  
      </DialogContent>
    </Dialog>
  )
}
