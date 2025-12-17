import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'tr';

  return (
    <div className="font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden w-full">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#293836] bg-[#1a2c29]/80 backdrop-blur-md">
        <div className="px-4 md:px-10 py-3 flex items-center justify-end">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl sm:text-[12rem] font-black text-primary/20 dark:text-primary/10 leading-none">
            404
          </h1>
        </div>

        {/* Logo */}
        <div className="mb-8">
          <div className="size-16 text-primary mx-auto">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          {t('notFound.title')}
        </h2>

        {/* Description */}
        <p className="text-lg text-[#9eb7a8] mb-8 max-w-md">
          {t('notFound.description')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/${lang}`)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <span className="material-symbols-outlined">home</span>
            <span>{t('notFound.goHome')}</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-[#1a2c29] hover:bg-[#233935] border border-[#293836] text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>{t('notFound.goBack')}</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-[#293836] w-full">
          <p className="text-sm text-[#9eb7a8] mb-4">{t('notFound.quickAccess')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate(`/${lang}/xtreme-code-list`)}
              className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
            >
              {t('nav.xtremeCode')} {t('nav.accounts')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => navigate(`/${lang}/m3u-list`)}
              className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
            >
              {t('nav.m3uPlaylist')} {t('nav.accounts')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => navigate(`/${lang}/login`)}
              className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
            >
              {t('common.login')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => {
                const user = localStorage.getItem('user');
                if (user) {
                  const userData = JSON.parse(user);
                  if (userData.role === 'admin') {
                    navigate(`/${lang}/t4br1z`);
                  } else {
                    navigate(`/${lang}/user`);
                  }
                } else {
                  navigate(`/${lang}/login`);
                }
              }}
              className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
            >
              {t('notFound.panel')}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;

