// src/app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/booking.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courtId = searchParams.get('courtId');
    const status = searchParams.get('status');

    let result;

    if (userId) {
      result = await bookingService.getByUser(userId);
    } else if (courtId) {
      result = await bookingService.getByCourt(courtId);
    } else if (status) {
      result = await bookingService.getByStatus(status as any);
    } else {
      result = await bookingService.getAll();
    }

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
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
