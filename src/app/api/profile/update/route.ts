import { NextRequest, NextResponse } from "next/server";
import { profileUpdateSchema } from "@/lib/validations/profile.validation";
import { profileService } from "@/lib/services/profile.service";
import { verifyAuth } from "@/lib/auth-utils";

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = profileUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Validation failed",
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Update profile
    const result = await profileService.updateProfile(user.userId, validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile update API error:", error);
    
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
