// src/app/api/booking/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/booking.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Booking ID is required',
      }, { status: 400 });
    }

    const result = await bookingService.getById(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
