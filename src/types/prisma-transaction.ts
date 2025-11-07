import type { Prisma } from "@prisma/client";

/**
 * Prisma Transaction Client Type
 * Used for passing transaction client to service functions
 * Supports both standalone operations and transaction mode
 */
export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

