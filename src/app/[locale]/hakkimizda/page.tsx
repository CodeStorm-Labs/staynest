import FooterSection from '@/components/footer';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hakkımızda - StayNest',
  description: 'StayNest hakkında bilgi edinin. Misyonumuz, vizyonumuz ve değerlerimiz.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-20">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('/images/pattern-bg.png')] bg-repeat"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Hakkımızda</h1>
            <p className="text-xl opacity-90">
              Türkiye'nin en iyi konaklama deneyimini sunmak için buradayız.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Hikayemiz</h2>
              <p className="text-white mb-4">
                StayNest, 2020 yılında Türkiye'nin eşsiz kültürel zenginliğini ve misafirperverliğini dünyaya tanıtmak amacıyla kuruldu. Kuruluş amacımız, turistlere otantik Türk misafirperverliğini deneyimleme fırsatı sunarken, ev sahiplerine de ek gelir elde etme imkanı sağlamaktı.
              </p>
              <p className="text-white mb-4">
                İstanbul'da küçük bir ekiple başlayan yolculuğumuz, bugün Türkiye'nin dört bir yanında binlerce konaklama seçeneğiyle büyümeye devam ediyor. StayNest olarak amacımız, misafirlerimizin kendilerini evlerinde hissedecekleri, benzersiz konaklama deneyimleri sunmaktır.
              </p>
              <p className="text-white">
                Platformumuzdaki her ev, titizlikle seçilmiş ve kontrol edilmiştir. Misafirlerimizin güvenliği ve memnuniyeti bizim için en önemli önceliktir.
              </p>
            </div>

            {/* Mission and Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">Misyonumuz</h3>
                <p className="text-black">
                  Türkiye'nin kültürel zenginliğini ve misafirperverliğini yansıtan, güvenli, konforlu ve unutulmaz konaklama deneyimleri sunmak. Ev sahiplerinin ekonomik olarak güçlenmesine katkı sağlarken, misafirlerimize yerel yaşamı deneyimleme fırsatı vermek.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">Vizyonumuz</h3>
                <p className="text-black">
                  Türkiye'nin lider konaklama platformu olarak, seyahat deneyimini kişiselleştiren, yerel kültürleri keşfetmeyi teşvik eden ve sürdürülebilir turizme katkıda bulunan bir ekosistem oluşturmak.
                </p>
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-10 text-center">Ekibimiz</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Team Member 1 */}
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image 
                      src="https://i.pravatar.cc/300?img=12" 
                      alt="Ali Yılmaz" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Ali Yılmaz</h3>
                  <p className="text-blue-600">Kurucu & CEO</p>
                </div>
                
                {/* Team Member 2 */}
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image 
                      src="https://i.pravatar.cc/300?img=20" 
                      alt="Ayşe Demir" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Ayşe Demir</h3>
                  <p className="text-blue-600">Operasyon Direktörü</p>
                </div>
                
                {/* Team Member 3 */}
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image 
                      src="https://i.pravatar.cc/300?img=33" 
                      alt="Mehmet Kaya" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Mehmet Kaya</h3>
                  <p className="text-blue-600">Teknik Direktör</p>
                </div>
              </div>
            </div>

            {/* Values */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Değerlerimiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Güven</h3>
                    <p className="text-white">Hem misafirlerimiz hem de ev sahiplerimiz için güvenli bir platform sunmayı taahhüt ediyoruz.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Yenilikçilik</h3>
                    <p className="text-white">Sürekli olarak seyahat ve konaklama deneyimini iyileştirmek için yenilikçi çözümler geliştiriyoruz.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sorumluluk</h3>
                    <p className="text-white">Topluma ve çevreye karşı sorumluluklarımızın bilincinde olarak sürdürülebilir turizmi destekliyoruz.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Kapsayıcılık</h3>
                    <p className="text-white">Tüm misafirlerimiz ve ev sahiplerimiz için eşit fırsatlar sunmayı ve çeşitliliği desteklemeyi önemsiyoruz.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Bize Katılın</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Evinizi StayNest'te listeleyerek siz de bu büyüyen ailenin bir parçası olun ve misafirperverliğinizi paylaşın.
          </p>
          <Link href="/tr/listings/new" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Hemen İlan Verin
          </Link>
        </div>
      </section>

      {/* Footer */}
      <FooterSection />
    </main>
  );
} 