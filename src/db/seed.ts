import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './index';
import { listing, propertyType, booking } from './schema';
import { user, userTier, userRole, account } from './schema/auth-schema';
import { v4 as uuid } from 'uuid';
import { sql } from 'drizzle-orm';
import { hash } from 'bcrypt';

async function main() {
  console.log('Seeding database...');

  // Clear previous seed data
  await db.execute(sql`TRUNCATE TABLE listing, "user", account, booking RESTART IDENTITY CASCADE`);

  // Create regular user for bookings
  const regularUserId = uuid();
  await db.insert(user).values({
    id: regularUserId,
    name: 'Regular User',
    email: 'user@example.com',
    emailVerified: true,
    tier: 'free',
    role: 'user',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Add account for regular user
  const userPasswordHash = await hash('user123', 10);
  await db.insert(account).values({
    id: uuid(),
    userId: regularUserId,
    providerId: 'credentials',
    accountId: 'user@example.com',
    password: userPasswordHash,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const hostId = uuid();
  await db.insert(user).values({
    id: hostId,
    name: 'Host User',
    email: 'host@example.com',
    emailVerified: true,
    tier: 'free',
    role: 'user',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create a second host
  const secondHostId = uuid();
  await db.insert(user).values({
    id: secondHostId,
    name: 'Premium Host',
    email: 'premium@example.com',
    emailVerified: true,
    tier: 'pro',
    role: 'user',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Create an admin user
  const adminId = uuid();
  await db.insert(user).values({
    id: adminId,
    name: 'Admin User',
    email: 'admin@example.com',
    emailVerified: true,
    tier: 'pro',
    role: 'admin',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Add account with login credentials for admin user
  const passwordHash = await hash('admin123', 10);
  await db.insert(account).values({
    id: uuid(),
    userId: adminId,
    providerId: 'credentials',
    accountId: 'admin@example.com',
    password: passwordHash,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Add account with login credentials for host user
  const hostPasswordHash = await hash('host123', 10);
  await db.insert(account).values({
    id: uuid(),
    userId: hostId,
    providerId: 'credentials',
    accountId: 'host@example.com',
    password: hostPasswordHash,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const listingsData = [
    // Original listings
    {
      id: uuid(),
      hostId,
      title: 'İstanbul\'da Şirin Daire',
      description: 'Taksim meydanına yakın, tüm olanaklara sahip rahat bir daire. Bu güzel apartman dairesi modern bir mutfak, geniş bir oturma odası içerir ve toplu taşıma, restoranlar ve alışveriş merkezlerine yürüme mesafesindedir. İstanbul\'u keşfetmek isteyen tek başına seyahat edenler veya çiftler için mükemmel.',
      address: 'Taksim, Istanbul, Turkey',
      latitude: 41.0369,
      longitude: 28.9860,
      price: 120,
      propertyType: 'APARTMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'Deniz Manzaralı Villa',
      description: 'Boğaz\'a bakan lüks villa. Özel terastan muhteşem gün doğumu ve gün batımı manzaralarının tadını çıkarın. Bu 3 yatak odalı villa, tam donanımlı bir mutfak, geniş bir oturma alanı ve suya doğrudan erişim imkanı sunuyor. Eğlence için mükemmel olan özel havuz ve bahçe alanı içerir.',
      address: 'Bebek, Istanbul, Turkey',
      latitude: 41.0636,
      longitude: 29.0336,
      price: 350,
      propertyType: 'HOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    
    // New listings
    {
      id: uuid(),
      hostId: secondHostId,
      title: 'Karaköy\'de Bohem Loft',
      description: 'Trendy Karaköy bölgesindeki bu şık lofttan İstanbul\'u deneyimleyin. Daire, açık tuğla duvarlar, yüksek tavanlar ve modern mobilyalar içerir. Büyük pencereler, bol miktarda doğal ışık ve tarihi semtin manzaralarını sunar. Galata Kulesi, İstanbul Modern ve sayısız kafe ve galeriye yürüme mesafesindedir.',
      address: 'Karaköy, Istanbul, Turkey',
      latitude: 41.0232,
      longitude: 28.9773,
      price: 180,
      propertyType: 'APARTMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'Kapadokya Mağara Süiti',
      description: 'Bu otantik mağara süitinde Kapadokya\'nın büyüsünü yaşayın. Doğal kaya oluşumlarına oyulmuş olan bu benzersiz konaklama, bölgenin geleneksel mimarisini korurken modern olanaklar sunmaktadır. Süit, peri bacaları ve gün doğumunda sıcak hava balonlarının panoramik manzarasına sahip özel bir teras içerir.',
      address: 'Göreme, Nevşehir, Turkey',
      latitude: 38.6431,
      longitude: 34.8283,
      price: 240,
      propertyType: 'UNIQUE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId: secondHostId,
      title: 'Akdeniz\'de Sahil Kenarı Villa',
      description: 'Türk Rivierası\'ndaki bu lüks sahil villasına kaçın. Özel bir plaja doğrudan erişimi olan bu 4 yatak odalı mülk, yüzme havuzu, bahçe ve açık yemek alanı içerir. İç mekan, tam donanımlı bir mutfak, geniş yaşam alanları ve her odadan deniz manzarası ile zarif bir şekilde döşenmiştir.',
      address: 'Kalkan, Antalya, Turkey',
      latitude: 36.2654,
      longitude: 29.4097,
      price: 420,
      propertyType: 'HOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'Alaçatı\'da Tarihi Konak',
      description: 'Şirin Alaçatı kasabasında güzelce restore edilmiş bir taş evde kalın. Bu 3 yatak odalı mülk, geleneksel mimariyi modern konfora sahiptir. Zeytin ağaçlı avlu bahçesi, çatı terası ve şık iç mekanlar dahil özellikler içerir. Alaçatı\'nın ünlü butikleri, restoranları ve rüzgar sörfü plajlarına kısa bir yürüyüş mesafesinde yer alır.',
      address: 'Alaçatı, İzmir, Turkey',
      latitude: 38.2780,
      longitude: 26.3753,
      price: 290,
      propertyType: 'HOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId: secondHostId,
      title: 'Boğaz Manzaralı Lüks Daire',
      description: 'Boğaz\'ın nefes kesen manzarasına sahip bu premium daireden İstanbul\'u şık bir şekilde deneyimleyin. Mülk, tavandan tabana kadar uzanan pencereler, yüksek kaliteli mobilyalar ve panoramik su manzarasının tadını çıkarmak için mükemmel geniş bir balkon içerir. Bina, spor salonu, sauna ve 24 saat güvenlik sunmaktadır.',
      address: 'Ortaköy, Istanbul, Turkey',
      latitude: 41.0474,
      longitude: 29.0277,
      price: 380,
      propertyType: 'APARTMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'Ege\'de Zeytin Bahçeli Sakin Ev',
      description: 'Ege kıyısındaki kadim zeytin ağaçları arasında yer alan bu huzurlu eve kaçın. Bu gizli sığınak, rustik cazibe ve modern konforu mükemmel bir şekilde harmanlar. Özellikler arasında özel havuz, açık mutfak ve kırsal ve deniz manzarasının panoramik görünümü yer alır. Güzel plajlara ve yerel köylere sadece 10 dakikalık sürüş mesafesindedir.',
      address: 'Datça, Muğla, Turkey',
      latitude: 36.7276,
      longitude: 27.6724,
      price: 260,
      propertyType: 'HOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId: secondHostId,
      title: 'Nişantaşı\'nda Tasarım Çatı Katı',
      description: 'İstanbul\'un şık Nişantaşı semtindeki bu mimari açıdan çarpıcı çatı katında kalın. Daire, minimalist tasarım, premium mobilyalar ve şehir manzaralı geniş bir terasa sahiptir. İstanbul\'un moda ve tasarım merkezinin kalbinde, lüks butikler, gurme restoranlar ve sanat galerileri ile çevrilidir.',
      address: 'Nişantaşı, Istanbul, Turkey',
      latitude: 41.0476,
      longitude: 28.9872,
      price: 450,
      propertyType: 'APARTMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'Karadeniz Dağ Evi',
      description: 'Türkiye\'nin Karadeniz bölgesinin doğal güzelliğini bu şirin ahşap kabinde yaşayın. Yemyeşil ormanlar ve dağ dereleri ile çevrili olan bu inziva yeri, şehir hayatından huzurlu bir kaçış sunuyor. Kabin, odun yakan bir şömine, tam donanımlı bir mutfak ve sisli dağ manzaralarının tadını çıkarmak için mükemmel olan çevreleyen veranda içerir.',
      address: 'Ayder, Rize, Turkey',
      latitude: 40.9542,
      longitude: 41.0953,
      price: 210,
      propertyType: 'UNIQUE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId: secondHostId,
      title: 'Mardin\'de Osmanlı Konağı',
      description: 'Tarihi Mardin\'deki bu özenle restore edilmiş Osmanlı konağında zamanda yolculuğa çıkın. Bölgenin karakteristik altın kireç taşından inşa edilmiş olan bu mülk, geleneksel kemerli kapılar, iç avlular ve Mezopotamya ovalarını gören teraslar içerir. İç mekanlar, otantik mimariyi zarif modern olanaklarla birleştirir.',
      address: 'Mardin, Turkey',
      latitude: 37.3126,
      longitude: 40.7349,
      price: 320,
      propertyType: 'UNIQUE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'Bodrum\'da Sonsuzluk Havuzlu Modern Villa',
      description: 'Muhteşem deniz manzaralı bu çağdaş villada Ege yaşam tarzının tadını çıkarın. Mülk, temiz çizgiler, aydınlık açık alanlar ve iç ve dış mekan yaşamı arasındaki çizgiyi bulanıklaştıran tavandan tabana pencereler içerir. Öne çıkan özellikler arasında denizle birleşiyor gibi görünen sonsuzluk havuzu, Akdeniz bitkileri ile dolu bir bahçe ve yemek ve dinlenmek için birden fazla teras bulunmaktadır.',
      address: 'Bodrum, Muğla, Turkey',
      latitude: 37.0344,
      longitude: 27.4305,
      price: 490,
      propertyType: 'HOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId: secondHostId,
      title: 'Çeşme\'de Yenilenmiş Balıkçı Evi',
      description: 'Ege Denizi\'nin masmavi sularına sadece birkaç adım mesafedeki bu şirin balıkçı evinde kalın. Geleneksel karakteri modern konforla birleştirmek için yakın zamanda yenilenen bu ev, beyaza boyanmış duvarlar, mavi kepenkler ve begonvillerle kaplı bir terasa sahiptir. Deniz kenarında romantik bir kaçamak arayan çiftler için mükemmel.',
      address: 'Çeşme, İzmir, Turkey',
      latitude: 38.3265,
      longitude: 26.3076,
      price: 230,
      propertyType: 'HOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      hostId,
      title: 'İstanbul Boğazı Manzaralı Lüks Otel',
      description: 'İstanbul\'un merkezinde, Boğaz\'ın muhteşem manzarasına sahip, tam donanımlı 5 yıldızlı otel. Özel spa, restoran, spor salonu ve oda servisi mevcuttur. Her odada klima, minibar ve ücretsiz WiFi bulunmaktadır.',
      address: 'Beşiktaş, İstanbul, Turkey',
      latitude: 41.0420,
      longitude: 29.0067,
      price: 850,
      propertyType: 'HOTEL',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  // Define listing IDs for reference
  const listingIds: string[] = [];

  // Insert all listings and store their IDs for bookings
  for (const listingData of listingsData) {
    const listingId = listingData.id;
    listingIds.push(listingId);
    await db.insert(listing).values({
      ...listingData,
      propertyType: listingData.propertyType as 'APARTMENT' | 'HOUSE' | 'UNIQUE' | 'HOTEL'
    });
  }

  // Add some sample bookings
  const bookingsData = [
    {
      id: uuid(),
      listingId: listingIds[0], // First listing
      userId: regularUserId,
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      guests: 2,
      totalPrice: 120 * 3, // 3 nights at listing price
      status: 'CONFIRMED' as 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      listingId: listingIds[1], // Second listing
      userId: regularUserId,
      checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      checkOut: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      guests: 4,
      totalPrice: 350 * 7, // 7 nights at listing price
      status: 'PENDING' as 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      listingId: listingIds[2], // Third listing
      userId: regularUserId,
      checkIn: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      checkOut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      guests: 2,
      totalPrice: 180 * 5, // 5 nights at listing price
      status: 'CANCELLED' as 'CANCELLED',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }
  ];

  // Insert bookings
  for (const bookingData of bookingsData) {
    await db.insert(booking).values(bookingData);
  }

  console.log('Database seeded successfully.');
}

main().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
}); 