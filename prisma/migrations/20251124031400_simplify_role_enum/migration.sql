/*
  Warnings:

  - The values [SUPER_ADMIN,FINANCE] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/

-- Step 1: Update all users with SUPER_ADMIN role to ADMIN
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'SUPER_ADMIN';

-- Step 2: Update all users with FINANCE role to ADMIN
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'FINANCE';

-- Step 3: Verify all users have valid roles (ADMIN or USER)
-- This query will fail if any users have invalid roles
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM "users"
  WHERE "role" NOT IN ('ADMIN', 'USER');
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Found % users with invalid roles. Migration aborted.', invalid_count;
  END IF;
END $$;

-- Step 4: Remove SUPER_ADMIN and FINANCE from the Role enum
-- Create a new enum type with only ADMIN and USER
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');

-- Update the users table to use the new enum
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- Drop the old enum and rename the new one
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
