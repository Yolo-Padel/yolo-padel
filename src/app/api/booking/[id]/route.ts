// src/app/api/booking/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/booking.service';
import { verifyAuth } from '@/lib/auth-utils';
import { createServiceContext } from '@/types/service-context';

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

export async function PATCH(
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

    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, data: null, message: tokenResult.error },
        { status: 401 }
      );
    }

    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );

    const result = await bookingService.cancel(id, serviceContext);

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
    console.error('Cancel booking API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
