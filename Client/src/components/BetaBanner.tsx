import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

const BetaBanner = () => {
  const { t, i18n } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const lang = params.lang || i18n.language?.split('-')[0] || 'az';

  useEffect(() => {
    // LocalStorage'dan kontrol et - kullanıcı banner'ı kapatmış mı?
    const dismissed = localStorage.getItem('betaBannerDismissed');
    if (!dismissed) {
      // Kısa bir gecikme ile göster (sayfa yüklendikten sonra)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('betaBannerDismissed', 'true');
  };

  const handleBugReport = () => {
    navigate(`/${lang}/support`);
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-md"
      style={{
        animation: 'slideUp 0.5s ease-out',
      }}
    >
      <div className="bg-gradient-to-r from-yellow-500/95 to-orange-500/95 backdrop-blur-sm border border-yellow-400/50 rounded-lg shadow-2xl p-4 relative">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label={t('beta.close') || 'Kapat'}
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Content */}
        <div className="pr-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-yellow-200 text-2xl">
                info
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm mb-1">
                {t('beta.title') || 'Beta Versiyon'}
              </h3>
              <p className="text-white/90 text-xs leading-relaxed mb-3">
                {t('beta.message') || 'Hazırda Beta versiyadır, xətalar ola bilər.'}
              </p>
              <p className="text-white/80 text-xs leading-relaxed mb-3">
                {t('beta.bugReport') || 'Harada xəta və ya əlavə etmək istədiyiniz yer olarsa sağ küncdə Bug report var, ora klik edib bize bildirin.'}
              </p>
              <button
                onClick={handleBugReport}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-md transition-colors border border-white/30"
              >
                <span className="material-symbols-outlined text-sm">bug_report</span>
                {t('beta.reportBug') || 'Bug Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaBanner;

