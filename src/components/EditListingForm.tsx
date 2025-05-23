'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type FormState = {
  title: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  price: string;
  propertyType: string;
};

type Props = {
  initialData: FormState & { id: string };
};

export default function EditListingForm({ initialData }: Props) {
  const router = useRouter();
  const { locale } = useParams();
  const [form, setForm] = useState<FormState>({
    title: initialData.title,
    description: initialData.description,
    address: initialData.address,
    latitude: initialData.latitude,
    longitude: initialData.longitude,
    price: initialData.price,
    propertyType: initialData.propertyType,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update listing');
        setIsSubmitting(false);
        return;
      }
      router.push(`/${locale}/listings/${initialData.id}`);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">İlanı Düzenle</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block font-medium">Başlık</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Açıklama</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>
        <div>
          <label className="block font-medium">Adres</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Enlem</label>
            <input
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              required
              type="number"
              step="any"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Boylam</label>
            <input
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              required
              type="number"
              step="any"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div>
          <label className="block font-medium">Fiyat (gecelik)</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            type="number"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Mülk Türü</label>
          <select
            name="propertyType"
            value={form.propertyType}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="APARTMENT">Daire</option>
            <option value="HOUSE">Ev</option>
            <option value="UNIQUE">Özel</option>
            <option value="HOTEL">Otel</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isSubmitting ? 'Güncelleniyor...' : 'İlanı Güncelle'}
        </button>
      </form>
    </div>
  );
} 