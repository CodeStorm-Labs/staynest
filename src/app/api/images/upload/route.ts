import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { db } from '@/db';
import { listing, listingImage } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Create a schema for listing images if we need to store them in the database
// Import the schema if it already exists

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const listingId = formData.get('listingId') as string;
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const images = formData.getAll('images') as File[];
    
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images uploaded' }, { status: 400 });
    }

    // Check if the user owns this listing
    const listings = await db.select().from(listing).where(eq(listing.id, listingId)).limit(1);
    if (!listings.length || listings[0].hostId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create directory for the images if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', listingId);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const savedImagePaths: string[] = [];
    const now = new Date();

    // Process and save each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const buffer = Buffer.from(await image.arrayBuffer());
      const uniqueId = uuid();
      const fileExtension = image.name.split('.').pop() || 'jpg';
      const fileName = `${uniqueId}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save the file
      fs.writeFileSync(filePath, buffer);
      
      // Save path relative to public folder
      const publicPath = `/uploads/${listingId}/${fileName}`;
      savedImagePaths.push(publicPath);
      
      // Set the first image as featured by default
      const isFeatured = i === 0 ? 'true' : 'false';
      
      // Store in database with the listingImage schema
      await db.insert(listingImage).values({
        id: uuid(),
        listingId,
        imagePath: publicPath,
        isFeatured,
        sortOrder: i.toString(),
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Images uploaded successfully', 
      imagePaths: savedImagePaths 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ 
      error: 'Failed to upload images', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 