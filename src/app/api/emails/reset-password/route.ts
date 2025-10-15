import { NextRequest, NextResponse } from "next/server";
import { resendService } from "@/lib/services/resend.service";
import { validateRequest } from "@/lib/validate-request";
import { resetPasswordEmailSchema } from "@/lib/validations/send-email.validation";

export async function POST(request: NextRequest) {
    try {
        const validationResult = await validateRequest(request, resetPasswordEmailSchema);
        
        if (!validationResult.success) {
            return validationResult.error!;
        }
        
        const result = await resendService.sendResetPasswordEmail(validationResult.data!);
        
        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error) {
        console.error("Reset password email API error:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Internal server error" 
            },
            { status: 500 }
        );
    }
}
