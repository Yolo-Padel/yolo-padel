/**
 * RequestContext - Context untuk Dynamic RBAC
 * 
 * Terpisah dari ServiceContext (static RBAC) untuk menghindari backward compatibility issues
 * Digunakan oleh service yang sudah migrasi ke dynamic RBAC system
 */
export interface RequestContext {
  roleId: string;              // roleId dari Roles table (required)
  actorUserId: string;         // userId untuk audit logging (required)
  assignedVenueId?: string | string[];  // venueId untuk filtering (optional)
}

/**
 * Create RequestContext dari user data
 * 
 * @param roleId - roleId dari Roles table
 * @param actorUserId - userId yang melakukan action
 * @param assignedVenueId - optional venueId untuk filtering
 */
export const createRequestContext = (
  roleId: string,
  actorUserId: string,
  assignedVenueId?: string | string[]
): RequestContext => ({
  roleId,
  actorUserId,
  assignedVenueId,
});


