'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';

interface SiteSettings {
  siteName: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  commissionRate: number;
  currencySymbol: string;
  defaultLanguage: string;
  termsLastUpdated: string;
  privacyLastUpdated: string;
  featuredListingsCount: number;
  themeColor: string;
  themeMode: string;
}

export default function AdminSettingsPage() {
  const { locale } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'StayNest',
    contactEmail: 'info@staynest.com',
    supportPhone: '+90 555 123 4567',
    maintenanceMode: false,
    commissionRate: 5,
    currencySymbol: '₺',
    defaultLanguage: 'tr',
    termsLastUpdated: '2023-06-15',
    privacyLastUpdated: '2023-06-15',
    featuredListingsCount: 6,
    themeColor: 'red',
    themeMode: 'standard'
  });
  
  const [originalSettings, setOriginalSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch from API
        // const response = await fetch('/api/admin/settings', {
        //   credentials: 'include',
        // });
        
        // if (!response.ok) {
        //   throw new Error(`API error: ${response.status}`);
        // }
        
        // const data = await response.json();
        // setSettings(data);
        // setOriginalSettings(data);

        // Using sample data for demonstration
        setTimeout(() => {
          // Make sure we keep the current settings, including themeColor and themeMode
          const currentSettings = {...settings};
          setOriginalSettings(currentSettings);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    });
  };

  // Function to apply theme settings
  const applyThemeSettings = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply theme color
      switch(settings.themeColor) {
        case 'red':
          root.style.setProperty('--primary-color', '#ef4444');
          break;
        case 'blue':
          root.style.setProperty('--primary-color', '#3b82f6');
          break;
        case 'green':
          root.style.setProperty('--primary-color', '#10b981');
          break;
        case 'purple':
          root.style.setProperty('--primary-color', '#8b5cf6');
          break;
        default:
          root.style.setProperty('--primary-color', '#ef4444');
      }
      
      // Apply theme mode
      switch(settings.themeMode) {
        case 'standard':
          root.style.setProperty('--bg-color', '#ffffff');
          root.style.setProperty('--text-color', '#000000');
          root.classList.remove('dark-theme', 'blue-theme');
          break;
        case 'dark':
          root.style.setProperty('--bg-color', '#0f172a');
          root.style.setProperty('--text-color', '#ffffff');
          root.classList.add('dark-theme');
          root.classList.remove('blue-theme');
          break;
        case 'blue':
          root.style.setProperty('--bg-color', '#f0f9ff');
          root.style.setProperty('--text-color', '#0c4a6e');
          root.classList.add('blue-theme');
          root.classList.remove('dark-theme');
          break;
        default:
          root.style.setProperty('--bg-color', '#ffffff');
          root.style.setProperty('--text-color', '#000000');
          root.classList.remove('dark-theme', 'blue-theme');
      }
      
      // Apply CSS helper classes
      const buttons = document.querySelectorAll('.theme-button');
      buttons.forEach(button => {
        (button as HTMLElement).style.backgroundColor = 'var(--primary-color)';
      });
    }
  };

  // Initialize theme settings when component mounts
  useEffect(() => {
    if (!loading) {
      applyThemeSettings();
    }

    // Add CSS variables to document
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        :root {
          --primary-color: ${settings.themeColor === 'red' ? '#ef4444' : 
                          settings.themeColor === 'blue' ? '#3b82f6' : 
                          settings.themeColor === 'green' ? '#10b981' : 
                          settings.themeColor === 'purple' ? '#8b5cf6' : '#ef4444'};
          --bg-color: ${settings.themeMode === 'standard' ? '#ffffff' : 
                      settings.themeMode === 'dark' ? '#0f172a' : 
                      settings.themeMode === 'blue' ? '#f0f9ff' : '#ffffff'};
          --text-color: ${settings.themeMode === 'standard' ? '#000000' : 
                        settings.themeMode === 'dark' ? '#ffffff' : 
                        settings.themeMode === 'blue' ? '#0c4a6e' : '#000000'};
        }
      `;
      document.head.appendChild(style);
    }
  }, [loading]);

  // Update CSS variables when theme changes
  useEffect(() => {
    if (!loading) {
      applyThemeSettings();
    }
  }, [settings.themeColor, settings.themeMode]);

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // In a real application, you would call an API endpoint
      // const response = await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(settings),
      //   credentials: 'include'
      // });
      
      // if (!response.ok) {
      //   throw new Error(`API error: ${response.status}`);
      // }
      
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOriginalSettings({...settings});
      // Show success message instead of alert
      setShowSuccessMessage(true);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      // Apply theme settings
      applyThemeSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (originalSettings) {
      setSettings({...originalSettings});
    }
  };

  const hasChanges = originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleThemeModeSelect = (mode: string) => {
    setSettings({
      ...settings,
      themeMode: mode
    });
  };
  
  const handleColorSelect = (color: string) => {
    setSettings({
      ...settings,
      themeColor: color
    });
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
        <h1 className="text-3xl font-bold text-black">Sistem Ayarları</h1>
        
        <div className="flex space-x-3">
          {hasChanges && (
            <button
              onClick={handleResetSettings}
              className="border border-gray-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-gray-50 transition-colors"
            >
              Değişiklikleri İptal Et
            </button>
          )}
          
          <button
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges}
            className="theme-button text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            style={{ 
              backgroundColor: 'var(--primary-color)',
              opacity: (!hasChanges || saving) ? 0.5 : 1,
              cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </span>
            ) : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>
      
      {/* Success message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span className="block sm:inline">Ayarlar başarıyla kaydedildi!</span>
        </div>
      )}

      {/* Live preview of theme */}
      <div className="mb-6 p-4 border rounded-xl" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="text-center mb-3">
          <h3 className="font-bold">Tema Önizleme</h3>
        </div>
        <div className="flex justify-center space-x-4">
          <button className="px-3 py-2 rounded-lg text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
            Örnek Buton
          </button>
          <div className="h-10 w-10 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}></div>
          <div className="border-2 rounded p-2" style={{ borderColor: 'var(--primary-color)' }}>
            Seçili Renk
          </div>
        </div>
      </div>
      
      {/* Settings Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 text-sm font-medium ${
              activeTab === 'general'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-black hover:text-red-600'
            }`}
          >
            Genel
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-4 text-sm font-medium ${
              activeTab === 'payment'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-black hover:text-red-600'
            }`}
          >
            Ödeme
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-4 text-sm font-medium ${
              activeTab === 'appearance'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-black hover:text-red-600'
            }`}
          >
            Görünüm
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`py-4 text-sm font-medium ${
              activeTab === 'legal'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-black hover:text-red-600'
            }`}
          >
            Yasal
          </button>
        </div>
      </div>
      
      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-black mb-1">
                Site Adı
              </label>
              <input
                id="siteName"
                name="siteName"
                type="text"
                value={settings.siteName}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-black mb-1">
                İletişim Email
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              />
            </div>
            
            <div>
              <label htmlFor="supportPhone" className="block text-sm font-medium text-black mb-1">
                Destek Telefonu
              </label>
              <input
                id="supportPhone"
                name="supportPhone"
                type="text"
                value={settings.supportPhone}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              />
            </div>
            
            <div>
              <label htmlFor="defaultLanguage" className="block text-sm font-medium text-black mb-1">
                Varsayılan Dil
              </label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                value={settings.defaultLanguage}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="featuredListingsCount" className="block text-sm font-medium text-black mb-1">
                Öne Çıkan İlan Sayısı
              </label>
              <input
                id="featuredListingsCount"
                name="featuredListingsCount"
                type="number"
                min="0"
                max="12"
                value={settings.featuredListingsCount}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                name="maintenanceMode"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-black">
                Bakım Modu (Aktifleştirildiğinde site tüm ziyaretçiler için bakım moduna geçer)
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="commissionRate" className="block text-sm font-medium text-black mb-1">
                Komisyon Oranı (%)
              </label>
              <input
                id="commissionRate"
                name="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.commissionRate}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              />
            </div>
            
            <div>
              <label htmlFor="currencySymbol" className="block text-sm font-medium text-black mb-1">
                Para Birimi Sembolü
              </label>
              <input
                id="currencySymbol"
                name="currencySymbol"
                type="text"
                value={settings.currencySymbol}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              />
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-md font-bold text-black mb-3">Ödeme Yöntemleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    id="paymentMethodCredit"
                    type="checkbox"
                    checked={true}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="paymentMethodCredit" className="ml-2 block text-sm text-black">
                    Kredi Kartı
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="paymentMethodBankTransfer"
                    type="checkbox"
                    checked={true}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="paymentMethodBankTransfer" className="ml-2 block text-sm text-black">
                    Banka Havale
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="paymentMethodPaypal"
                    type="checkbox"
                    checked={false}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="paymentMethodPaypal" className="ml-2 block text-sm text-black">
                    PayPal
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-bold text-black">Ana Tema</h3>
                {settings.themeMode !== originalSettings?.themeMode && (
                  <span className="text-xs text-red-600 font-medium">Değişiklik yapıldı</span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div 
                  onClick={() => handleThemeModeSelect('standard')}
                  className={`border ${settings.themeMode === 'standard' ? 'border-2 border-red-500' : 'border-gray-200'} rounded-lg p-2 cursor-pointer hover:border-red-500 bg-gray-50`}
                >
                  <div className="aspect-video bg-white rounded-md border border-gray-200 mb-2"></div>
                  <div className="text-sm text-black font-medium text-center">Standart</div>
                </div>
                
                <div 
                  onClick={() => handleThemeModeSelect('dark')}
                  className={`border ${settings.themeMode === 'dark' ? 'border-2 border-red-500' : 'border-gray-200'} rounded-lg p-2 cursor-pointer hover:border-red-500`}
                >
                  <div className="aspect-video bg-gray-900 rounded-md border border-gray-800 mb-2"></div>
                  <div className="text-sm text-black font-medium text-center">Koyu</div>
                </div>
                
                <div 
                  onClick={() => handleThemeModeSelect('blue')}
                  className={`border ${settings.themeMode === 'blue' ? 'border-2 border-red-500' : 'border-gray-200'} rounded-lg p-2 cursor-pointer hover:border-red-500`}
                >
                  <div className="aspect-video bg-blue-50 rounded-md border border-blue-100 mb-2"></div>
                  <div className="text-sm text-black font-medium text-center">Mavi</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-bold text-black">Ana Renk</h3>
                {settings.themeColor !== originalSettings?.themeColor && (
                  <span className="text-xs text-red-600 font-medium">Değişiklik yapıldı</span>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div 
                  onClick={() => handleColorSelect('red')}
                  className={`border ${settings.themeColor === 'red' ? 'border-2 border-red-500' : 'border border-gray-200'} rounded-lg p-1 hover:border-red-500`}
                >
                  <div className="bg-red-500 h-8 rounded"></div>
                </div>
                
                <div 
                  onClick={() => handleColorSelect('blue')}
                  className={`border ${settings.themeColor === 'blue' ? 'border-2 border-red-500' : 'border border-gray-200'} rounded-lg p-1 hover:border-red-500`}
                >
                  <div className="bg-blue-500 h-8 rounded"></div>
                </div>
                
                <div 
                  onClick={() => handleColorSelect('green')}
                  className={`border ${settings.themeColor === 'green' ? 'border-2 border-red-500' : 'border border-gray-200'} rounded-lg p-1 hover:border-red-500`}
                >
                  <div className="bg-green-500 h-8 rounded"></div>
                </div>
                
                <div 
                  onClick={() => handleColorSelect('purple')}
                  className={`border ${settings.themeColor === 'purple' ? 'border-2 border-red-500' : 'border border-gray-200'} rounded-lg p-1 hover:border-red-500`}
                >
                  <div className="bg-purple-500 h-8 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-md font-bold text-black mb-3">Logo</h3>
              
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-black">Logo yüklemek için tıklayın veya sürükleyip bırakın</p>
                <p className="text-xs text-black mt-1">PNG, JPG veya SVG / Maks 2MB</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Legal Settings */}
      {activeTab === 'legal' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-md font-bold text-black mb-3">Kullanım Koşulları</h3>
              
              <div className="mb-2 flex justify-between items-center">
                <label className="block text-sm font-medium text-black">
                  Son Güncelleme Tarihi
                </label>
                <input
                  type="date"
                  name="termsLastUpdated"
                  value={settings.termsLastUpdated}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                />
              </div>
              
              <textarea
                rows={6}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                defaultValue="StayNest platformunu kullanmadan önce lütfen bu kullanım koşullarını dikkatlice okuyun. Platformumuzu kullanarak, bu koşulları kabul etmiş olursunuz..."
              ></textarea>
            </div>
            
            <div>
              <h3 className="text-md font-bold text-black mb-3">Gizlilik Politikası</h3>
              
              <div className="mb-2 flex justify-between items-center">
                <label className="block text-sm font-medium text-black">
                  Son Güncelleme Tarihi
                </label>
                <input
                  type="date"
                  name="privacyLastUpdated"
                  value={settings.privacyLastUpdated}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                />
              </div>
              
              <textarea
                rows={6}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                defaultValue="StayNest olarak kişisel verilerinizin gizliliğini önemsiyoruz. Bu gizlilik politikası, topladığımız bilgileri, nasıl kullandığımızı ve sakladığımızı açıklar..."
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 