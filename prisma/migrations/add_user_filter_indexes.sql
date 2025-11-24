-- Manual migration script for adding user filter indexes
-- This can be run directly against the database if needed
-- Run with: psql $DATABASE_URL -f prisma/migrations/add_user_filter_indexes.sql

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

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'profiles')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
