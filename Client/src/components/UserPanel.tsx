import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserPanel = () => {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock user data - in a real app, this would come from an API or context
  const userData = {
    name: 'Ahmet Yılmaz',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcFOphpagCcitx0Pi5yrGqO_zJxTJyHhuXiMWP4AonkIULTKoNu9sVfAae6U2wWEjY8lhl3grxmKMONk4hd-BSiPZhHeuEzuy45nabRddjLKPZfvEjVwU2DivwkGFQlNUqPKxrDPREiBwFuDB7YnyC2AB-i71wCrsoIws7rbpPp2pvHiHVWVWQ-NivJs6GmkAGTHUuQhLDnuuPeVc2KzuoFjZRUl88oyDrBAZO7kQ06gYHpA0qtiOk4ZtSGry2psSHwCXDhD1WkA4',
    xtremeCode: {
      serverUrl: 'http://line.tv-server.com',
      port: '8080',
      username: 'ahmet123',
      isActive: true,
    },
    m3uPlaylist: {
      url: 'http://example.com/get.php?username=ahmet...',
      format: 'M3U Plus',
      lastUpdate: 'Bugün, 14:30',
      isActive: true,
    },
    assignedPackage: {
      name: 'Gold Spor Paketi',
      type: 'Premium',
      endDate: '24.12.2024',
      channelCount: '2,500+',
      quality: '4K / UHD',
      status: 'Aktif',
      description: 'Yönetici tarafından hesabınıza tanımlanan özel paket. Tüm spor kanalları, sinema ve belgesel içeriklerini kapsar.',
    },
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    // Clear any stored credentials
    localStorage.removeItem('xtremeCodeCredentials');
    localStorage.removeItem('xtremeCodeConnected');
    localStorage.removeItem('m3uChannels');
    // Navigate to home
    navigate('/');
  };

  const handleOpenChannels = () => {
    navigate('/channels');
  };

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
            {/* User Profile Info */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{userData.name}</span>
              <span className="text-xs text-gray-500 dark:text-text-secondary mt-1">Kullanıcı</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-transparent group-hover:ring-primary transition-all cursor-pointer"
                  aria-label="User profile avatar showing a smiling person"
                  style={{ backgroundImage: `url("${userData.avatar}")` }}
                ></div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center size-10 rounded-lg bg-gray-100 dark:bg-card-dark text-gray-600 dark:text-white hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Çıkış Yap"
                aria-label="Çıkış Yap"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Kullanıcı Paneli</h1>
          <p className="text-gray-500 dark:text-text-secondary text-base max-w-2xl">
            IPTV hesaplarınızı yönetin, atanan paketleri görüntüleyin ve yayınlarınıza erişin.
          </p>
        </div>

        {/* Section 1: User's IPTV Configuration */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kendi IPTV Bilgileriniz</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Xtreme Code Card */}
            <div className="group bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined">dns</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Xtreme Code</h3>
                    <p className="text-xs text-gray-500 dark:text-text-secondary">API Bağlantısı</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  userData.xtremeCode.isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                }`}>
                  <span className={`size-1.5 rounded-full ${userData.xtremeCode.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                  {userData.xtremeCode.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Sunucu URL</span>
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-border-dark">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{userData.xtremeCode.serverUrl}</span>
                    <button
                      onClick={() => handleCopy(userData.xtremeCode.serverUrl, 'xtreme-url')}
                      className="text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                      aria-label="URL'yi kopyala"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedField === 'xtreme-url' ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Port</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{userData.xtremeCode.port}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Kullanıcı Adı</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{userData.xtremeCode.username}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenChannels}
                className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-[#11211e] font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(25,230,196,0.15)]"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                Kanalları Aç
              </button>
            </div>

            {/* M3U Playlist Card */}
            <div className="group bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <span className="material-symbols-outlined">playlist_play</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">M3U Listesi</h3>
                    <p className="text-xs text-gray-500 dark:text-text-secondary">Dosya Bağlantısı</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  userData.m3uPlaylist.isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                }`}>
                  <span className={`size-1.5 rounded-full ${userData.m3uPlaylist.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                  {userData.m3uPlaylist.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">M3U URL</span>
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-border-dark">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate pr-2">{userData.m3uPlaylist.url}</span>
                    <button
                      onClick={() => handleCopy(userData.m3uPlaylist.url, 'm3u-url')}
                      className="text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                      aria-label="URL'yi kopyala"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedField === 'm3u-url' ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Format</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{userData.m3uPlaylist.format}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-text-secondary uppercase tracking-wider">Son Güncelleme</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{userData.m3uPlaylist.lastUpdate}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenChannels}
                className="w-full h-11 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-background-dark hover:opacity-90 font-bold rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                Kanalları Aç
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Admin Assigned Package */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Size Atanan IPTV Paketi</h2>
          </div>

          {/* Package Card (Active State) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#152321] dark:to-[#0f1a18] rounded-2xl border border-gray-200 dark:border-border-dark shadow-xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-bold bg-primary text-[#11211e] uppercase tracking-wide">
                      {userData.assignedPackage.type}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      Bitiş: {userData.assignedPackage.endDate}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{userData.assignedPackage.name}</h3>
                  <p className="text-gray-300 dark:text-text-secondary text-sm md:text-base max-w-xl">
                    {userData.assignedPackage.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 md:gap-8 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">live_tv</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">Kanal Sayısı</p>
                      <p className="text-lg font-bold text-white">{userData.assignedPackage.channelCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">hd</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">Kalite</p>
                      <p className="text-lg font-bold text-white">{userData.assignedPackage.quality}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">update</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">Durum</p>
                      <p className="text-lg font-bold text-emerald-400">{userData.assignedPackage.status}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-col items-center gap-3">
                <button
                  onClick={handleOpenChannels}
                  className="w-full md:w-auto px-8 h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-[#11211e] font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(25,230,196,0.2)] hover:shadow-[0_0_40px_rgba(25,230,196,0.4)] transform hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Paketi Kullan
                </button>
                <p className="text-xs text-gray-500 text-center">Bu paket yönetici tarafından yönetilmektedir</p>
              </div>
            </div>
          </div>

          {/* Empty State Example (Hidden by default, shown if no package) */}
          {/* 
          <div className="w-full p-8 md:p-12 border border-dashed border-gray-300 dark:border-border-dark rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-card-dark/30">
            <div className="size-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-4">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Paket Bulunamadı</h3>
            <p className="text-gray-500 dark:text-text-secondary max-w-sm">
              Henüz size atanmış bir IPTV paketi bulunmamaktadır. Lütfen yönetici ile iletişime geçin.
            </p>
          </div>
          */}
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 text-center border-t border-[#e5e7eb] dark:border-border-dark mt-auto">
        <p className="text-sm text-gray-500 dark:text-text-secondary">© 2024 IPTV Manager. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default UserPanel;

