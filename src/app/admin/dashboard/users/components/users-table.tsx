"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Search, X, Pencil } from "lucide-react"
import { UsersEditSheet } from "@/app/admin/dashboard/users/components/users-edit-sheet"
import { UsersTableLoading } from "@/app/admin/dashboard/users/components/users-table-loading"
import { useUsers } from "@/hooks/use-users"
import { UserRow } from "@/hooks/use-users"

const PAGE_SIZE = 10

export function UsersTable() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selected, setSelected] = useState<UserRow | null>(null)

  // Fetch users data
  const { data, isLoading, error } = useUsers()

  const allUsers = data?.data?.users || []

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allUsers
    return allUsers.filter((u: any) => {
      const fullName = `${u.profile?.firstName ?? ""} ${u.profile?.lastName ?? ""}`.toLowerCase()
      return (
        u.email.toLowerCase().includes(q) ||
        fullName.includes(q)
      )
    })
  }, [allUsers, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, pageSafe])

  useEffect(() => {
    setPage(1)
  }, [query])

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("")
  }

  // Show loading state
  if (isLoading) {
    return <UsersTableLoading />
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load users: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Add New User
          </Button>
        </div>
      
      <div className="flex items-center justify-end gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((u: any) => {
            const fullName = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || "-"
            return (
              <TableRow key={u.id}>
                <TableCell>{fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.role === "ADMIN" ? (
                    <Badge>ADMIN</Badge>
                  ) : (
                    <Badge variant="secondary">USER</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {u.isActive ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {u.isEmailVerified ? (
                    <Badge variant="secondary">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelected(u); setSheetOpen(true) }}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginated.length} of {filtered.length} users
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={pageSafe <= 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm">Page {pageSafe} / {totalPages}</div>
          <Button 
            variant="outline" 
            disabled={pageSafe >= totalPages} 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <UsersEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={selected as any}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
