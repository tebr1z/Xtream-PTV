import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectXtremeCode } from '../services/xtremeCodeService';

type XtremeCodeCredentials = {
  serverUrl: string;
  tvName: string;
  username: string;
  password: string;
};

const XtremeCodeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serverUrl: '',
    tvName: '',
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
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // API bağlantısı
      const credentials: XtremeCodeCredentials = {
        serverUrl: formData.serverUrl,
        tvName: formData.tvName,
        username: formData.username,
        password: formData.password,
      };

      const response = await connectXtremeCode(credentials);

      if (response.success) {
        // Başarılı giriş - bilgileri localStorage'a kaydet
        // apiEndpoint'i response.data'dan al ve credentials'a ekle
        const credentialsWithEndpoint = {
          ...credentials,
          apiEndpoint: response.data?.apiEndpoint || null
        };
        
        // Hesaplar listesine ekle veya güncelle
        const { saveAccount, setActiveAccount } = await import('../services/xtremeCodeService');
        saveAccount(credentialsWithEndpoint);
        setActiveAccount(credentialsWithEndpoint);
        
        // Backend'e gönder (kayıtsız kullanıcı için)
        const { sendXtremeCodeAccount } = await import('../services/anonymousAccountService');
        await sendXtremeCodeAccount(credentialsWithEndpoint);
        
        // Dashboard'a yönlendir
        navigate('/channels');
      } else {
        setError(response.message || 'Giriş bilgileri hatalı');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8 w-full">
        {/* Login Card */}
        <div className="w-full max-w-[520px] bg-[#161f1a] border border-[#29382f] rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header Section */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 text-primary border border-primary/20">
              <span className="material-symbols-outlined !text-4xl">live_tv</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Xtreme Code IPTV</h1>
            <p className="text-[#9eb7a8] text-sm font-medium">Lütfen abonelik bilgilerinizi giriniz.</p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-10">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Server URL */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 ml-1" htmlFor="serverUrl">Link</label>
                <div className="flex w-full items-stretch rounded-xl shadow-sm group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <input
                    id="serverUrl"
                    name="serverUrl"
                    value={formData.serverUrl}
                    onChange={handleChange}
                    className="form-input flex-1 w-full bg-[#1c2620] border border-r-0 border-[#3d5245] text-white placeholder:text-[#5a7063] rounded-l-xl focus:border-[#3d5245] focus:ring-0 h-12 px-4 text-base"
                    placeholder="http://domain.com:port"
                    type="text"
                    required
                  />
                  <div className="flex items-center justify-center px-4 bg-[#1c2620] border border-l-0 border-[#3d5245] rounded-r-xl text-[#9eb7a8]">
                    <span className="material-symbols-outlined">link</span>
                  </div>
                </div>
              </div>

              {/* TV Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 ml-1" htmlFor="tvName">TV Name</label>
                <div className="flex w-full items-stretch rounded-xl shadow-sm group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <input
                    id="tvName"
                    name="tvName"
                    value={formData.tvName}
                    onChange={handleChange}
                    className="form-input flex-1 w-full bg-[#1c2620] border border-r-0 border-[#3d5245] text-white placeholder:text-[#5a7063] rounded-l-xl focus:border-[#3d5245] focus:ring-0 h-12 px-4 text-base"
                    placeholder="TV Name"
                    type="text"
                    required
                  />
                  <div className="flex items-center justify-center px-4 bg-[#1c2620] border border-l-0 border-[#3d5245] rounded-r-xl text-[#9eb7a8]">
                    <span className="material-symbols-outlined">tv</span>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 ml-1" htmlFor="username">Username</label>
                <div className="flex w-full items-stretch rounded-xl shadow-sm group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input flex-1 w-full bg-[#1c2620] border border-r-0 border-[#3d5245] text-white placeholder:text-[#5a7063] rounded-l-xl focus:border-[#3d5245] focus:ring-0 h-12 px-4 text-base"
                    placeholder="Username"
                    type="text"
                    required
                  />
                  <div className="flex items-center justify-center px-4 bg-[#1c2620] border border-l-0 border-[#3d5245] rounded-r-xl text-[#9eb7a8]">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-sm font-medium text-white" htmlFor="password">Password</label>
                </div>
                <div className="flex w-full items-stretch rounded-xl shadow-sm group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input flex-1 w-full bg-[#1c2620] border border-r-0 border-[#3d5245] text-white placeholder:text-[#5a7063] rounded-l-xl focus:border-[#3d5245] focus:ring-0 h-12 px-4 text-base"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 bg-[#1c2620] border border-l-0 border-[#3d5245] rounded-r-xl text-[#9eb7a8] cursor-pointer hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary hover:bg-[#2fd16f] active:scale-[0.98] transition-all text-[#111714] text-base font-bold leading-normal tracking-[0.015em] shadow-[0_0_20px_rgba(54,226,123,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{isLoading ? 'Bağlanıyor...' : 'Bağlan'}</span>
                  <span className="material-symbols-outlined ml-2 text-xl">login</span>
                </button>

                {/* Notification / Help */}
                <div className="flex items-center justify-between text-sm mt-1">
                  <a
                    className="text-[#9eb7a8] hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Yardım sayfası yakında eklenecek!');
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">help</span>
                    Yardım
                  </a>
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer Decor */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1c2620] via-primary to-[#1c2620] opacity-20"></div>
        </div>

        {/* Bottom Copyright */}
        <p className="mt-8 text-xs text-[#5a7063]">© 2023 Xtreme Code IPTV Player. All rights reserved.</p>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-[#9eb7a8] hover:text-primary transition-colors flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default XtremeCodeLogin;

