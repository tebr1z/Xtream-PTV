import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const currentLang = params.lang || 'tr';

  const handleQuickLink = (path: string) => {
    navigate(`/${currentLang}${path}`);
  };


  return (
    <footer className="w-full border-t border-[#293836] bg-[#1a2c29] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hızlı Erişim */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">{t('notFound.quickAccess')}</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleQuickLink('/')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('common.home')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => handleQuickLink('/xtreme-code-list')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('nav.xtremeCode')} {t('nav.accounts')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => handleQuickLink('/m3u-list')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('nav.m3uPlaylist')} {t('nav.accounts')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => handleQuickLink('/login')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('common.login')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => handleQuickLink('/support')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('nav.support')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => handleQuickLink('/terms')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('nav.terms')}
            </button>
            <span className="text-[#9eb7a8]">•</span>
            <button
              onClick={() => handleQuickLink('/privacy')}
              className="text-[#9eb7a8] hover:text-primary text-sm font-medium transition-colors"
            >
              {t('nav.privacy')}
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#293836]">
          <p className="text-sm text-[#9eb7a8] text-center">
            © 2024 IPTV Manager. {t('common.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

