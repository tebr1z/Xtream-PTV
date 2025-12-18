import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CookieConsent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'tr';
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Cookie consent daha önce verilmiş mi kontrol et
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Kısa bir gecikme ile göster (sayfa yüklendikten sonra)
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowConsent(false);
  };

  const handleSettings = () => {
    navigate(`/${lang}/cookie-policy`);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-[#1a2c29] border border-[#293836] rounded-xl shadow-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary text-3xl">cookie</span>
              <h3 className="text-xl font-bold text-white">{t('cookieConsent.title')}</h3>
            </div>
            <p className="text-[#9eb7a8] text-sm md:text-base leading-relaxed mb-4">
              {t('cookieConsent.message')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSettings}
                className="text-primary hover:text-[#19e6c4] text-sm font-medium transition-colors underline"
              >
                {t('cookieConsent.learnMore')}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleDecline}
              className="px-6 py-3 bg-[#293836] hover:bg-[#3e524f] text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {t('cookieConsent.decline')}
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-3 bg-primary hover:bg-[#14b89d] text-[#11211e] font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              {t('cookieConsent.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

