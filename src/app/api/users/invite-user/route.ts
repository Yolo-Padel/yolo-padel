import { validateRequest } from "@/lib/validate-request";
import { NextRequest, NextResponse } from "next/server";
import { userCreateSchema } from "@/lib/validations/user.validation";
import { inviteUserService } from "@/lib/services/invite-user.service";

export async function POST(request: NextRequest) {
    try {
        const validation = await validateRequest(request, userCreateSchema);
        if (!validation.success) {
            return validation.error;
        }

        const result = await inviteUserService.inviteUser(validation.data!);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: result.message, data: result.data }, { status: 200 });
    } catch (error) {
        console.error("Invite user error:", error);
        return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
    }
}