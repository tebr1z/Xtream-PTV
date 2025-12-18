import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import SEO from './SEO';
import LanguageSwitcher from './LanguageSwitcher';
import StructuredData from './StructuredData';
import CookieConsent from './CookieConsent';

interface CardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

const Card = ({ icon, title, description, onClick }: CardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col items-center justify-center p-10 gap-6 rounded-xl border border-white/10 bg-surface-dark hover:border-primary hover:bg-surface-dark/80 hover:shadow-glow transition-all duration-300 cursor-pointer h-64 md:h-72 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
      aria-label={`${title}: ${description}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity rounded-xl"></div>
      <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-background-dark border border-white/5 group-hover:border-primary/30 group-focus:border-primary/30 group-hover:scale-110 group-focus:scale-110 transition-transform duration-300 shadow-xl">
        <span className="material-symbols-outlined text-4xl text-white group-hover:text-primary group-focus:text-primary transition-colors">
          {icon}
        </span>
      </div>
      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary group-focus:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
};

const StreamHub = () => {
  const navigate = useNavigate();
  const { t, ready } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'tr';
  const [isDarkMode] = useState(true); // You can add toggle functionality later
  const [showComingSoon, setShowComingSoon] = useState(false);

  // i18n hazır olana kadar yükleniyor göster
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleCardClick = (cardType: string) => {
    // Handle navigation based on card type
    switch (cardType) {
      case 'Xtreme Code':
        navigate('/xtreme-code-list');
        break;
      case 'M3U Playlist':
        navigate('/m3u-list');
        break;
      case 'Live TV':
        // Çok yakında modal'ını göster
        setShowComingSoon(true);
        break;
      case 'Login':
        // Eğer login olmuşsa user sayfasına yönlendir
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        if (token && user) {
          navigate('/user');
        } else {
          navigate('/login');
        }
        break;
      default:
        alert(t('common.loading')); // TODO: Add proper translation
    }
  };

  const handleSettingsClick = () => {
    // Handle settings click
    alert(t('common.loading')); // TODO: Add proper translation
  };

  const handleProfileClick = () => {
    // Kullanıcı login olmuş mu kontrol et
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-full bg-background-dark font-display text-white antialiased overflow-x-hidden selection:bg-primary selection:text-background-dark ${isDarkMode ? 'dark' : ''}`}>
      <SEO
        title={t('seo.homeTitle')}
        description={t('seo.homeDescription')}
        keywords={t('seo.keywords')}
      />
      <StructuredData />
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-6 py-4 lg:px-12 w-full">
        <button
          onClick={() => navigate(`/${lang}`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="size-8 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t('common.appName')}</h2>
        </button>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={handleSettingsClick}
            className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
            aria-label={t('common.settings')}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          {(() => {
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('user');
            const isLoggedIn = !!(token && user);
            
            return (
              <button
                onClick={handleProfileClick}
                className={`flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark relative ${
                  isLoggedIn ? 'text-primary border-2 border-primary' : 'text-white/70 hover:text-white'
                }`}
                aria-label={t('common.profile')}
                title={isLoggedIn ? t('common.profile') : t('common.login')}
              >
                <span className="material-symbols-outlined">
                  {isLoggedIn ? 'account_circle' : 'person'}
                </span>
                {isLoggedIn && (
                  <span className="absolute top-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-background-dark"></span>
                )}
              </button>
            );
          })()}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-center py-10 px-4 md:px-8 lg:px-20 w-full">
        {/* Hero Section */}
        <div className="w-full max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            {t('home.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              icon="dns"
              title={t('home.xtremeCodeTitle')}
              description={t('home.xtremeCodeDesc')}
              onClick={() => handleCardClick('Xtreme Code')}
            />
            <Card
              icon="playlist_play"
              title={t('home.m3uTitle')}
              description={t('home.m3uDesc')}
              onClick={() => handleCardClick('M3U Playlist')}
            />
            <Card
              icon="live_tv"
              title={t('home.liveTVTitle')}
              description={t('home.liveTVDesc')}
              onClick={() => handleCardClick('Live TV')}
            />
            <Card
              icon="lock"
              title={t('home.loginTitle')}
              description={t('home.loginDesc')}
              onClick={() => handleCardClick('Login')}
            />
          </div>
        </div>
      </main>

      <Footer />
      <CookieConsent />

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="flex items-center justify-center size-16 rounded-full bg-primary/20 mb-4 mx-auto">
                <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('common.comingSoon')}</h3>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full px-6 py-3 bg-primary hover:bg-[#14b89d] text-[#11211e] font-bold rounded-lg transition-colors"
              >
                {t('common.ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamHub;

