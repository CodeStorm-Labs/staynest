import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listingImage } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

interface ListingImage {
  id: string;
  imagePath: string;
  isFeatured: string;
  sortOrder: string;
}

// Map of listing images by listing ID
const listingImagesMap: Record<string, ListingImage[]> = {};

// Function to generate dummy image data for a listing
function generateImagesForListing(listingId: string): ListingImage[] {
  // Return cached images if we already generated them
  if (listingImagesMap[listingId]) {
    return listingImagesMap[listingId];
  }

  // Define sets of images for different property types
  const apartmentImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop', // Living room
    'https://images.unsplash.com/photo-1630699144339-420f59b4747a?q=80&w=2070&auto=format&fit=crop', // Kitchen
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop', // Bedroom
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop', // Bathroom
    'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2070&auto=format&fit=crop'  // View
  ];
  
  const houseImages = [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop', // Exterior
    'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=1974&auto=format&fit=crop', // Living room
    'https://images.unsplash.com/photo-1574739782594-db4ead022697?q=80&w=1974&auto=format&fit=crop', // Kitchen
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop', // Bedroom
    'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1974&auto=format&fit=crop', // Bathroom
    'https://images.unsplash.com/photo-1560026301-88340cf16be7?q=80&w=1974&auto=format&fit=crop'    // Backyard
  ];
  
  const uniqueImages = [
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop', // Cappadocia cave house
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop', // Interior view
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1974&auto=format&fit=crop', // Window view
    'https://images.unsplash.com/photo-1528913775512-624d24b27b96?q=80&w=1974&auto=format&fit=crop', // Unique bathroom
    'https://images.unsplash.com/photo-1590073242678-70ee3fc28f17?q=80&w=1974&auto=format&fit=crop'  // Sunset view
  ];

  // Determine which set of images to use based on the last character of the listing ID
  // This is just a simple way to vary the images between listings
  const lastChar = listingId.slice(-1);
  let images;
  
  if ('01234'.includes(lastChar)) {
    images = apartmentImages;
  } else if ('56789'.includes(lastChar)) {
    images = houseImages;
  } else {
    images = uniqueImages;
  }
  
  // Additional image sets for specific locations
  const bodrumImages = [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop', // Bodrum marina
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2080&auto=format&fit=crop', // Villa pool
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop', // Bedroom
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop', // Sea view
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop'  // Terrace
  ];
  
  const cappadociaImages = [
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=2070&auto=format&fit=crop', // Balloons
    'https://images.unsplash.com/photo-1630335436162-4d3f5addc717?q=80&w=1949&auto=format&fit=crop', // Cave hotel
    'https://images.unsplash.com/photo-1609188944035-ae2b9be4e957?q=80&w=2070&auto=format&fit=crop', // Interior
    'https://images.unsplash.com/photo-1641845449405-b8bdd3b25a62?q=80&w=2028&auto=format&fit=crop', // Terrace
    'https://images.unsplash.com/photo-1648035747656-f6c6d007ca1d?q=80&w=2070&auto=format&fit=crop'  // View
  ];
  
  // Check if the listing ID contains specific location keywords and override images if so
  if (listingId.includes('bodrum') || listingId.includes('aeg')) {
    images = bodrumImages;
  } else if (listingId.includes('cappadocia') || listingId.includes('cave')) {
    images = cappadociaImages;
  }
  
  // Convert URLs to expected format
  const listingImages = images.map((url, index) => ({
    id: `${listingId}_img_${index}`,
    imagePath: url,
    isFeatured: index === 0 ? 'true' : 'false',
    sortOrder: index.toString()
  }));
  
  // Store in cache and return
  listingImagesMap[listingId] = listingImages;
  return listingImages;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    // Generate or retrieve cached images
    const images = generateImagesForListing(id);
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching listing images:', error);
    return NextResponse.json({ error: 'Failed to fetch listing images' }, { status: 500 });
  }
} 