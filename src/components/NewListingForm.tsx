'use client';

import { FormEvent, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { debounce } from 'lodash';
import LocationPicker from './LocationPicker';

type FormState = {
  title: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  price: string;
  propertyType: string;
};

const propertyTypeOptions = [
  { value: 'APARTMENT', label: 'Daire', icon: '🏢' },
  { value: 'HOUSE', label: 'Ev', icon: '🏠' },
  { value: 'UNIQUE', label: 'Özel', icon: '🏰' },
  { value: 'HOTEL', label: 'Otel', icon: '🏨' },
];

export default function NewListingForm() {
  const router = useRouter();
  const { locale } = useParams();
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    price: '',
    propertyType: 'APARTMENT',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle location changes from the LocationPicker
  const handleLocationChange = useCallback((latitude: number, longitude: number, address: string) => {
    setForm(prev => {
      // Check if values actually changed to prevent unnecessary re-renders from this callback
      const newLatitude = latitude.toString();
      const newLongitude = longitude.toString();
      const newAddress = address || prev.address;

      if (prev.latitude === newLatitude && 
          prev.longitude === newLongitude &&
          prev.address === newAddress) {
        return prev;
      }
      return {
        ...prev,
        latitude: newLatitude,
        longitude: newLongitude,
        address: newAddress,
      };
    });
  }, [setForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to 5 images
      if (images.length + selectedFiles.length > 5) {
        setError('En fazla 5 resim yükleyebilirsiniz.');
        return;
      }
      
      // Preview images
      const newImageUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...newImageUrls]);
      setImages([...images, ...selectedFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (images.length === 0) {
      setError('Lütfen en az bir resim yükleyin.');
      setIsSubmitting(false);
      return;
    }

    if (!form.latitude || !form.longitude) {
      setError('Lütfen haritadan konum seçin.');
      setIsSubmitting(false);
      return;
    }

    try {
      // First, create the listing
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'İlan oluşturulurken bir hata oluştu');
        setIsSubmitting(false);
        return;
      }

      // Then upload images
      const formData = new FormData();
      formData.append('listingId', data.id);
      images.forEach(image => {
        formData.append('images', image);
      });

      const imageResponse = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const imageData = await imageResponse.json();
      
      if (!imageResponse.ok) {
        setError(imageData.error || 'Resimler yüklenirken bir hata oluştu');
        setIsSubmitting(false);
        return;
      }

      setSuccess('İlan başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push(`/${locale}/listings/${data.id}`);
      }, 1500);
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="md:w-7/12 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni İlan Oluştur</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Örn: Deniz Manzaralı Lüks Daire"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Konutunuzun detaylarını açıklayın..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
              />
            </div>
            
            {/* Image upload section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fotoğraflar</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Fotoğraf Yükle</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">veya sürükle ve bırak</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF maks. 10MB (en fazla 5 resim)</p>
                </div>
              </div>
              
              {/* Image preview */}
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={url}
                          alt={`Preview ${index}`}
                          width={200}
                          height={200}
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600 focus:outline-none"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Location section with map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
              <LocationPicker 
                initialLatitude={form.latitude ? parseFloat(form.latitude) : undefined}
                initialLongitude={form.longitude ? parseFloat(form.longitude) : undefined}
                initialAddress={form.address}
                onLocationChange={handleLocationChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (gecelik)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₺</span>
                </div>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  type="number"
                  min="0"
                  placeholder="Gecelik fiyat"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konut Tipi</label>
              <div className="grid grid-cols-3 gap-3">
                {propertyTypeOptions.map((option) => (
                  <label 
                    key={option.value}
                    className={`
                      flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                      ${form.propertyType === option.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={option.value}
                      checked={form.propertyType === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İlan Oluşturuluyor...
                </span>
              ) : (
                'İlan Oluştur'
              )}
            </button>
          </form>
        </div>
        
        {/* Right side - Image and Tips */}
        <div className="md:w-5/12 bg-blue-50 p-8 flex flex-col">
          <div className="mb-6 relative h-48 rounded-lg overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
              alt="Add your property"
              fill
              className="object-cover"
            />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4">İpuçları</h3>
          
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Dikkat çekici bir başlık ve detaylı açıklama daha fazla kişiye ulaşmanızı sağlar.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Yüksek kaliteli, doğal ışıkta çekilmiş fotoğraflar daha çok ilgi çeker.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Doğru konum bilgisi, misafirlerin beklentilerini karşılamak için önemlidir.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Fiyatı belirlerken bölgenizdeki benzer ilanları inceleyebilirsiniz.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 