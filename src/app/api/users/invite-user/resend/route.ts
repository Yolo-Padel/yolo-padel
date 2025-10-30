import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";
import { inviteUserService } from "@/lib/services/invite-user.service";
import { userResendInviteSchema } from "@/lib/validations/user.validation";

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
    const context = createServiceContext(user.role, user.userId, user.assignedVenueId);
    const result = await inviteUserService.resendInvitation(parsed.data.userId, context);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("POST /api/users/invite-user/resend error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}


