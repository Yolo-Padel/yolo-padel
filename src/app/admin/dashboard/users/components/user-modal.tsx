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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { User, Profile, Role } from "@/types/prisma"
import { useInviteUser } from "@/hooks/use-users"
import { userCreateSchema, UserCreateData } from "@/lib/validations/user.validation"

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  user?: User & { profile?: Profile | null }
}

export function UserModal({ 
  open, 
  onOpenChange, 
  mode, 
  user
}: UserModalProps) {
  const inviteUserMutation = useInviteUser()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<UserCreateData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: Role.USER
    }
  })

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        setValue("fullName", user.profile?.fullName || "")
        setValue("email", user.email)
        setValue("role", user.role)
      } else {
        reset({
          fullName: "",
          email: "",
          role: Role.USER
        })
      }
    }
  }, [open, mode, user, setValue, reset])

  const onSubmit = async (data: UserCreateData) => {
    try {
      if (mode === "add") {
        await inviteUserMutation.mutateAsync(data)
        onOpenChange(false)
      } else {
        // TODO: Implement edit user functionality
        console.log("Edit user:", data)
        onOpenChange(false)
      }
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Submit error:", error)
    }
  }

  const isAddMode = mode === "add"
  const title = isAddMode ? "Invite New User" : "Edit User"
  const description = isAddMode 
    ? "Add a new member or admin to your YOLO Padel system. They'll receive an email invitation to join right away."
    : "Update user information, role, or access permissions."
  const primaryButtonText = isAddMode ? "Send Invitation" : "Save Changes"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[545px]" showCloseButton={false}>
        <div className="relative">
          <DialogHeader className="pr-8 gap-0">
            <DialogTitle className="text-xl font-semibold">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {description}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              {...register("fullName")}
              className="w-full"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value as Role)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.USER}>User</SelectItem>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              className="w-full"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

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
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : primaryButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
