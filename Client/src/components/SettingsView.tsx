import { useState, useEffect } from 'react';

interface FooterSettings {
  companyName: string;
  copyrightYear: string;
  version: string;
  description?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

interface SettingsViewProps {
  footerSettings: FooterSettings;
  setFooterSettings: (settings: FooterSettings) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const SettingsView = ({ footerSettings, setFooterSettings, isSaving, setIsSaving }: SettingsViewProps) => {
  const defaultSettings: FooterSettings = {
    companyName: 'IPTV Manager',
    copyrightYear: '2023 - 2026',
    version: 'V 2.1.0 (Beta)',
    description: 'Professional IPTV Management Platform',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  };

  const [localSettings, setLocalSettings] = useState<FooterSettings>(footerSettings || defaultSettings);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // footerSettings prop'u değiştiğinde localSettings'i güncelle
  useEffect(() => {
    if (footerSettings) {
      setLocalSettings({
        ...defaultSettings,
        ...footerSettings,
        socialLinks: {
          ...defaultSettings.socialLinks,
          ...footerSettings.socialLinks
        },
        contactInfo: {
          ...defaultSettings.contactInfo,
          ...footerSettings.contactInfo
        }
      });
    }
  }, [footerSettings]);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        // 404 veya diğer hatalar için default değerleri kullan
        console.warn(`Settings API returned ${response.status}, using default values`);
        const defaultSettings: FooterSettings = {
          companyName: 'IPTV Manager',
          copyrightYear: '2023 - 2026',
          version: 'V 2.1.0 (Beta)',
          description: 'Professional IPTV Management Platform',
          socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
          },
          contactInfo: {
            email: '',
            phone: '',
            address: ''
          }
        };
        setLocalSettings(defaultSettings);
        setFooterSettings(defaultSettings);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (data.success && data.settings?.footer) {
        const footer = data.settings.footer;
        const loadedSettings: FooterSettings = {
          companyName: footer.companyName || 'IPTV Manager',
          copyrightYear: footer.copyrightYear || '2023 - 2026',
          version: footer.version || 'V 2.1.0 (Beta)',
          description: footer.description || '',
          socialLinks: {
            facebook: footer.socialLinks?.facebook || '',
            twitter: footer.socialLinks?.twitter || '',
            instagram: footer.socialLinks?.instagram || '',
            linkedin: footer.socialLinks?.linkedin || '',
            youtube: footer.socialLinks?.youtube || '',
          },
          contactInfo: {
            email: footer.contactInfo?.email || '',
            phone: footer.contactInfo?.phone || '',
            address: footer.contactInfo?.address || '',
          }
        };
        setLocalSettings(loadedSettings);
        setFooterSettings(loadedSettings);
      } else {
        // Backend'den veri gelmediyse default değerleri kullan
        const defaultSettings: FooterSettings = {
          companyName: 'IPTV Manager',
          copyrightYear: '2023 - 2026',
          version: 'V 2.1.0 (Beta)',
          description: 'Professional IPTV Management Platform',
          socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
          },
          contactInfo: {
            email: '',
            phone: '',
            address: ''
          }
        };
        setLocalSettings(defaultSettings);
        setFooterSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      // Hata durumunda default değerleri kullan (sessizce)
      // Kullanıcıya hata göstermiyoruz çünkü default değerler kullanılabilir
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setSaveMessage({ type: 'error', text: 'Oturum açılmamış. Lütfen tekrar giriş yapın.' });
        setIsSaving(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          footer: {
            companyName: localSettings.companyName || 'IPTV Manager',
            copyrightYear: localSettings.copyrightYear || '2023 - 2026',
            version: localSettings.version || 'V 2.1.0 (Beta)',
            description: localSettings.description || '',
            socialLinks: {
              facebook: localSettings.socialLinks?.facebook || '',
              twitter: localSettings.socialLinks?.twitter || '',
              instagram: localSettings.socialLinks?.instagram || '',
              linkedin: localSettings.socialLinks?.linkedin || '',
              youtube: localSettings.socialLinks?.youtube || '',
            },
            contactInfo: {
              email: localSettings.contactInfo?.email || '',
              phone: localSettings.contactInfo?.phone || '',
              address: localSettings.contactInfo?.address || '',
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // JSON parse edilemezse text'i kullan
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data.success) {
        setFooterSettings(localSettings);
        setSaveMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: data.message || 'Ayarlar kaydedilirken bir hata oluştu' });
      }
    } catch (error: any) {
      console.error('Save settings error:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Ayarlar kaydedilirken bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setLocalSettings(prev => {
      const keys = field.split('.');
      
      // Nested object update için
      if (keys.length === 1) {
        // Top level field
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        // Nested field (socialLinks.facebook, contactInfo.email)
        const [parentKey, childKey] = keys;
        const parentValue = prev[parentKey as keyof FooterSettings] as any;
        
        return {
          ...prev,
          [parentKey]: {
            ...(parentValue || {}),
            [childKey]: value
          }
        };
      }
      
      return prev;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Site Ayarları</h2>
          <p className="text-sm text-[#9db8b4] mt-1">Footer ve site bilgilerini düzenleyin</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">
            {isSaving ? 'hourglass_empty' : 'save'}
          </span>
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Footer Settings */}
      <div className="bg-[#1b2725] border border-[#293836] rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">web</span>
          Footer Ayarları
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#9db8b4] mb-2">
              Şirket Adı
            </label>
            <input
              type="text"
              value={localSettings.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
              placeholder="IPTV Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9db8b4] mb-2">
              Telif Hakkı Yılları
            </label>
            <input
              type="text"
              value={localSettings.copyrightYear || ''}
              onChange={(e) => updateField('copyrightYear', e.target.value)}
              className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
              placeholder="2023 - 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9db8b4] mb-2">
              Versiyon
            </label>
            <input
              type="text"
              value={localSettings.version || ''}
              onChange={(e) => updateField('version', e.target.value)}
              className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
              placeholder="V 2.1.0 (Beta)"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#9db8b4] mb-2">
              Açıklama
            </label>
            <textarea
              value={localSettings.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none resize-none"
              rows={3}
              placeholder="Professional IPTV Management Platform"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="pt-4 border-t border-[#293836]">
          <h4 className="text-sm font-semibold text-white mb-4">Sosyal Medya Bağlantıları</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">Facebook</label>
              <input
                type="url"
                value={localSettings.socialLinks?.facebook || ''}
                onChange={(e) => updateField('socialLinks.facebook', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">Twitter</label>
              <input
                type="url"
                value={localSettings.socialLinks?.twitter || ''}
                onChange={(e) => updateField('socialLinks.twitter', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">Instagram</label>
              <input
                type="url"
                value={localSettings.socialLinks?.instagram || ''}
                onChange={(e) => updateField('socialLinks.instagram', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">LinkedIn</label>
              <input
                type="url"
                value={localSettings.socialLinks?.linkedin || ''}
                onChange={(e) => updateField('socialLinks.linkedin', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">YouTube</label>
              <input
                type="url"
                value={localSettings.socialLinks?.youtube || ''}
                onChange={(e) => updateField('socialLinks.youtube', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="pt-4 border-t border-[#293836]">
          <h4 className="text-sm font-semibold text-white mb-4">İletişim Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">E-posta</label>
              <input
                type="email"
                value={localSettings.contactInfo?.email || ''}
                onChange={(e) => updateField('contactInfo.email', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">Telefon</label>
              <input
                type="tel"
                value={localSettings.contactInfo?.phone || ''}
                onChange={(e) => updateField('contactInfo.phone', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none"
                placeholder="+90 555 123 4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#9db8b4] mb-2">Adres</label>
              <textarea
                value={localSettings.contactInfo?.address || ''}
                onChange={(e) => updateField('contactInfo.address', e.target.value)}
                className="w-full px-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white focus:border-[#19e6c4] focus:outline-none resize-none"
                rows={2}
                placeholder="Şirket adresi..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
