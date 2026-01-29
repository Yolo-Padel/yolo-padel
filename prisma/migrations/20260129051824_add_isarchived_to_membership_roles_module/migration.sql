-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "memberships_isArchived_idx" ON "memberships"("isArchived");

-- CreateIndex
CREATE INDEX "modules_isArchived_idx" ON "modules"("isArchived");

-- CreateIndex
CREATE INDEX "roles_isArchived_idx" ON "roles"("isArchived");
