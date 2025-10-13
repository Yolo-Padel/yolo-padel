"use client"

import * as React from "react"
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
import { Search, X } from "lucide-react"

// Types mengikuti prisma/schema.prisma
type Role = "ADMIN" | "MEMBER"

type User = {
  id: string
  email: string
  username?: string | null
  role: Role
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
}

type Profile = {
  userId: string
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  avatar?: string | null
}

type UserRow = User & { profile?: Profile | null }

const DUMMY_DATA: UserRow[] = [
  {
    id: "u_1",
    email: "admin@yolopadel.com",
    username: "admin",
    role: "ADMIN",
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: "u_1",
      firstName: "Admin",
      lastName: "Yolo",
      bio: "System administrator",
      avatar: undefined,
    },
  },
  {
    id: "u_2",
    email: "jane.smith@example.com",
    username: "janesmith",
    role: "MEMBER",
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
    profile: {
      userId: "u_2",
      firstName: "Jane",
      lastName: "Smith",
      bio: "Player",
      avatar: undefined,
    },
  },
  {
    id: "u_3",
    email: "john.doe@example.com",
    username: "johnd",
    role: "MEMBER",
    isActive: false,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    profile: {
      userId: "u_3",
      firstName: "John",
      lastName: "Doe",
      bio: null,
      avatar: undefined,
    },
  },
]

const PAGE_SIZE = 10

export function UsersTable() {
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return DUMMY_DATA
    return DUMMY_DATA.filter((u) => {
      const fullName = `${u.profile?.firstName ?? ""} ${u.profile?.lastName ?? ""}`.toLowerCase()
      return (
        u.email.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q) ||
        fullName.includes(q)
      )
    })
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginated = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, pageSafe])

  React.useEffect(() => {
    setPage(1)
  }, [query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, email, or username"
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((u) => {
            const fullName = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || "-"
            return (
              <TableRow key={u.id}>
                <TableCell>{fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.username ?? "-"}</TableCell>
                <TableCell>
                  {u.role === "ADMIN" ? (
                    <Badge>ADMIN</Badge>
                  ) : (
                    <Badge variant="secondary">MEMBER</Badge>
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
          <Button variant="outline" disabled={pageSafe <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <div className="text-sm">Page {pageSafe} / {totalPages}</div>
          <Button variant="outline" disabled={pageSafe >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
