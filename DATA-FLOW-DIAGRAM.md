# Order Page - Detailed Data Flow Diagram

## 🔄 Complete Request-Response Cycle

### Scenario: User searches for "ORD-123"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STEP 1: USER INTERACTION                            │
│                                                                              │
│  User Action: Types "ORD-123" in search box and presses Enter               │
│  Location: Browser                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 2: COMPONENT EVENT HANDLING                          │
│                                                                              │
│  File: order-filters.tsx                                                     │
│  Function: handleKeyDown()                                                   │
│                                                                              │
│  const handleKeyDown = (event: React.KeyboardEvent) => {                    │
│    if (event.key === "Enter") {                                             │
│      onSearchSubmit(localSearchValue);  // ← Calls parent handler           │
│    }                                                                         │
│  };                                                                          │
│                                                                              │
│  Data: localSearchValue = "ORD-123"                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 3: CONTAINER RECEIVES EVENT                          │
│                                                                              │
│  File: page.tsx                                                              │
│  Handler: setSearch (from useOrderFilters hook)                             │
│                                                                              │
│  <OrderFilters                                                               │
│    searchValue={filters.search}                                             │
│    onSearchSubmit={setSearch}  // ← This gets called                        │
│  />                                                                          │
│                                                                              │
│  Data: setSearch("ORD-123")                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 4: HOOK UPDATES STATE                                │
│                                                                              │
│  File: use-order-filters.ts                                                 │
│  Function: setSearch()                                                       │
│                                                                              │
│  const setSearch = (value: string) => {                                     │
│    setFilters(prev => ({                                                    │
│      ...prev,                                                               │
│      search: value,        // ← Update search                               │
│      page: 1               // ← Auto-reset page                             │
│    }));                                                                      │
│  };                                                                          │
│                                                                              │
│  State Before: { search: "", venue: "", paymentStatus: "", page: 1 }        │
│  State After:  { search: "ORD-123", venue: "", paymentStatus: "", page: 1 } │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 5: URL SYNCHRONIZATION                               │
│                                                                              │
│  File: use-order-filters.ts                                                 │
│  Hook: useEffect(() => { ... }, [filters])                                  │
│                                                                              │
│  useEffect(() => {                                                           │
│    const params = new URLSearchParams();                                    │
│    if (filters.search) params.set("search", filters.search);                │
│    // ... build URL                                                          │
│    router.replace(newUrl, { scroll: false });                               │
│  }, [filters]);                                                              │
│                                                                              │
│  URL Before: /admin/dashboard/order                                          │
│  URL After:  /admin/dashboard/order?search=ORD-123&page=1                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 6: REACT QUERY DETECTS CHANGE                        │
│                                                                              │
│  File: use-order.ts                                                          │
│  Hook: useQuery()                                                            │
│                                                                              │
│  useQuery({                                                                  │
│    queryKey: ["admin-orders", options],  // ← Key changed!                  │
│    queryFn: async () => { ... }                                             │
│  })                                                                          │
│                                                                              │
│  Query Key Before: ["admin-orders", { search: "", page: 1, ... }]           │
│  Query Key After:  ["admin-orders", { search: "ORD-123", page: 1, ... }]    │
│                                                                              │
│  Action: Trigger new API request                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 7: BUILD API REQUEST                                 │
│                                                                              │
│  File: use-order.ts                                                          │
│  Function: queryFn                                                           │
│                                                                              │
│  const params = new URLSearchParams();                                      │
│  if (options.search) params.set("search", options.search);                  │
│  if (options.venueId) params.set("venue", options.venueId);                 │
│  if (options.paymentStatus) params.set("paymentStatus", ...);               │
│  params.set("page", options.page.toString());                               │
│  params.set("limit", options.limit.toString());                             │
│                                                                              │
│  Request URL: /api/admin/orders?search=ORD-123&page=1&limit=10              │
│  Method: GET                                                                 │
│  Headers: { Cookie: "auth-token=..." }                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 8: API ROUTE RECEIVES REQUEST                        │
│                                                                              │
│  File: src/app/api/admin/orders/route.ts                                    │
│  Function: GET(request)                                                      │
│                                                                              │
│  1. Extract JWT from cookies                                                │
│     const token = request.cookies.get("auth-token")                         │
│                                                                              │
│  2. Verify authentication                                                   │
│     const tokenResult = await verifyAuth(request)                           │
│     → Decodes JWT, validates signature                                      │
│     → Returns: { isValid: true, user: { id, email, userType, ... } }       │
│                                                                              │
│  3. Check authorization                                                     │
│     if (!ALLOWED_ADMIN_ROLES.includes(user.userType)) return 403            │
│     → ADMIN ✓ | STAFF ✓ | USER ✗                                            │
│                                                                              │
│  User Context: {                                                             │
│    id: "user-123",                                                           │
│    email: "admin@example.com",                                              │
│    userType: "ADMIN",                                                        │
│    assignedVenueIds: []                                                      │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 9: PARSE QUERY PARAMETERS │
│ │
│ File: route.ts │
│ Function: parseQueryParameters(request) │
│ │
│ const { searchParams } = new URL(request.url); │
│ │
│ Raw Params: │
│ search: "ORD-123" │
│ page: "1" │
│ limit: "10" │
│ │
│ Validation & Sanitization: │
│ ✓ Trim whitespace: "ORD-123".trim() → "ORD-123" │
│ ✓ Parse integers: parseInt("1") → 1 │
│ ✓ Validate bounds: limit ≤ 100 │
│ ✓ Validate enums: paymentStatus in [PAID, UNPAID, ...] │
│ ✓ Validate UUID: venue matches UUID regex │
│ │
│ Parsed Result: { │
│ search: "ORD-123", │
│ venueId: undefined, │
│ paymentStatus: undefined, │
│ page: 1, │
│ limit: 10 │
│ } │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 10: CALL SERVICE LAYER │
│ │
│ File: route.ts │
│ │
│ const result = await getOrdersForAdmin({ │
│ // User context (from JWT) │
│ userType: user.userType, // "ADMIN" │
│ assignedVenueIds: user.assignedVenueIds, // [] │
│ │
│ // Filter params (from query string) │
│ search: "ORD-123", │
│ venueId: undefined, │
│ paymentStatus: undefined, │
│ page: 1, │
│ limit: 10 │
│ }); │
│ │
│ Data passed to service: GetOrdersForAdminOptions │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 11: SERVICE BUILDS WHERE CLAUSE │
│ │
│ File: order.service.ts │
│ Function: buildWhereClause(options) │
│ │
│ 1. Build Search Filter │
│ buildSearchFilter("ORD-123") returns: │
│ OR: [ │
│ { orderCode: { contains: "ORD-123", mode: "insensitive" } }, │
│ { user: { profile: { fullName: { contains: "ORD-123" } } } }, │
│ { user: { email: { contains: "ORD-123" } } } │
│ ] │
│ │
│ 2. Build Venue Filter │
│ buildVenueFilter("ADMIN", [], undefined) returns: │
│ undefined // ← ADMIN can see all venues │
│ │
│ 3. Build Payment Status Filter │
│ buildPaymentStatusFilter(undefined) returns: │
│ undefined // ← No payment status filter │
│ │
│ Combined WHERE clause: { │
│ OR: [ │
│ { orderCode: { contains: "ORD-123", mode: "insensitive" } }, │
│ { user: { profile: { fullName: { contains: "ORD-123" } } } }, │
│ { user: { email: { contains: "ORD-123" } } } │
│ ] │
│ } │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 12: SERVICE BUILDS PAGINATION │
│ │
│ File: order.service.ts │
│ Function: buildPaginationParams(page, limit) │
│ │
│ Input: page = 1, limit = 10 │
│ │
│ Calculation: │
│ skip = (page - 1) _ limit = (1 - 1) _ 10 = 0 │
│ take = limit = 10 │
│ │
│ Result: { │
│ skip: 0, │
│ take: 10, │
│ metadata: (total) => ({ │
│ page: 1, │
│ limit: 10, │
│ total: total, │
│ totalPages: Math.ceil(total / 10) │
│ }) │
│ } │
└─────────────────────────────────────────────────────────────────────────────┘
↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 13: EXECUTE PRISMA QUERY │
│ │
│ File: order.service.ts │
│ Function: getOrdersForAdmin() │
│ │
│ const [orders, total] = await Promise.all([ │
│ prisma.order.findMany({ │
│ where: { │
│ OR: [ │
│ { orderCode: { contains: "ORD-123", mode: "insensitive" } }, │
│ { user: { profile: { fullName: { contains: "ORD-123" } } } }, │
│ { user: { email: { contains: "ORD-123" } } } │
│ ] │
│ }, │
│ include: { │
│ user: { select: { id, email, profile: { fullName, avatar } } }, │
│ bookings: { │
│ include: { │
│ court: { select: { id, name, price, image, venue } }, │
│ timeSlots: { select: { openHour, closeHour } } │
│ } │
│ }, │
│ payment: { select: { id, channelName, amount, status, ... } } │
│ }, │
│ orderBy: { createdAt: "desc" }, │
│ skip: 0, │
│ take: 10 │
│ }), │
│ prisma.order.count({ where: { ... } }) │
│ ]); │
│ │
│ Prisma generates SQL (simplified): │
│ SELECT o._, u._, b._, c._, v._, p._, ts.\* │
│ FROM orders o │
│ LEFT JOIN users u ON o.user_id = u.id │
│ LEFT JOIN profiles pr ON u.id = pr.user_id │
│ LEFT JOIN bookings b ON o.id = b.order_id │
│ LEFT JOIN courts c ON b.court_id = c.id │
│ LEFT JOIN venues v ON c.venue_id = v.id │
│ LEFT JOIN payments p ON o.id = p.order_id │
│ LEFT JOIN time_slots ts ON b.id = ts.booking_id │
│ WHERE ( │
│ o.order_code ILIKE '%ORD-123%' OR │
│ pr.full_name ILIKE '%ORD-123%' OR │
│ u.email ILIKE '%ORD-123%' │
│ ) │
│ ORDER BY o.created_at DESC │
│ LIMIT 10 OFFSET 0; │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 14: DATABASE EXECUTES QUERY │
│ │
│ Database: PostgreSQL │
│ │
│ 1. Parse SQL query │
│ 2. Create execution plan │
│ 3. Use indexes: │
│ - Index on orders.order_code │
│ - Index on profiles.full_name │
│ - Index on users.email │
│ 4. Execute JOINs │
│ 5. Apply WHERE filters │
│ 6. Sort by created_at DESC │
│ 7. Apply LIMIT & OFFSET │
│ 8. Return result set │
│ │
│ Query Result: 3 orders found │
│ Total Count: 3 │
│ Execution Time: ~15ms │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 15: SERVICE FORMATS RESPONSE │
│ │
│ File: order.service.ts │
│ │
│ return { │
│ data: orders, // Array of 3 orders with full relations │
│ pagination: { │
│ page: 1, │
│ limit: 10, │
│ total: 3, │
│ totalPages: 1 // Math.ceil(3 / 10) = 1 │
│ } │
│ }; │
│ │
│ Type: GetOrdersForAdminResult │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 16: API ROUTE FORMATS RESPONSE │
│ │
│ File: route.ts │
│ │
│ return NextResponse.json({ │
│ success: true, │
│ message: "Orders fetched successfully", │
│ data: result.data, // 3 orders │
│ pagination: result.pagination // { page: 1, limit: 10, total: 3, ... } │
│ }); │
│ │
│ HTTP Response: │
│ Status: 200 OK │
│ Content-Type: application/json │
│ Body: { success: true, message: "...", data: [...], pagination: {...} } │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 17: REACT QUERY RECEIVES RESPONSE │
│ │
│ File: use-order.ts │
│ Hook: useQuery() │
│ │
│ 1. Receive HTTP response │
│ 2. Parse JSON body │
│ 3. Update cache with new data │
│ Cache Key: ["admin-orders", { search: "ORD-123", page: 1, ... }] │
│ Cache Value: { success: true, data: [...], pagination: {...} } │
│ 4. Update hook state: │
│ - isLoading: false │
│ - isFetching: false │
│ - data: { success: true, data: [...], pagination: {...} } │
│ - error: null │
│ 5. Trigger component re-render │
└─────────────────────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 18: CONTAINER RE-RENDERS │
│ │
│ File: page.tsx │
│ │
│ const { data, isLoading, isFetching } = useAdminOrders(filterOptions); │
│ │
│ State Update: │
│ isLoading: false │
│ isFetching: false │
│ data: { │
│ success: true, │
│ data: [ │
│ { id: "1", orderCode: "ORD-123", user: {...}, bookings: [...] }, │
│ { id: "2", orderCode: "ORD-1234", ... }, │
│ { id: "3", orderCode: "ORD-12345", ... } │
│ ], │
│ pagination: { page: 1, limit: 10, total: 3, totalPages: 1 } │
│ } │
│ │
│ Conditional Rendering: │
│ isInitialLoad = false // ← Data exists │
│ isRefetching = false // ← Not fetching │
│ orders.length = 3 // ← Has results │
│ │
│ Render: <OrderTable orders={orders} pagination={...} /> │
└─────────────────────────────────────────────────────────────────────────────┘
↓
