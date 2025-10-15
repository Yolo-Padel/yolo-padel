import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Helper function untuk validasi request body dengan Zod schema
 * @param request - NextRequest object
 * @param schema - Zod schema untuk validasi
 * @returns Object dengan success, data, dan error jika ada
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{
  success: boolean;
  data?: T;
  error?: NextResponse;
}> {
  try {
    const body = await request.json();
    
    const validationResult = schema.safeParse(body);
    
    if (!validationResult.success) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
      
      return {
        success: false,
        error: errorResponse,
      };
    }
    
    return {
      success: true,
      data: validationResult.data,
    };
  } catch (error) {
    console.error("Request validation error:", error);
    
    const errorResponse = NextResponse.json(
      {
        success: false,
        message: "Invalid request body format",
      },
      { status: 400 }
    );
    
    return {
      success: false,
      error: errorResponse,
    };
  }
}
