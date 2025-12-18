import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Toast from './Toast';
import Footer from './Footer';

type TabType = 'login' | 'register' | 'forgot';

const Auth = () => {
  const navigate = useNavigate();
  const params = useParams<{ lang?: string }>();
  const { i18n, t } = useTranslation();
  const lang = params.lang || i18n.language?.split('-')[0] || 'az';
  const [activeTab, setActiveTab] = useState<TabType>('login');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  // Forgot password form state
  const [forgotData, setForgotData] = useState({
    email: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setError('');
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleForgotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotData({ email: e.target.value });
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: loginData.usernameOrEmail,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Token ve kullanıcı bilgilerini kaydet
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Remember me
        if (loginData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Admin ise admin paneline yönlendir
        if (data.user?.role === 'admin') {
          setToast({ message: t('auth.loginSuccess'), type: 'success' });
          setTimeout(() => {
            navigate('/t4br1z');
          }, 500);
          return;
        }
        
        // Backend'den kullanıcının hesaplarını yükle ve localStorage'a kaydet
        // Mevcut localStorage hesapları ile birleştir (kayıp olmasın)
        const { getSavedAccounts } = await import('../services/xtremeCodeService');
        const { getSavedM3UAccounts } = await import('../services/m3uService');
        
        const localXtremeAccounts = getSavedAccounts();
        const localM3UAccounts = getSavedM3UAccounts();
        
        // Backend'den gelen hesapları mevcut hesaplarla birleştir
        const mergedXtremeAccounts = [...(data.xtremeCodeAccounts || [])];
        localXtremeAccounts.forEach(localAcc => {
          if (!mergedXtremeAccounts.find(acc => acc.id === localAcc.id)) {
            mergedXtremeAccounts.push(localAcc);
          }
        });
        
        const mergedM3UAccounts = [...(data.m3uAccounts || [])];
        localM3UAccounts.forEach(localAcc => {
          if (!mergedM3UAccounts.find(acc => acc.id === localAcc.id)) {
            mergedM3UAccounts.push(localAcc);
          }
        });
        
        // Birleştirilmiş hesapları localStorage'a kaydet
        if (mergedXtremeAccounts.length > 0) {
          localStorage.setItem('xtremeCodeAccounts', JSON.stringify(mergedXtremeAccounts));
          // Eğer aktif hesap yoksa ilkini aktif yap
          if (!localStorage.getItem('activeXtremeCodeAccount') && mergedXtremeAccounts[0]) {
            localStorage.setItem('activeXtremeCodeAccount', JSON.stringify(mergedXtremeAccounts[0]));
          }
        }
        
        if (mergedM3UAccounts.length > 0) {
          localStorage.setItem('m3uAccounts', JSON.stringify(mergedM3UAccounts));
          // Eğer aktif hesap yoksa ilkini aktif yap
          if (!localStorage.getItem('activeM3UAccount') && mergedM3UAccounts[0]) {
            localStorage.setItem('activeM3UAccount', JSON.stringify(mergedM3UAccounts[0]));
          }
        }
        
        // Birleştirilmiş hesapları backend'e senkronize et
        await syncLocalAccountsToBackend(data.token);
        
        // Başarı bildirimi göster
        setToast({ message: t('auth.loginSuccess'), type: 'success' });
        
        // Kısa bir gecikme sonrası yönlendir (bildirimi görmek için)
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        // Email verification hatası kontrolü (Admin için atla)
        if (data.emailVerified === false && data.user?.role !== 'admin') {
          setError(data.message || t('auth.emailNotVerified'));
          // Email verification sayfasına yönlendirme linki göster
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(loginData.usernameOrEmail)}`);
          }, 2000);
        } else {
          setError(data.message || t('auth.loginError'));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (registerData.password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (!registerData.acceptTerms) {
      setError(t('auth.acceptTermsError'));
      return;
    }

    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Email verification gerekiyor
        if (data.emailSent && !data.user?.emailVerified) {
          setToast({ 
            message: 'Kayıt başarılı! Lütfen email adresinizi doğrulayın. Email kutunuzu kontrol edin.', 
            type: 'info' 
          });
          // Email verification sayfasına yönlendir
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(registerData.email)}`);
          }, 1500);
          return;
        }
        
        // Email zaten doğrulanmışsa (normalde olmaz ama güvenlik için)
        if (data.token && data.user) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
          
          // Backend'den kullanıcının hesaplarını yükle (register'da genelde boş olur)
          if (data.xtremeCodeAccounts && data.xtremeCodeAccounts.length > 0) {
            localStorage.setItem('xtremeCodeAccounts', JSON.stringify(data.xtremeCodeAccounts));
          }
          
          if (data.m3uAccounts && data.m3uAccounts.length > 0) {
            localStorage.setItem('m3uAccounts', JSON.stringify(data.m3uAccounts));
          }
          
          // Mevcut localStorage'daki hesapları backend'e senkronize et
          await syncLocalAccountsToBackend(data.token);
          
          // Başarı bildirimi göster
          setToast({ message: 'Kayıt başarılı! Hoş geldiniz.', type: 'success' });
          
          // Kısa bir gecikme sonrası yönlendir (bildirimi görmek için)
          setTimeout(() => {
            navigate('/');
          }, 500);
        }
      } else {
        setError(data.message || t('auth.registerError'));
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forgotData.email) {
      setError(t('auth.emailAddress') + ' ' + t('common.required') || 'Email adresi gereklidir.');
      return;
    }

    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotData.email }),
      });

      // Response'un JSON olup olmadığını kontrol et
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setError(`Sunucu hatası (${response.status}). Lütfen daha sonra tekrar deneyin.`);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setToast({ 
          message: data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!', 
          type: 'success' 
        });
        setForgotData({ email: '' });
      } else {
        setError(data.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Şifre sıfırlama isteği gönderilirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleM3ULoad = () => {
    navigate('/m3u-playlist');
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-background-light dark:bg-[#11211e] font-display antialiased min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#19e6c4]/5 blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#19e6c4]/10 blur-[100px]"></div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full border-b border-gray-200 dark:border-[#293836] bg-white/80 dark:bg-[#111817]/90 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight">{t('common.appName')}</h1>
          </div>
            <a
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${lang}/support`);
            }}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#19e6c4] transition-colors hidden sm:block cursor-pointer"
          >
            {t('auth.helpSupport')}
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 w-full">
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1c2625] rounded-2xl shadow-xl border border-gray-200 dark:border-[#293836] overflow-hidden flex flex-col">
          {/* Header Section with Image/Pattern */}
          <div className="h-32 bg-gray-900 relative overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#19e6c4]/20 via-gray-800 to-gray-900"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1c2625] to-transparent"></div>
            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.welcome')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('auth.welcomeSubtitle')}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-6 pt-4">
            <div className="flex border-b border-gray-200 dark:border-[#293836]">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 pb-3 pt-2 text-sm font-bold transition-colors focus:outline-none ${
                  activeTab === 'login'
                    ? 'text-[#19e6c4] border-b-2 border-[#19e6c4] hover:text-[#14b89d]'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`flex-1 pb-3 pt-2 text-sm font-bold transition-colors focus:outline-none ${
                  activeTab === 'register'
                    ? 'text-[#19e6c4] border-b-2 border-[#19e6c4] hover:text-[#14b89d]'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t('auth.register')}
              </button>
              <button
                onClick={() => switchTab('forgot')}
                className={`flex-1 pb-3 pt-2 text-sm font-bold transition-colors focus:outline-none ${
                  activeTab === 'forgot'
                    ? 'text-[#19e6c4] border-b-2 border-[#19e6c4] hover:text-[#14b89d]'
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* LOGIN TAB */}
            {activeTab === 'login' && (
              <form className="flex flex-col gap-5" onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.usernameOrEmail')}</span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </span>
                      <input
                        name="usernameOrEmail"
                        value={loginData.usernameOrEmail}
                        onChange={handleLoginChange}
                        className="w-full pl-10 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.usernameOrEmailPlaceholder')}
                        type="text"
                        required
                      />
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.password')}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </span>
                      <input
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="w-full pl-10 pr-10 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.passwordPlaceholder')}
                        type={showPassword ? 'text' : 'password'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      name="rememberMe"
                      type="checkbox"
                      checked={loginData.rememberMe}
                      onChange={handleLoginChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-[#19e6c4] focus:ring-[#19e6c4] bg-gray-50 dark:bg-[#151f1d]"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('auth.rememberMe')}</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] font-bold text-sm tracking-wide shadow-lg shadow-[#19e6c4]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? t('auth.loggingIn') : t('auth.loginButton')}</span>
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-[#293836]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-[#1c2625] text-gray-500">{t('auth.orContinueWithM3U')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleM3ULoad}
                  className="w-full h-12 rounded-lg border border-gray-300 dark:border-[#293836] bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">playlist_play</span>
                  <span>{t('auth.loadM3U')}</span>
                </button>
              </form>
            )}

            {/* REGISTER TAB */}
            {activeTab === 'register' && (
              <form className="flex flex-col gap-5" onSubmit={handleRegisterSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.username')}</span>
                      <input
                        name="username"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        className="w-full px-4 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.usernamePlaceholder')}
                        type="text"
                        required
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.email')}</span>
                      <input
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="w-full px-4 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.emailPlaceholder')}
                        type="email"
                        required
                      />
                    </label>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.password')}</span>
                    <div className="relative">
                      <input
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="w-full px-4 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.passwordMinLength')}
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showRegisterPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.confirmPassword')}</span>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        className="w-full px-4 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </label>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <input
                    name="acceptTerms"
                    type="checkbox"
                    checked={registerData.acceptTerms}
                    onChange={handleRegisterChange}
                    className="mt-1 rounded border-gray-300 dark:border-gray-600 text-[#19e6c4] focus:ring-[#19e6c4] bg-gray-50 dark:bg-[#151f1d]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug" dangerouslySetInnerHTML={{ __html: t('auth.acceptTerms', { lang }).replace(/\{\{lang\}\}/g, lang) }} />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] font-bold text-sm tracking-wide shadow-lg shadow-[#19e6c4]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('auth.registering') : t('auth.registerButton')}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD TAB */}
            {activeTab === 'forgot' && (
              <form className="flex flex-col gap-6" onSubmit={handleForgotSubmit}>
                <div className="text-center pt-2">
                  <div className="mx-auto w-12 h-12 bg-[#19e6c4]/10 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#19e6c4] text-2xl">mark_email_read</span>
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">{t('auth.forgotPasswordTitle')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 px-4">
                    {t('auth.forgotPasswordMessage')}
                  </p>
                </div>
                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('auth.emailAddress')}</span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </span>
                      <input
                        name="email"
                        value={forgotData.email}
                        onChange={handleForgotChange}
                        className="w-full pl-10 h-12 rounded-lg bg-gray-50 dark:bg-[#151f1d] border border-gray-300 dark:border-[#293836] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] text-sm transition-shadow outline-none"
                        placeholder={t('auth.emailPlaceholder')}
                        type="email"
                        required
                      />
                    </div>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] font-bold text-sm tracking-wide shadow-lg shadow-[#19e6c4]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#19e6c4] transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  {t('auth.backToLogin')}
                </button>
              </form>
            )}
          </div>

          {/* Footer of Card */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-[#151f1d] border-t border-gray-200 dark:border-[#293836] flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{t('auth.version')}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {t('auth.serverOnline')}
            </span>
          </div>
        </div>
      </main>

      {/* Back Button */}
      <div className="relative z-10 w-full flex justify-center pb-8">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 dark:text-gray-400 hover:text-[#19e6c4] transition-colors flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t('auth.backToHome')}
        </button>
      </div>
      <Footer />
    </div>
    </>
  );
};

// LocalStorage'daki hesapları backend'e senkronize et
const syncLocalAccountsToBackend = async (token: string) => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // LocalStorage'dan hesapları al
      const { getSavedAccounts } = await import('../services/xtremeCodeService');
      const { getSavedM3UAccounts } = await import('../services/m3uService');
      
      const xtremeAccounts = getSavedAccounts();
      const m3uAccounts = getSavedM3UAccounts();
      
      // Eğer hesaplar varsa backend'e gönder
      if (xtremeAccounts.length > 0 || m3uAccounts.length > 0) {
        await fetch(`${backendUrl}/api/user-accounts/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            xtremeCodeAccounts: xtremeAccounts,
            m3uAccounts: m3uAccounts
          }),
        });
      }
    } catch (err) {
      console.error('Sync accounts error:', err);
      // Hata olsa bile devam et
    }
  };

export default Auth;

