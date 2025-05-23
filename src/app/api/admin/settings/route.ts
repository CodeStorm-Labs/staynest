import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-utils';

// Mock settings data for demonstration purposes
const mockSettings = {
  siteName: 'StayNest',
  contactEmail: 'info@staynest.com',
  supportPhone: '+90 555 123 4567',
  maintenanceMode: false,
  commissionRate: 5,
  currencySymbol: '₺',
  defaultLanguage: 'tr',
  termsLastUpdated: '2023-06-15',
  privacyLastUpdated: '2023-06-15',
  featuredListingsCount: 6
};

export async function GET(req: NextRequest) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    // In a real application, these would be fetched from a database
    // Return mock settings for demonstration
    return NextResponse.json(mockSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
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
    const updatedSettings = await req.json();
    
    // Validate required settings fields
    if (!updatedSettings.siteName || !updatedSettings.contactEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: Site name and contact email are required' 
      }, { status: 400 });
    }
    
    // In a real application, this would save the settings to a database
    // For demonstration, just return the updated settings
    
    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 