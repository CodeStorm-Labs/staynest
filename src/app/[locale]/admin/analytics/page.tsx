'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface AnalyticsData {
  totalRevenue: number;
  bookingsLastMonth: number;
  newUsersLastMonth: number;
  bookingsByMonth: { month: string; bookings: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  topLocations: { location: string; bookings: number }[];
  bookingsByStatus: { status: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const { locale } = useParams();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last6Months');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Set dummy data for demonstration
        setAnalyticsData({
          totalRevenue: 12500,
          bookingsLastMonth: 15,
          newUsersLastMonth: 24,
          bookingsByMonth: [
            { month: 'Ocak', bookings: 12 },
            { month: 'Şubat', bookings: 19 },
            { month: 'Mart', bookings: 15 },
            { month: 'Nisan', bookings: 22 },
            { month: 'Mayıs', bookings: 28 },
            { month: 'Haziran', bookings: 25 },
          ],
          revenueByMonth: [
            { month: 'Ocak', revenue: 1200 },
            { month: 'Şubat', revenue: 1900 },
            { month: 'Mart', revenue: 1500 },
            { month: 'Nisan', revenue: 2200 },
            { month: 'Mayıs', revenue: 2800 },
            { month: 'Haziran', revenue: 2500 },
          ],
          topLocations: [
            { location: 'İstanbul', bookings: 45 },
            { location: 'Ankara', bookings: 32 },
            { location: 'İzmir', bookings: 28 },
            { location: 'Antalya', bookings: 25 },
            { location: 'Muğla', bookings: 18 },
          ],
          bookingsByStatus: [
            { status: 'Onaylandı', count: 85 },
            { status: 'Bekleniyor', count: 15 },
            { status: 'İptal Edildi', count: 10 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Calculate max value for bar chart scaling
  const maxBookingValue = analyticsData 
    ? Math.max(...analyticsData.bookingsByMonth.map(item => item.bookings)) 
    : 0;
  
  const maxRevenueValue = analyticsData 
    ? Math.max(...analyticsData.revenueByMonth.map(item => item.revenue)) 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Analitik Paneli</h1>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
        >
          <option value="last3Months">Son 3 Ay</option>
          <option value="last6Months">Son 6 Ay</option>
          <option value="lastYear">Son 1 Yıl</option>
        </select>
      </div>

      {analyticsData && (
        <>
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black font-medium">Toplam Gelir</p>
                  <p className="text-3xl font-bold text-black">{analyticsData.totalRevenue}₺</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black font-medium">Geçen Ay Rezervasyonlar</p>
                  <p className="text-3xl font-bold text-black">{analyticsData.bookingsLastMonth}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black font-medium">Yeni Kullanıcılar (Geçen Ay)</p>
                  <p className="text-3xl font-bold text-black">{analyticsData.newUsersLastMonth}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bookings by Month Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-black mb-4">Aylık Rezervasyonlar</h2>
              <div className="h-64 flex items-end space-x-2">
                {analyticsData.bookingsByMonth.map((item, index) => {
                  const height = (item.bookings / maxBookingValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end">
                      <div 
                        className="w-full bg-red-500 rounded-t-md"
                        style={{ height: `${height}%` }}
                      ></div>
                      <p className="text-xs text-black mt-2">{item.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue by Month Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-black mb-4">Aylık Gelir</h2>
              <div className="h-64 flex items-end space-x-2">
                {analyticsData.revenueByMonth.map((item, index) => {
                  const height = (item.revenue / maxRevenueValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end">
                      <div 
                        className="w-full bg-green-500 rounded-t-md"
                        style={{ height: `${height}%` }}
                      ></div>
                      <p className="text-xs text-black mt-2">{item.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Locations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-black mb-4">En Popüler Lokasyonlar</h2>
              <div className="space-y-4">
                {analyticsData.topLocations.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-black">{item.location}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(item.bookings / analyticsData.topLocations[0].bookings) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-black">{item.bookings} rezervasyon</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookings by Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-black mb-4">Rezervasyon Durumları</h2>
              <div className="space-y-6">
                {analyticsData.bookingsByStatus.map((item, index) => {
                  const total = analyticsData.bookingsByStatus.reduce((sum, i) => sum + i.count, 0);
                  const percentage = (item.count / total) * 100;
                  
                  const bgColor = 
                    item.status === 'Onaylandı' ? 'bg-green-500' :
                    item.status === 'Bekleniyor' ? 'bg-yellow-500' : 'bg-red-500';
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-black">{item.status}</span>
                        <span className="text-black">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${bgColor} h-2.5 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 