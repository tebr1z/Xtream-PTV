import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSavedAccounts } from '../services/xtremeCodeService';
import { getSavedM3UAccounts } from '../services/m3uService';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

const UserPanel = () => {
  const navigate = useNavigate();
  const { t, ready } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'tr';
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [xtremeAccounts, setXtremeAccounts] = useState<any[]>([]);
  const [m3uAccounts, setM3UAccounts] = useState<any[]>([]);
  const [assignedPackage, setAssignedPackage] = useState<any>(null);
  const [adminXtremeAccounts, setAdminXtremeAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        navigate(`/${lang}/login`);
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Backend'den kullanıcı bilgilerini çek
        const backendUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';
        const userId = userData.id || userData._id;
        if (!userId) {
          navigate(`/${lang}/login`);
          return;
        }
        const response = await fetch(`${backendUrl}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setAssignedPackage(data.user.assignedPackage || null);
            setAdminXtremeAccounts(data.user.adminXtremeCodeAccounts || []);
          }
        }
        
        // LocalStorage'dan hesapları yükle
        const xtreme = getSavedAccounts();
        const m3u = getSavedM3UAccounts();
        setXtremeAccounts(xtreme);
        setM3UAccounts(m3u);
      } catch (err) {
        console.error('User data load error:', err);
        navigate(`/${lang}/login`);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('xtremeCodeCredentials');
    localStorage.removeItem('xtremeCodeConnected');
    localStorage.removeItem('m3uChannels');
    localStorage.removeItem('xtremeCodeAccounts');
    localStorage.removeItem('m3uAccounts');
    localStorage.removeItem('activeXtremeCodeAccount');
    localStorage.removeItem('activeM3UAccount');
    const currentLang = params.lang || 'tr';
    navigate(`/${currentLang}`);
  };

  const handleOpenChannels = (type: 'xtreme' | 'm3u', account?: any) => {
    if (type === 'xtreme' && account) {
      localStorage.setItem('activeXtremeCodeAccount', JSON.stringify(account));
      navigate(`/${lang}/channels`, { state: { sourceType: 'xtreme' } });
    } else if (type === 'm3u' && account) {
      localStorage.setItem('activeM3UAccount', JSON.stringify(account));
      navigate(`/${lang}/channels`, { state: { sourceType: 'm3u' } });
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-[#111817] dark:text-white font-display min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=19e6c4&color=000`;

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111817] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] dark:border-border-dark bg-white/80 dark:bg-[#11211e]/80 backdrop-blur-md">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">IPTV Manager</h2>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.username || t('common.profile')}</span>
              <span className="text-xs text-gray-500 dark:text-text-secondary mt-1">{user?.role === 'admin' ? 'Admin' : t('common.profile')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-transparent group-hover:ring-primary transition-all cursor-pointer"
                  style={{ backgroundImage: `url("${userAvatar}")` }}
                ></div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center size-10 rounded-lg bg-gray-100 dark:bg-card-dark text-gray-600 dark:text-white hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title={t('common.logout')}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">{t('common.profile')}</h1>
          <p className="text-gray-500 dark:text-text-secondary text-base max-w-2xl">
            {t('userPanel.subtitle')}
          </p>
        </div>

        {/* Section 1: User's IPTV Configuration */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('userPanel.myIPTV')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Xtreme Code Card - Sadece kendi hesapları varsa göster (admin hesapları IPTV paketi olarak gösteriliyor) */}
            {xtremeAccounts.length > 0 && (
              <div className="group bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined">dns</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('userPanel.xtremeCode')}</h3>
                      <p className="text-xs text-gray-500 dark:text-text-secondary">{t('userPanel.apiConnection')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {/* Kendi Xtreme Code hesapları */}
                  {xtremeAccounts.map((account, index) => (
                    <div key={account.id || index} className="p-4 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-border-dark">
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase">{t('userPanel.tvName')}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{account.tvName || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase">{t('userPanel.serverURL')}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{account.serverUrl}</span>
                          <button
                            onClick={() => handleCopy(account.serverUrl, `xtreme-url-${index}`)}
                            className="text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {copiedField === `xtreme-url-${index}` ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase">{t('userPanel.username')}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{account.username}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenChannels('xtreme', account)}
                        className="w-full mt-4 h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-[#11211e] font-bold rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                        {t('userPanel.openChannels')}
                      </button>
                    </div>
                  ))}
                  
                </div>
              </div>
            )}

            {/* M3U Playlist Card - Tüm M3U hesaplarını göster */}
            {m3uAccounts.length > 0 && (
              <div className="group bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <span className="material-symbols-outlined">playlist_play</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('userPanel.m3uList')}</h3>
                      <p className="text-xs text-gray-500 dark:text-text-secondary">{t('userPanel.fileConnection')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {m3uAccounts.map((account, index) => (
                    <div key={account.id || index} className="p-4 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-border-dark">
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase">{t('userPanel.playlistName')}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{account.name || `M3U Playlist ${index + 1}`}</span>
                      </div>
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase">{t('userPanel.m3uURL')}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate pr-2">{account.url}</span>
                          <button
                            onClick={() => handleCopy(account.url, `m3u-url-${index}`)}
                            className="text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {copiedField === `m3u-url-${index}` ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </div>
                      {account.lastUsed && (
                        <div className="flex flex-col gap-1 mb-4">
                          <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase">{t('userPanel.lastUsed')}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(account.lastUsed).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleOpenChannels('m3u', account)}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-background-dark hover:opacity-90 font-bold rounded-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                        {t('userPanel.openChannels')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Admin Assigned Package - Admin tarafından eklenen Xtreme Code veya atanan paket varsa göster */}
        {(assignedPackage || adminXtremeAccounts.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('userPanel.assignedPackage')}</h2>
            </div>

            {/* Eğer assignedPackage varsa onu göster, yoksa adminXtremeAccounts'u IPTV paketi olarak göster */}
            {assignedPackage ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#152321] dark:to-[#0f1a18] rounded-2xl border border-gray-200 dark:border-border-dark shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-400 dark:text-text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          {t('userPanel.endDate')}: {assignedPackage.endDate || t('userPanel.unlimited')}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{assignedPackage.name || 'IPTV Paketi'}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-8 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-primary">live_tv</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-medium">{t('userPanel.channelCount')}</p>
                          <p className="text-lg font-bold text-white">{assignedPackage.channelCount || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-primary">hd</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-medium">{t('userPanel.quality')}</p>
                          <p className="text-lg font-bold text-white">{assignedPackage.quality || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-primary">update</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-medium">{t('userPanel.status')}</p>
                          <p className="text-lg font-bold text-emerald-400">{assignedPackage.status || t('userPanel.active')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Admin tarafından eklenen Xtreme Code varsa kanalları aç butonu */}
                  {adminXtremeAccounts.length > 0 && (
                    <div className="w-full md:w-auto flex flex-col items-center gap-3">
                      <button
                        onClick={() => handleOpenChannels('xtreme', adminXtremeAccounts[0])}
                        className="w-full md:w-auto px-8 h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-[#11211e] font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(25,230,196,0.2)] hover:shadow-[0_0_40px_rgba(25,230,196,0.4)] transform hover:-translate-y-0.5"
                      >
                        <span className="material-symbols-outlined">play_arrow</span>
                        {t('userPanel.usePackage')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : adminXtremeAccounts.length > 0 ? (
              // Admin tarafından eklenen Xtreme Code'u IPTV paketi olarak göster
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#152321] dark:to-[#0f1a18] rounded-2xl border border-gray-200 dark:border-border-dark shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-400 dark:text-text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          {t('userPanel.endDate')}: {t('userPanel.unlimited')}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{adminXtremeAccounts[0].tvName || 'IPTV Paketi'}</h3>
                      <p className="text-gray-300 dark:text-text-secondary text-sm md:text-base max-w-xl">
                        {t('userPanel.packageDescription')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-8 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-primary">dns</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-medium">{t('userPanel.server')}</p>
                          <p className="text-sm font-bold text-white truncate max-w-xs">{adminXtremeAccounts[0].serverUrl}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-primary">update</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-medium">Durum</p>
                          <p className="text-lg font-bold text-emerald-400">{t('userPanel.active')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto flex flex-col items-center gap-3">
                    <button
                      onClick={() => handleOpenChannels('xtreme', adminXtremeAccounts[0])}
                      className="w-full md:w-auto px-8 h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-[#11211e] font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(25,230,196,0.2)] hover:shadow-[0_0_40px_rgba(25,230,196,0.4)] transform hover:-translate-y-0.5"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Paketi Kullan
                    </button>
                    <p className="text-xs text-gray-500 text-center">{t('userPanel.managedByAdmin')}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserPanel;
