# Order Page Architecture Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Separation of Concerns](#separation-of-concerns)
3. [Data Flow](#data-flow)
4. [File Structure](#file-structure)
5. [Layer Responsibilities](#layer-responsibilities)
6. [Component Details](#component-details)

---

## 🎯 Overview

Order page mengimplementasikan **clean architecture** dengan pemisahan concern yang jelas antara:

- **Data Layer**: Database operations (Prisma)
- **Service Layer**: Business logic
- **API Layer**: HTTP endpoints
- **Hook Layer**: Client-side data fetching & state management
- **Component Layer**: UI presentation

Arsitektur ini memastikan:

- ✅ **Testability**: Setiap layer bisa di-test secara isolated
- ✅ **Maintainability**: Perubahan di satu layer tidak affect layer lain
- ✅ **Scalability**: Pattern bisa direplikasi untuk halaman lain
- ✅ **Type Safety**: Full TypeScript coverage

---

## 🏗️ Separation of Concerns

### Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  (React Components - Pure UI, No Business Logic)        │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    CONTAINER LAYER                       │
│  (OrderPage - Orchestrates hooks & components)          │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                      HOOK LAYER                          │
│  (useOrderFilters, useAdminOrders - State & Logic)      │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                       API LAYER                          │
│  (/api/admin/orders - HTTP endpoint, validation)        │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                        │
│  (order.service.ts - Business logic, filtering)         │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  (Prisma - Database queries, transactions)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Complete Request Flow (User Action → Database → UI)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                              │
│    User types search query & presses Enter                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION LAYER (OrderFilters.tsx)                         │
│    - Captures Enter key event                                    │
│    - Calls: onSearchSubmit(localSearchValue)                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. CONTAINER LAYER (OrderPage.tsx)                               │
│    - Receives search value via setSearch()                       │
│    - Passes to useOrderFilters hook                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. HOOK LAYER - State Management (useOrderFilters)               │
│    - Updates filter state: { search: "ORD-123", ... }            │
│    - Auto-resets page to 1                                       │
│    - Syncs to URL: ?search=ORD-123&page=1                        │
│    - Returns updated filters object                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. HOOK LAYER - Data Fetching (useAdminOrders)                   │
│    - Detects filter change via React Query                       │
│    - Builds query params: /api/admin/orders?search=ORD-123       │
│    - Sends HTTP GET request                                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. API LAYER (route.ts)                                          │
│    - Verifies JWT token (verifyAuth)                             │
│    - Checks user permissions (ADMIN/STAFF)                       │
│    - Parses query params: parseQueryParameters()                 │
│    - Validates input (UUID format, enum values)                  │
│    - Calls service: getOrdersForAdmin(options)                   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. SERVICE LAYER (order.service.ts)                              │
│    - Builds WHERE clause: buildWhereClause()                     │
│      • Search filter: OR(orderCode, fullName, email)             │
│      • Venue filter: Based on user type & assigned venues        │
│      • Payment status filter                                     │
│    - Builds pagination: buildPaginationParams()                  │
│    - Executes Prisma query with filters                          │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. DATA LAYER (Prisma)                                           │
│    - Generates SQL query with JOINs                              │
│    - Executes on PostgreSQL database                             │
│    - Returns: orders + user + bookings + payment                 │
│    - Returns: total count for pagination                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 9. RESPONSE FLOW (Back to Client)                                │
│    Service → API → Hook → Component                              │
│    - Service formats: { data: [], pagination: {} }               │
│    - API wraps: { success: true, data, pagination }              │
│    - Hook caches via React Query                                 │
│    - Component receives data & re-renders                        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ 10. UI UPDATE                                                    │
│     - OrderPage shows OrderTableSkeleton (loading)               │
│     - Data arrives → OrderTable renders with new data            │
│     - Pagination updates based on metadata                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/app/admin/dashboard/order/
├── page.tsx                          # Container - Orchestrates everything
├── ARCHITECTURE.md                   # This documentation
│
├── _components/
│   ├── order-filters.tsx            # Presentational - Filter UI
│   ├── order-table.tsx              # Presentational - Table display
│   ├── order-table-skeleton.tsx     # Presentational - Loading state
│   ├── order-table-loading.tsx      # Presentational - Initial load
│   ├── order-empty-state.tsx        # Presentational - No results
│   ├── order-header.tsx             # Presentational - Page header
│   └── order-details-modal.tsx      # Presentational - Order details
│
src/hooks/
├── use-order-filters.ts             # Logic - Filter state & URL sync
└── use-order.ts                     # Logic - Data fetching (React Query)
│
src/app/api/admin/orders/
└── route.ts                         # API - HTTP endpoint & validation
│
src/lib/services/
└── order.service.ts                 # Service - Business logic & DB queries
```

### File Responsibilities

| File                   | Type         | Responsibility             | Dependencies           |
| ---------------------- | ------------ | -------------------------- | ---------------------- |
| `page.tsx`             | Container    | Compose hooks & components | All hooks & components |
| `order-filters.tsx`    | Presentation | Render filter UI           | UI components only     |
| `order-table.tsx`      | Presentation | Render table               | UI components only     |
| `use-order-filters.ts` | Logic Hook   | Filter state & URL sync    | Next.js router         |
| `use-order.ts`         | Logic Hook   | Data fetching              | React Query, fetch API |
| `route.ts`             | API          | HTTP endpoint              | Service layer          |
| `order.service.ts`     | Service      | Business logic             | Prisma                 |

---

## 🎭 Layer Responsibilities

### 1. Data Layer (Prisma)

**Location**: `prisma/schema.prisma`

**Responsibility**:

- Define database schema
- Generate type-safe client
- Execute SQL queries
- Handle transactions

**Example**:

```typescript
// Prisma generates this query from service layer
prisma.order.findMany({
  where: {
    OR: [
      { orderCode: { contains: "ORD-123", mode: "insensitive" } },
      { user: { profile: { fullName: { contains: "ORD-123" } } } },
    ],
    bookings: { some: { court: { venueId: { in: ["venue-1"] } } } },
    payment: { status: "PAID" },
  },
  include: { user: true, bookings: true, payment: true },
  skip: 0,
  take: 10,
});
```

---

### 2. Service Layer

**Location**: `src/lib/services/order.service.ts`

**Responsibility**:

- Business logic implementation
- Build complex Prisma queries
- Authorization logic (ADMIN vs STAFF)
- Data transformation
- Input sanitization

**Key Functions**:

```typescript
// Main function - orchestrates filtering & pagination
getOrdersForAdmin(options: GetOrdersForAdminOptions)

// Helper functions - single responsibility
buildWhereClause()        // Combines all filters
buildSearchFilter()       // Search across multiple fields
buildVenueFilter()        // Authorization-aware venue filtering
buildPaymentStatusFilter() // Payment status filtering
buildPaginationParams()   // Pagination logic
sanitizeSearchInput()     // Input validation
```

**Example Authorization Logic**:

```typescript
// ADMIN: Can see all venues
if (userType === "ADMIN") {
  return venueId ? { some: { court: { venueId } } } : undefined;
}

// STAFF: Only assigned venues
if (userType === "STAFF") {
  return {
    some: {
      court: {
        venueId: { in: assignedVenueIds },
      },
    },
  };
}
```

---

### 3. API Layer

**Location**: `src/app/api/admin/orders/route.ts`

**Responsibility**:

- HTTP request/response handling
- Authentication & authorization
- Query parameter parsing & validation
- Error handling
- Response formatting

**Request Flow**:

```typescript
export async function GET(request: NextRequest) {
  // 1. Authentication
  const tokenResult = await verifyAuth(request);
  if (!tokenResult.isValid) return 401;

  // 2. Authorization
  if (!ALLOWED_ADMIN_ROLES.includes(user.userType)) return 403;

  // 3. Parse & validate query params
  const { search, venueId, paymentStatus, page, limit } =
    parseQueryParameters(request);

  // 4. Call service layer
  const result = await getOrdersForAdmin({
    userType: user.userType,
    assignedVenueIds: user.assignedVenueIds,
    search,
    venueId,
    paymentStatus,
    page,
    limit,
  });

  // 5. Format response
  return NextResponse.json({
    success: true,
    message: "Orders fetched successfully",
    data: result.data,
    pagination: result.pagination,
  });
}
```

**Input Validation**:

```typescript
// UUID format validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (uuidRegex.test(venue)) venueId = venue;

// Enum validation
const validStatuses = [PaymentStatus.UNPAID, PaymentStatus.PAID, ...];
if (validStatuses.includes(paymentStatusParam)) {
  paymentStatus = paymentStatusParam;
}

// Numeric validation with bounds
const limit = Math.max(1, Math.min(100, parsedLimit || 10));
```

---

### 4. Hook Layer

#### A. useOrderFilters (State Management)

**Location**: `src/hooks/use-order-filters.ts`

**Responsibility**:

- Filter state management
- URL synchronization (read & write)
- Auto-reset pagination on filter change
- Computed values (hasActiveFilters)

**State Flow**:

```typescript
// 1. Initialize from URL on mount
const [filters, setFilters] = useState(() => ({
  search: searchParams.get("search") || "",
  venue: searchParams.get("venue") || "",
  paymentStatus: searchParams.get("paymentStatus") || "",
  page: parseInt(searchParams.get("page") || "1"),
}));

// 2. Update URL when filters change
useEffect(() => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.venue) params.set("venue", filters.venue);
  // ... build URL
  router.replace(newUrl, { scroll: false });
}, [filters]);

// 3. Auto-reset page on filter change
const setSearch = (value: string) => {
  setFilters((prev) => ({
    ...prev,
    search: value,
    page: 1, // ← Auto-reset
  }));
};
```

**API**:

```typescript
interface UseOrderFiltersReturn {
  filters: OrderFilters; // Current filter state
  setSearch: (value: string) => void;
  setVenue: (value: string) => void;
  setPaymentStatus: (value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void; // Clear all filters
  hasActiveFilters: boolean; // Computed value
}
```

#### B. useAdminOrders (Data Fetching)

**Location**: `src/hooks/use-order.ts`

**Responsibility**:

- Fetch orders from API
- React Query integration (caching, refetching)
- Loading & error states
- Automatic refetch on filter change

**Implementation**:

```typescript
export function useAdminOrders(options: AdminOrdersOptions) {
  return useQuery({
    queryKey: ["admin-orders", options], // ← Cache key includes filters
    queryFn: async () => {
      // Build query string from options
      const params = new URLSearchParams();
      if (options.search) params.set("search", options.search);
      if (options.venueId) params.set("venue", options.venueId);
      // ...

      // Fetch from API
      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}
```

**React Query Benefits**:

- ✅ Automatic caching (same filters = cached result)
- ✅ Background refetching
- ✅ Loading & error states
- ✅ Deduplication (multiple components, single request)

---

### 5. Container Layer

**Location**: `src/app/admin/dashboard/order/page.tsx`

**Responsibility**:

- Orchestrate hooks & components
- Handle user interactions
- Manage modal state
- Conditional rendering based on loading/error/empty states

**Composition Pattern**:

```typescript
export default function OrderPage() {
  // 1. Consume hooks
  const { filters, setSearch, setVenue, ... } = useOrderFilters();
  const { data, isLoading, isFetching } = useAdminOrders(filters);

  // 2. Local UI state
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  // 3. Event handlers
  const handlePageChange = (page: number) => setPage(page);
  const handleViewOrder = (order: Order) => { ... };

  // 4. Conditional rendering
  if (isInitialLoad) return <OrderTableLoading />;
  if (error) return <ErrorState />;
  if (orders.length === 0) return <EmptyState />;

  // 5. Compose components
  return (
    <>
      <OrderHeader orderCount={total} />
      <OrderFilters {...filterProps} />
      {isRefetching ? <OrderTableSkeleton /> : <OrderTable {...tableProps} />}
      <OrderDetailsModal {...modalProps} />
    </>
  );
}
```

**Key Decisions**:

- ✅ No business logic (delegated to hooks)
- ✅ No direct API calls (delegated to hooks)
- ✅ Only composition & coordination
- ✅ Clear data flow (props down, events up)

---

### 6. Presentation Layer

**Location**: `src/app/admin/dashboard/order/_components/`

**Responsibility**:

- Pure UI rendering
- No business logic
- No API calls
- No complex state management
- Receive props, render UI, emit events

#### OrderFilters Component

```typescript
interface OrderFiltersProps {
  // Current values
  searchValue: string;
  venueFilter: string;
  paymentStatusFilter: string;

  // Event handlers
  onSearchSubmit: (value: string) => void;
  onVenueFilterChange: (value: string) => void;
  onPaymentStatusFilterChange: (value: string) => void;

  // UI state
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function OrderFilters(props: OrderFiltersProps) {
  // Local state for controlled input
  const [localSearchValue, setLocalSearchValue] = useState(props.searchValue);

  // Only emit on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      props.onSearchSubmit(localSearchValue);
    }
  };

  return (
    <div>
      <InputGroup>
        <InputGroupInput
          value={localSearchValue}
          onChange={(e) => setLocalSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </InputGroup>

      <Select value={props.venueFilter} onValueChange={props.onVenueFilterChange}>
        {/* ... */}
      </Select>

      {props.hasActiveFilters && (
        <Button onClick={props.onReset}>Reset</Button>
      )}
    </div>
  );
}
```

**Design Principles**:

- ✅ Props in, events out
- ✅ No side effects (except local UI state)
- ✅ Easily testable with mock props
- ✅ Reusable in different contexts

---

## 🔍 Component Details

### Component Hierarchy

```
OrderPage (Container)
├── OrderHeader
│   └── Displays total order count
│
├── OrderFilters (Presentational)
│   ├── Search Input (Enter-only trigger)
│   ├── Venue Select
│   ├── Payment Status Select
│   └── Reset Button (conditional)
│
├── Conditional Rendering:
│   ├── OrderTableLoading (Initial load - full page)
│   ├── OrderTableSkeleton (Refetch - table only)
│   ├── OrderEmptyState (No results)
│   └── OrderTable (Data loaded)
│       ├── Table Headers
│       ├── Table Rows (map over orders)
│       └── Pagination Controls
│
└── OrderDetailsModal
    └── Shows order details on click
```

### Loading States Strategy

```typescript
// Distinguish between initial load and refetch
const isInitialLoad = isLoading && !data;
const isRefetching = isFetching && !isInitialLoad;

// Initial load: Show full-page skeleton
if (isInitialLoad) {
  return <OrderTableLoading />;  // Covers entire page
}

// Refetch: Show table skeleton only
return (
  <>
    <OrderHeader />      // ← Still visible
    <OrderFilters />     // ← Still interactive
    {isRefetching ? (
      <OrderTableSkeleton />  // ← Only table area
    ) : (
      <OrderTable />
    )}
  </>
);
```

**Benefits**:

- ✅ Better UX: Filters remain interactive during refetch
- ✅ Visual feedback: User knows data is loading
- ✅ No layout shift: Skeleton matches table structure

---

## 🎯 Key Design Patterns

### 1. Single Responsibility Principle

Setiap file/function punya satu tanggung jawab:

- `buildSearchFilter()`: Hanya build search WHERE clause
- `buildVenueFilter()`: Hanya build venue WHERE clause
- `useOrderFilters`: Hanya manage filter state
- `OrderFilters`: Hanya render filter UI

### 2. Dependency Inversion

Layer atas tidak depend pada implementasi layer bawah:

```typescript
// ✅ Good: Container depends on abstraction (hook interface)
const { filters, setSearch } = useOrderFilters();

// ❌ Bad: Container directly calls API
const response = await fetch("/api/orders");
```

### 3. Composition Over Inheritance

```typescript
// ✅ Compose small, focused components
<OrderPage>
  <OrderHeader />
  <OrderFilters />
  <OrderTable />
</OrderPage>

// ❌ Not: One giant component with everything
```

### 4. Explicit Data Flow

```
User Input → Event Handler → Hook → API → Service → Database
                                                        ↓
UI Update ← Component ← Hook ← API Response ← Service ← Database
```

### 5. URL as Source of Truth

```typescript
// URL reflects current state
?search=ORD-123&venue=venue-1&paymentStatus=PAID&page=2

// Benefits:
// ✅ Shareable links
// ✅ Browser back/forward works
// ✅ Refresh preserves state
```

---

## 🧪 Testing Strategy

### Unit Testing by Layer

#### Service Layer Tests

```typescript
describe("order.service", () => {
  describe("buildSearchFilter", () => {
    it("should build OR clause for search", () => {
      const filter = buildSearchFilter("ORD-123");
      expect(filter).toEqual([
        { orderCode: { contains: "ORD-123", mode: "insensitive" } },
        { user: { profile: { fullName: { contains: "ORD-123" } } } },
        { user: { email: { contains: "ORD-123" } } },
      ]);
    });
  });

  describe("buildVenueFilter", () => {
    it("should allow ADMIN to see all venues", () => {
      const filter = buildVenueFilter("ADMIN", [], undefined);
      expect(filter).toBeUndefined();
    });

    it("should restrict STAFF to assigned venues", () => {
      const filter = buildVenueFilter("STAFF", ["venue-1"], undefined);
      expect(filter).toEqual({
        some: { court: { venueId: { in: ["venue-1"] } } },
      });
    });
  });
});
```

#### Hook Tests

```typescript
describe("useOrderFilters", () => {
  it("should initialize from URL params", () => {
    // Mock URL: ?search=test&page=2
    const { result } = renderHook(() => useOrderFilters());
    expect(result.current.filters.search).toBe("test");
    expect(result.current.filters.page).toBe(2);
  });

  it("should reset page when filter changes", () => {
    const { result } = renderHook(() => useOrderFilters());
    act(() => result.current.setSearch("new search"));
    expect(result.current.filters.page).toBe(1);
  });
});
```

#### Component Tests

```typescript
describe("OrderFilters", () => {
  it("should call onSearchSubmit only on Enter key", () => {
    const onSearchSubmit = jest.fn();
    render(<OrderFilters onSearchSubmit={onSearchSubmit} {...props} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "test" } });
    expect(onSearchSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearchSubmit).toHaveBeenCalledWith("test");
  });
});
```

---

## 🚀 Benefits of This Architecture

### 1. Maintainability

- **Clear boundaries**: Setiap layer punya tanggung jawab yang jelas
- **Easy to locate bugs**: Tahu persis di layer mana masalahnya
- **Safe refactoring**: Perubahan di satu layer tidak break yang lain

### 2. Testability

- **Isolated testing**: Setiap layer bisa di-test sendiri
- **Mock-friendly**: Interface yang jelas memudahkan mocking
- **Fast tests**: Tidak perlu setup database untuk test UI

### 3. Scalability

- **Reusable pattern**: Bisa direplikasi untuk halaman lain
- **Easy to extend**: Tambah filter baru tanpa rewrite
- **Team collaboration**: Developer bisa kerja di layer berbeda

### 4. Performance

- **React Query caching**: Mengurangi API calls
- **Server-side filtering**: Database yang handle filtering, bukan client
- **Optimistic updates**: UI responsive saat data loading

### 5. Developer Experience

- **Type safety**: Full TypeScript coverage
- **Clear contracts**: Interface yang jelas antar layer
- **Self-documenting**: Code structure menjelaskan flow

---

## 📚 Replicating This Pattern

Untuk halaman lain (booking, users, venues), ikuti pattern ini:

### 1. Create Service Layer

```typescript
// src/lib/services/booking.service.ts
export async function getBookingsForAdmin(options: GetBookingsOptions) {
  const where = buildWhereClause(options);
  const { skip, take, metadata } = buildPaginationParams(options);
  // ... Prisma query
}
```

### 2. Create API Route

```typescript
// src/app/api/admin/bookings/route.ts
export async function GET(request: NextRequest) {
  const tokenResult = await verifyAuth(request);
  const params = parseQueryParameters(request);
  const result = await getBookingsForAdmin(params);
  return NextResponse.json(result);
}
```

### 3. Create Hooks

```typescript
// src/hooks/use-booking-filters.ts
export function useBookingFilters() {
  /* ... */
}

// src/hooks/use-booking.ts
export function useAdminBookings(options) {
  return useQuery({
    queryKey: ["admin-bookings", options],
    queryFn: () => fetch("/api/admin/bookings?" + params),
  });
}
```

### 4. Create Components

```typescript
// src/app/admin/dashboard/booking/_components/
// - booking-filters.tsx
// - booking-table.tsx
// - booking-table-skeleton.tsx
```

### 5. Create Container

```typescript
// src/app/admin/dashboard/booking/page.tsx
export default function BookingPage() {
  const filters = useBookingFilters();
  const { data } = useAdminBookings(filters.filters);
  return <>{/* Compose components */}</>;
}
```

---

## 🎓 Learning Resources

- **Clean Architecture**: Robert C. Martin
- **React Query**: https://tanstack.com/query/latest
- **Prisma Best Practices**: https://www.prisma.io/docs/guides
- **Next.js App Router**: https://nextjs.org/docs/app

---

**Last Updated**: November 2024  
**Maintainer**: Development Team  
**Questions?**: Refer to this doc or ask the team!
