'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Report {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  status: string;
  format: string;
}

export default function AdminReportsPage() {
  const { locale } = useParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('bookings');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [timeRange, setTimeRange] = useState('lastMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  // Sample reports data
  const sampleReports = [
    {
      id: '1',
      type: 'bookings',
      title: 'Aylık Rezervasyon Raporu - Temmuz 2023',
      createdAt: '2023-08-01T10:30:00Z',
      status: 'completed',
      format: 'pdf'
    },
    {
      id: '2',
      type: 'revenue',
      title: 'Gelir Raporu - Q2 2023',
      createdAt: '2023-07-05T14:20:00Z',
      status: 'completed',
      format: 'excel'
    },
    {
      id: '3',
      type: 'users',
      title: 'Yeni Kullanıcı Raporu - Haziran 2023',
      createdAt: '2023-07-01T09:15:00Z',
      status: 'completed',
      format: 'pdf'
    },
    {
      id: '4',
      type: 'listings',
      title: 'İlan Aktivite Raporu - Son 3 Ay',
      createdAt: '2023-06-15T11:45:00Z',
      status: 'completed',
      format: 'csv'
    },
    {
      id: '5',
      type: 'bookings',
      title: 'İptal Edilen Rezervasyonlar - 2023',
      createdAt: '2023-06-10T16:00:00Z',
      status: 'completed',
      format: 'pdf'
    }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch from API
        // const response = await fetch('/api/admin/reports', {
        //   credentials: 'include',
        // });
        
        // if (!response.ok) {
        //   throw new Error(`API error: ${response.status}`);
        // }
        
        // const data = await response.json();
        // setReports(data);

        // Using sample data for demonstration
        setTimeout(() => {
          setReports(sampleReports);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Generate new report
  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      // In a real application, you would call an API endpoint
      // const response = await fetch('/api/admin/reports/generate', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     type: reportType,
      //     format: reportFormat,
      //     timeRange: timeRange
      //   }),
      //   credentials: 'include'
      // });
      
      // if (!response.ok) {
      //   throw new Error(`API error: ${response.status}`);
      // }
      
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a new report object
      const reportTitle = `${
        reportType === 'bookings' ? 'Rezervasyon' :
        reportType === 'revenue' ? 'Gelir' :
        reportType === 'users' ? 'Kullanıcı' : 'İlan'
      } Raporu - ${
        timeRange === 'lastWeek' ? 'Son Hafta' :
        timeRange === 'lastMonth' ? 'Son Ay' :
        timeRange === 'lastQuarter' ? 'Son Çeyrek' : 'Son Yıl'
      }`;
      
      const newReport = {
        id: Date.now().toString(),
        type: reportType,
        title: reportTitle,
        createdAt: new Date().toISOString(),
        status: 'completed',
        format: reportFormat
      };
      
      setReports([newReport, ...reports]);
      
      alert('Rapor başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setGenerating(false);
    }
  };

  // Filter and search reports
  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Download report
  const handleDownloadReport = (report: Report) => {
    // In a real application, you would call an API endpoint or redirect to a download URL
    // window.location.href = `/api/admin/reports/download/${report.id}`;
    alert(`Rapor indiriliyor: ${report.title}`);
  };

  // Delete report
  const handleDeleteReport = (reportId: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return;
    }

    // In a real application, you would call an API endpoint
    // const deleteReport = async () => {
    //   try {
    //     const response = await fetch(`/api/admin/reports/${reportId}`, {
    //       method: 'DELETE',
    //       credentials: 'include'
    //     });
        
    //     if (!response.ok) {
    //       throw new Error(`API error: ${response.status}`);
    //     }
        
    //     setReports(reports.filter(report => report.id !== reportId));
    //   } catch (error) {
    //     console.error('Failed to delete report:', error);
    //     alert('Rapor silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    //   }
    // };
    
    // deleteReport();
    
    // Simulate API call
    setReports(reports.filter(report => report.id !== reportId));
  };

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
        <h1 className="text-3xl font-bold text-black">Rapor Yönetimi</h1>
      </div>
      
      {/* Generate Report Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-black mb-4">Yeni Rapor Oluştur</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-black mb-1">
              Rapor Tipi
            </label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
            >
              <option value="bookings">Rezervasyonlar</option>
              <option value="revenue">Gelir</option>
              <option value="users">Kullanıcılar</option>
              <option value="listings">İlanlar</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="report-format" className="block text-sm font-medium text-black mb-1">
              Dosya Formatı
            </label>
            <select
              id="report-format"
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="time-range" className="block text-sm font-medium text-black mb-1">
              Zaman Aralığı
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
            >
              <option value="lastWeek">Son Hafta</option>
              <option value="lastMonth">Son Ay</option>
              <option value="lastQuarter">Son Çeyrek</option>
              <option value="lastYear">Son Yıl</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-red-600 text-white rounded-lg px-4 py-2 font-medium w-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </span>
              ) : 'Rapor Oluştur'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Reports List */}
      <div className="mb-6">
        {/* Search input */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Raporları ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-black"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Rapor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Oluşturulma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReports.length > 0 ? (
                  currentReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-black">{report.title}</div>
                        <div className="text-sm text-black">
                          {report.type === 'bookings' ? 'Rezervasyon Raporu' :
                           report.type === 'revenue' ? 'Gelir Raporu' :
                           report.type === 'users' ? 'Kullanıcı Raporu' : 'İlan Raporu'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {report.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'completed' ? 'bg-green-100 text-green-800' :
                          report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.status === 'completed' ? 'Tamamlandı' :
                           report.status === 'processing' ? 'İşleniyor' :
                           'Başarısız'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {report.status === 'completed' && (
                            <button
                              onClick={() => handleDownloadReport(report)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              İndir
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-black">
                      Rapor bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredReports.length > reportsPerPage && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-black">
                  <span className="font-medium">{indexOfFirstReport + 1}</span> - 
                  <span className="font-medium">
                    {Math.min(indexOfLastReport, filteredReports.length)}
                  </span> / 
                  <span className="font-medium">{filteredReports.length}</span> rapor
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 