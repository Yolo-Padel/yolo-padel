-- Remove Payments module and its related permissions
DELETE FROM "role_permissions" WHERE "moduleId" IN (SELECT "id" FROM "modules" WHERE "key" = 'payments');
DELETE FROM "modules" WHERE "key" = 'payments';

-- Add Roles module
INSERT INTO "modules" ("id", "key", "label", "description", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'roles',
  'Roles',
  'Manage system roles and permissions',
  (SELECT COALESCE(MAX("orderIndex"), 0) + 1 FROM "modules"),
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("key") DO NOTHING;

-- Add Orders module
INSERT INTO "modules" ("id", "key", "label", "description", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'orders',
  'Orders',
  'Manage customer orders',
  (SELECT COALESCE(MAX("orderIndex"), 0) + 1 FROM "modules"),
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("key") DO NOTHING;
