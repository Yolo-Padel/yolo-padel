import { validateRequest } from "@/lib/validate-request";
import { NextRequest, NextResponse } from "next/server";
import { userCreateSchema } from "@/lib/validations/user.validation";
import { inviteUserService } from "@/lib/services/invite-user.service";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";

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

        const serviceContext = createServiceContext(tokenResult.user?.role!, tokenResult.user?.assignedVenueId);
        const result = await inviteUserService.inviteUser(validation.data!, serviceContext);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: result.message, data: result.data }, { status: 200 });
    } catch (error) {
        console.error("Invite user error:", error);
        return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
    }
}