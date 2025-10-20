"use client"

import * as React from "react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(64).optional().or(z.literal("")),
  lastName: z.string().min(1).max(64).optional().or(z.literal("")),
})

type Role = "ADMIN" | "USER"

// Dummy data untuk admin yang sedang login
const CURRENT_USER = {
  id: "u_1",
  email: "admin@yolopadel.com",
  role: "ADMIN" as Role,
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  profile: {
    userId: "u_1",
    firstName: "Admin",
    lastName: "Yolo",
    avatar: undefined,
  },
}

export default function AdminProfilePage() {
  const [values, setValues] = React.useState<z.infer<typeof schema>>({
    email: "",
    firstName: "",
    lastName: "",
  })
  const [errors, setErrors] = React.useState<Partial<Record<keyof z.infer<typeof schema>, string>>>({})
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    // Load current user data
    setValues({
      email: CURRENT_USER.email,
      firstName: CURRENT_USER.profile?.firstName ?? "",
      lastName: CURRENT_USER.profile?.lastName ?? "",
    })
  }, [])

  function handleChange<K extends keyof z.infer<typeof schema>>(key: K, val: z.infer<typeof schema>[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof z.infer<typeof schema>
        fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    try {
      setSubmitting(true)
      // Dummy submit: console log values
      console.log("Profile update:", parsed.data)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setSubmitting(false)
    }
  }

  const fullName = [values.firstName, values.lastName].filter(Boolean).join(" ") || "Admin User"
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>
              Your current profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={CURRENT_USER.profile?.avatar || undefined} alt={fullName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{values.email}</p>
                <Badge className="mt-1">{CURRENT_USER.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">First Name</label>
                  <Input
                    value={values.firstName ?? ""}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-destructive mt-1 text-xs">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Last Name</label>
                  <Input
                    value={values.lastName ?? ""}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-destructive mt-1 text-xs">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <Input
                  value={values.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  type="email"
                  placeholder="m@example.com"
                />
                {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
              </div>


              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
