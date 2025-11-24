-- Add indexes for user filtering performance optimization
-- These indexes support the user page filters feature

-- Index on profiles.full_name for search filtering
CREATE INDEX IF NOT EXISTS "idx_profiles_full_name" ON "profiles"("fullName");

-- Index on users.user_type for user type filtering
CREATE INDEX IF NOT EXISTS "idx_users_user_type" ON "users"("userType");

-- Index on users.user_status for status filtering
CREATE INDEX IF NOT EXISTS "idx_users_user_status" ON "users"("userStatus");

-- GIN index on users.assigned_venue_ids for venue filtering (array field)
CREATE INDEX IF NOT EXISTS "idx_users_assigned_venue_ids" ON "users" USING GIN("assignedVenueIds");

-- Note: users.email already has a unique constraint which creates an index automatically
