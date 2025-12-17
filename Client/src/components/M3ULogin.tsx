import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { loadM3UPlaylist } from '../services/m3uService';

type M3UCredentials = {
  url: string;
  username?: string;
  password?: string;
};

const M3ULogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<M3UCredentials>({
    url: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // M3U playlist yükleme işlemi
      const response = await loadM3UPlaylist(formData);

      if (response.success && response.channels) {
        // Başarılı yükleme - bilgileri localStorage'a kaydet
        const { saveM3UAccount, setActiveM3UAccount } = await import('../services/m3uService');
        const accountWithName = {
          ...formData,
          name: formData.url.split('/').pop() || 'M3U Playlist',
          channelCount: response.channels.length
        };
        saveM3UAccount(accountWithName);
        setActiveM3UAccount(accountWithName, response.channels);
        
        // Backend'e gönder (kayıtsız kullanıcı için)
        const { sendM3UAccount } = await import('../services/anonymousAccountService');
        await sendM3UAccount(accountWithName);
        
        // Dashboard'a yönlendir (şimdilik ana sayfaya)
        alert(`M3U playlist başarıyla yüklendi! ${response.channels.length} kanal bulundu.`);
        navigate('/');
      } else {
        setError(response.message || 'Playlist yüklenirken hata oluştu.');
      }
    } catch (err) {
      setError('Playlist yüklenirken hata oluştu. Lütfen tekrar deneyin.');
      console.error('M3U load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleList = () => {
    // Örnek M3U URL'i
    setFormData(prev => ({
      ...prev,
      url: 'https://example.com/playlist.m3u'
    }));
  };

  return (
    <div className="bg-background-light dark:bg-[#11211e] font-display min-h-screen flex flex-col antialiased selection:bg-[#19e6c4] selection:text-[#11211e] overflow-x-hidden w-full">
      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between px-6 py-4 lg:px-10 border-b border-gray-200 dark:border-[#293836]">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">M3U Player</h1>
        </div>
        <button
          onClick={() => alert('Yardım sayfası yakında eklenecek!')}
          className="group flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1a2c29] hover:bg-gray-200 dark:hover:bg-[#233834] transition-colors text-slate-700 dark:text-white text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">help</span>
          <span className="hidden sm:inline">Yardım</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full">
        {/* Login Card */}
        <div className="w-full max-w-[520px] bg-white dark:bg-[#1a2c29] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a3c39] overflow-hidden">
          {/* Card Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="mx-auto size-16 bg-gradient-to-tr from-[#19e6c4]/20 to-[#19e6c4]/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
              <span className="material-symbols-outlined text-[#19e6c4] text-3xl">tv</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">M3U Player Giriş</h2>
            <p className="text-slate-500 dark:text-[#9db8b4] text-sm font-normal">
              IPTV yayınlarınıza erişmek için bağlantı bilgilerinizi girin.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-10">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* M3U URL Input */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-white text-sm font-medium ml-1">M3U URL</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#9db8b4]">link</span>
                  </div>
                  <input
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-[#1c2625] border border-gray-200 dark:border-[#3c534f] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9db8b4] focus:ring-2 focus:ring-[#19e6c4]/50 focus:border-[#19e6c4] transition-all outline-none text-base"
                    placeholder="http://example.com/playlist.m3u"
                    type="url"
                    required
                  />
                </div>
              </div>

              {/* Username & Password Group */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Username */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-slate-700 dark:text-white text-sm font-medium ml-1">Kullanıcı Adı</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 dark:text-[#9db8b4]">person</span>
                    </div>
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-[#1c2625] border border-gray-200 dark:border-[#3c534f] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9db8b4] focus:ring-2 focus:ring-[#19e6c4]/50 focus:border-[#19e6c4] transition-all outline-none text-base"
                      placeholder="user123"
                      type="text"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-slate-700 dark:text-white text-sm font-medium ml-1 flex justify-between">
                    <span>Şifre</span>
                    <span className="text-slate-400 dark:text-[#9db8b4] text-xs font-normal opacity-70">(İsteğe Bağlı)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 dark:text-[#9db8b4]">lock</span>
                    </div>
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-[#1c2625] border border-gray-200 dark:border-[#3c534f] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9db8b4] focus:ring-2 focus:ring-[#19e6c4]/50 focus:border-[#19e6c4] transition-all outline-none text-base"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full h-14 bg-[#19e6c4] hover:bg-[#15cea8] text-[#11211e] text-base font-bold rounded-xl shadow-lg shadow-[#19e6c4]/20 hover:shadow-[#19e6c4]/40 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">playlist_play</span>
                <span>{isLoading ? 'Yükleniyor...' : 'Listeyi Yükle'}</span>
              </button>

              <div className="mt-2 text-center">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleExampleList();
                  }}
                  className="text-sm text-slate-500 dark:text-[#9db8b4] hover:text-[#19e6c4] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  Örnek bir liste denemek ister misiniz?
                </a>
              </div>
            </form>
          </div>

          {/* Decorative bottom bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#19e6c4]/30 to-transparent"></div>
        </div>
      </main>

      {/* Background Decoration (Abstract) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Abstract glow effect top right */}
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#19e6c4]/5 blur-[120px]"></div>
        {/* Abstract glow effect bottom left */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#19e6c4]/5 blur-[100px]"></div>
      </div>

      {/* Back Button */}
      <div className="w-full flex justify-center pb-8">
        <button
          onClick={() => navigate('/')}
          className="text-[#9db8b4] hover:text-[#19e6c4] transition-colors flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Ana Sayfaya Dön
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default M3ULogin;

