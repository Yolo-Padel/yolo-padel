import { validateRequest } from "@/lib/validate-request";
import { NextRequest, NextResponse } from "next/server";
import { userCreateSchema } from "@/lib/validations/user.validation";
import { inviteUserService } from "@/lib/services/invite-user.service";
import { verifyAuth } from "@/lib/auth-utils";
import { createRequestContext } from "@/types/request-context";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const tokenResult = await verifyAuth(request);

        if (!tokenResult.isValid) {
            return NextResponse.json(
                { success: false, message: tokenResult.error },
                { status: 401 }
            );
        }

        const validation = await validateRequest(request, userCreateSchema);
        if (!validation.success) {
            return validation.error;
        }

        const { user } = tokenResult;
        
        // Get user dengan roleId untuk dynamic RBAC
        const userWithRole = await prisma.user.findUnique({
          where: { id: user.userId },
          include: { roleRef: true },
        });

        if (!userWithRole?.roleId) {
          return NextResponse.json(
            { success: false, message: "User role not found" },
            { status: 403 }
          );
        }

        const requestContext = createRequestContext(
          userWithRole.roleId,
          user.userId,
          user.assignedVenueId
        );
        const result = await inviteUserService.inviteUser(validation.data!, requestContext);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: result.message, data: result.data }, { status: 200 });
    } catch (error) {
        console.error("Invite user error:", error);
        return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
    }
}