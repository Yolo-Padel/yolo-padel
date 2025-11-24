import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { createRequestContext } from "@/types/request-context";
import { inviteUserService } from "@/lib/services/invite-user.service";
import { userResendInviteSchema } from "@/lib/validations/user.validation";
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

    const body = await request.json();
    const parsed = userResendInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.issues },
        { status: 400 }
      );
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
    const result = await inviteUserService.resendInvitation(parsed.data.userId, requestContext);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("POST /api/users/invite-user/resend error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}


