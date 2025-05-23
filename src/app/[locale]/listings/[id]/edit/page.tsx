import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { listing } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import EditListingForm from '@/components/EditListingForm';

export default async function EditListingPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [item] = await db
    .select({
      id: listing.id,
      hostId: listing.hostId,
      title: listing.title,
      description: listing.description,
      address: listing.address,
      latitude: listing.latitude,
      longitude: listing.longitude,
      price: listing.price,
      propertyType: listing.propertyType,
    })
    .from(listing)
    .where(eq(listing.id, id));

  if (!item || item.hostId !== session.user.id) {
    notFound();
  }

  // Convert numeric fields to strings for the form
  const initialData = {
    id: item.id,
    title: item.title,
    description: item.description,
    address: item.address,
    latitude: item.latitude.toString(),
    longitude: item.longitude.toString(),
    price: item.price.toString(),
    propertyType: item.propertyType,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
      <EditListingForm initialData={initialData} />
    </div>
  );
} 