import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-utils';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const { reportId } = params;
    
    // In a real application, this would delete the report from the database
    // For demonstration, just return success message
    
    return NextResponse.json({ 
      message: 'Report deleted successfully',
      reportId
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 