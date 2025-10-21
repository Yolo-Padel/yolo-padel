"use client"

import { useState } from "react"
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
// Select component not available, using Input with datalist instead
import { X } from "lucide-react"

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  user?: {
    id: string
    email: string
    profile?: {
      firstName: string | null
      lastName: string | null
    } | null
    role?: string
  } | null
  onSubmit?: (data: {
    fullName: string
    email: string
    role: string
  }) => void
}

export function UserModal({ 
  open, 
  onOpenChange, 
  mode, 
  user, 
  onSubmit 
}: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: user?.profile ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim() : "",
    email: user?.email || "",
    role: user?.role || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="role"
                type="text"
                placeholder="Select Role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                list="role-options"
                required
                className="w-full pr-8"
              />
              <datalist id="role-options">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </datalist>
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-primary text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {primaryButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
