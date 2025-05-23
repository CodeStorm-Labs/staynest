import HomeHero from '@/components/HomeHero';
import FeaturedListings from '@/components/FeaturedListings';
import FooterSection from '@/components/footer';
import Link from 'next/link';
import { ChevronRight, HomeIcon, Star, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="pt-0">
      {/* Hero Banner */}
      <HomeHero />
      
      {/* Featured Listings Section */}
      <FeaturedListings />
      
      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Neden StayNest?</h2>
            <p className="text-black max-w-2xl mx-auto">Güvenilir ve kaliteli tatil deneyimi için doğru adres</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <HomeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Seçkin Konaklama</h3>
              <p className="text-black">Türkiye'nin dört bir yanında özenle seçilmiş, üstün kalite standartlarına uygun benzersiz konaklama seçenekleri.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Doğrulanmış Değerlendirmeler</h3>
              <p className="text-black">Gerçek misafirlerin deneyimlerine dayanan şeffaf ve güvenilir değerlendirme sistemi.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Güvenli Ödeme</h3>
              <p className="text-black">Güvenli ödeme sistemi ile rezervasyonunuzu kolayca yapın, konaklama süresince 7/24 müşteri desteğinden yararlanın.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Evinizi Kiraya Verin, Kazanmaya Başlayın</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Kullanmadığınız odanızı veya evinizi kiralayarak ek gelir elde edin. Birkaç dakika içinde ilanınızı oluşturun.</p>
          <Link 
            href="/tr/listings/new" 
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Hemen İlan Verin
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
}
