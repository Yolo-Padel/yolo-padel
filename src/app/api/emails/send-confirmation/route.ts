import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { z } from 'zod';

// Validation schema
const confirmationEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  userName: z.string().min(1, 'User name is required'),
  confirmationUrl: z.string().url('Invalid confirmation URL'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = confirmationEmailSchema.parse(body);
    
    // Send confirmation email
    const result = await emailService.sendConfirmationEmail(validatedData);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send confirmation email',
          details: result.error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      messageId: result.messageId,
    });
    
  } catch (error: unknown) {
    console.error('Confirmation email API error:', error);
    
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
    message: 'Confirmation email API endpoint',
    method: 'POST',
    requiredFields: ['to', 'userName', 'confirmationUrl'],
  });
}