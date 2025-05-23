import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { listing } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, description, address, latitude, longitude, price, propertyType } = await req.json();
  if (!title || !description || !address || latitude == null || longitude == null || price == null || !propertyType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const [existing] = await db.select().from(listing).where(eq(listing.id, id));
  if (!existing || existing.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  await db.update(listing).set({
    title,
    description,
    address,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    price: parseInt(price, 10),
    propertyType,
    updatedAt: new Date(),
  }).where(eq(listing.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [existing] = await db.select().from(listing).where(eq(listing.id, id));
  if (!existing || existing.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  await db.delete(listing).where(eq(listing.id, id));
  return NextResponse.json({ success: true });
} 