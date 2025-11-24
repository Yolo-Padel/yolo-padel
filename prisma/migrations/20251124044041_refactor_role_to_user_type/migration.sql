/*
  Warnings:

  - The `role` column on the `users` table will be renamed to `userType`
  - The `Role` enum will be renamed to `UserType`
  - The values [ADMIN] on the enum `Role` will be replaced with [STAFF]

*/

-- Step 1: Create new UserType enum with STAFF and USER values
CREATE TYPE "UserType" AS ENUM ('STAFF', 'USER');

-- Step 2: Add temporary userType column to users table
ALTER TABLE "users" ADD COLUMN "userType" "UserType";

-- Step 3: Migrate data from role to userType
-- Map ADMIN -> STAFF, USER -> USER
UPDATE "users" SET "userType" = 
  CASE 
    WHEN "role" = 'ADMIN' THEN 'STAFF'::"UserType"
    WHEN "role" = 'USER' THEN 'USER'::"UserType"
    ELSE 'USER'::"UserType"
  END;

-- Step 4: Verify all users have valid userType values
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM "users"
  WHERE "userType" IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Found % users with NULL userType. Migration aborted.', null_count;
  END IF;
END $$;

-- Step 5: Make userType NOT NULL and set default
ALTER TABLE "users" ALTER COLUMN "userType" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'USER'::"UserType";

-- Step 6: Drop the old role column
ALTER TABLE "users" DROP COLUMN "role";

-- Step 7: Drop the old Role enum
DROP TYPE "Role";
