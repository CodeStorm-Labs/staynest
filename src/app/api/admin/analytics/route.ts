import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { booking, listing, user } from '@/db/schema';
import { isAdmin } from '@/lib/auth-utils';
import { SQL, and, count, eq, gte, sql, sum } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || 'last6Months';
    
    // Calculate date ranges based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'last3Months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last6Months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'lastYear':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }
    
    // Get last month's start and end dates for new users and bookings calculations
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(now.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);
    
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0); // Last day of previous month
    lastMonthEnd.setHours(23, 59, 59, 999);
    
    // Get total revenue
    const revenueResult = await db
      .select({ 
        totalRevenue: sum(booking.totalPrice)
      })
      .from(booking);
    
    // Get bookings for last month
    const lastMonthBookingsResult = await db
      .select({ 
        count: count()
      })
      .from(booking)
      .where(
        and(
          gte(booking.createdAt, lastMonthStart),
          sql`${booking.createdAt} <= ${lastMonthEnd}`
        )
      );
    
    // Get users created in last month
    const newUsersResult = await db
      .select({ 
        count: count()
      })
      .from(user)
      .where(
        and(
          gte(user.createdAt, lastMonthStart),
          sql`${user.createdAt} <= ${lastMonthEnd}`
        )
      );
    
    // Mock data for the other analytics parts
    // In a real implementation, these would be calculated from the database
    
    const analyticsData = {
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      bookingsLastMonth: lastMonthBookingsResult[0]?.count || 0,
      newUsersLastMonth: newUsersResult[0]?.count || 0,
      // Mock data for the charts
      bookingsByMonth: [
        { month: 'Ocak', bookings: 12 },
        { month: 'Şubat', bookings: 19 },
        { month: 'Mart', bookings: 15 },
        { month: 'Nisan', bookings: 22 },
        { month: 'Mayıs', bookings: 28 },
        { month: 'Haziran', bookings: 25 },
      ],
      revenueByMonth: [
        { month: 'Ocak', revenue: 1200 },
        { month: 'Şubat', revenue: 1900 },
        { month: 'Mart', revenue: 1500 },
        { month: 'Nisan', revenue: 2200 },
        { month: 'Mayıs', revenue: 2800 },
        { month: 'Haziran', revenue: 2500 },
      ],
      topLocations: [
        { location: 'İstanbul', bookings: 45 },
        { location: 'Ankara', bookings: 32 },
        { location: 'İzmir', bookings: 28 },
        { location: 'Antalya', bookings: 25 },
        { location: 'Muğla', bookings: 18 },
      ],
      bookingsByStatus: [
        { status: 'Onaylandı', count: 85 },
        { status: 'Bekleniyor', count: 15 },
        { status: 'İptal Edildi', count: 10 },
      ]
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 