import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { z } from 'zod';

// Validation schema
const welcomeEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  userName: z.string().min(1, 'User name is required'),
  dashboardUrl: z.string().url('Invalid dashboard URL'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = welcomeEmailSchema.parse(body);
    
    // Send welcome email
    const result = await emailService.sendWelcomeEmail(validatedData);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send welcome email',
          details: result.error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      messageId: result.messageId,
    });
    
  } catch (error: unknown) {
    console.error('Welcome email API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET method untuk testing
export async function GET() {
  return NextResponse.json({
    message: 'Welcome email API endpoint',
    method: 'POST',
    requiredFields: ['to', 'userName', 'dashboardUrl'],
  });
}