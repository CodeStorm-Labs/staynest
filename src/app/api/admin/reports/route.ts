import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-utils';

// Mock reports data for demonstration purposes
const mockReports = [
  {
    id: '1',
    type: 'bookings',
    title: 'Aylık Rezervasyon Raporu - Temmuz 2023',
    createdAt: '2023-08-01T10:30:00Z',
    status: 'completed',
    format: 'pdf'
  },
  {
    id: '2',
    type: 'revenue',
    title: 'Gelir Raporu - Q2 2023',
    createdAt: '2023-07-05T14:20:00Z',
    status: 'completed',
    format: 'excel'
  },
  {
    id: '3',
    type: 'users',
    title: 'Yeni Kullanıcı Raporu - Haziran 2023',
    createdAt: '2023-07-01T09:15:00Z',
    status: 'completed',
    format: 'pdf'
  },
  {
    id: '4',
    type: 'listings',
    title: 'İlan Aktivite Raporu - Son 3 Ay',
    createdAt: '2023-06-15T11:45:00Z',
    status: 'completed',
    format: 'csv'
  },
  {
    id: '5',
    type: 'bookings',
    title: 'İptal Edilen Rezervasyonlar - 2023',
    createdAt: '2023-06-10T16:00:00Z',
    status: 'completed',
    format: 'pdf'
  }
];

export async function GET(req: NextRequest) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    // In a real application, these would be fetched from a database
    // Return mock reports for demonstration
    return NextResponse.json(mockReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const data = await req.json();
    const { type, format, timeRange } = data;
    
    if (!type || !format || !timeRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // In a real application, this would generate a report based on the provided parameters
    // and save it to a database or file storage
    
    // For demonstration, create a new mock report
    const reportTitle = `${
      type === 'bookings' ? 'Rezervasyon' :
      type === 'revenue' ? 'Gelir' :
      type === 'users' ? 'Kullanıcı' : 'İlan'
    } Raporu - ${
      timeRange === 'lastWeek' ? 'Son Hafta' :
      timeRange === 'lastMonth' ? 'Son Ay' :
      timeRange === 'lastQuarter' ? 'Son Çeyrek' : 'Son Yıl'
    }`;
    
    const newReport = {
      id: Date.now().toString(),
      type,
      title: reportTitle,
      createdAt: new Date().toISOString(),
      status: 'completed',
      format
    };
    
    return NextResponse.json(newReport);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 