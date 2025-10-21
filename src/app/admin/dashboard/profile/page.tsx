"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useAuth } from "@/hooks/use-auth"
import { useUpdateProfile } from "@/hooks/use-profile"
import { profileUpdateSchema, ProfileUpdateData } from "@/lib/validations/profile.validation"

export default function AdminProfilePage() {
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const updateProfileMutation = useUpdateProfile()
  
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    mode: "onChange", // Enable real-time validation
  })

  useEffect(() => {
    // Load current user data
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      })
    }
  }, [profile, form])

  const onSubmit = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data)
  }

  // Check if form has changes from original values
  const hasChanges = useMemo(() => {
    if (!profile) return false
    
    const currentValues = form.getValues()
    const originalValues = {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
    }
    
    return (
      currentValues.firstName !== originalValues.firstName ||
      currentValues.lastName !== originalValues.lastName
    )
  }, [form.watch(), profile])

  // Check if form is valid and has changes
  const isFormValid = form.formState.isValid && hasChanges

  const fullName = [form.watch("firstName"), form.watch("lastName")].filter(Boolean).join(" ") || "User"
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase()
  
  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar || undefined} alt={fullName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account settings and profile information.
              </CardDescription>
              <Badge className="mt-2">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name <span className="text-red-500">*</span></FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...form.register("firstName")}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name <span className="text-red-500">*</span></FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...form.register("lastName")}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  value={user.email}
                  type="email"
                  placeholder="m@example.com"
                  disabled
                  className="bg-muted"
                />
              </Field>

              <Field>
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending || !isFormValid}
                    className="min-w-[120px]"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
