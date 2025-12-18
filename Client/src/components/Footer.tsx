import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FooterSettings {
  companyName: string;
  copyrightYear: string;
  version: string;
  description?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const currentLang = params.lang || 'tr';
  const [settings, setSettings] = useState<FooterSettings>({
    companyName: 'IPTV Manager',
    copyrightYear: '2023 - 2026',
    version: 'V 2.1.0 (Beta)',
    description: 'Professional IPTV Management Platform'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/settings`);
        const data = await response.json();
        
        if (data.success && data.settings?.footer) {
          setSettings(data.settings.footer);
        }
      } catch (error) {
        console.error('Failed to load footer settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleQuickLink = (path: string) => {
    navigate(`/${currentLang}${path}`);
  };

  return (
    <footer className="w-full border-t border-[#293836] bg-[#1a2c29] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-8 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">{settings.companyName}</h3>
            </div>
            {settings.description && (
              <p className="text-xs text-[#9eb7a8] leading-relaxed">
                {settings.description}
              </p>
            )}
            {/* Social Links */}
            {(settings.socialLinks && Object.values(settings.socialLinks).some(link => link)) && (
              <div className="flex items-center gap-2 pt-1">
                {settings.socialLinks.facebook && (
                  <a
                    href={settings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-7 rounded-lg bg-[#293836] hover:bg-primary flex items-center justify-center text-[#9eb7a8] hover:text-white transition-all"
                    aria-label="Facebook"
                  >
                    <span className="material-symbols-outlined text-base">facebook</span>
                  </a>
                )}
                {settings.socialLinks.twitter && (
                  <a
                    href={settings.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-7 rounded-lg bg-[#293836] hover:bg-primary flex items-center justify-center text-[#9eb7a8] hover:text-white transition-all"
                    aria-label="Twitter"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </a>
                )}
                {settings.socialLinks.instagram && (
                  <a
                    href={settings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-7 rounded-lg bg-[#293836] hover:bg-primary flex items-center justify-center text-[#9eb7a8] hover:text-white transition-all"
                    aria-label="Instagram"
                  >
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a
                    href={settings.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-7 rounded-lg bg-[#293836] hover:bg-primary flex items-center justify-center text-[#9eb7a8] hover:text-white transition-all"
                    aria-label="LinkedIn"
                  >
                    <span className="material-symbols-outlined text-base">work</span>
                  </a>
                )}
                {settings.socialLinks.youtube && (
                  <a
                    href={settings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-7 rounded-lg bg-[#293836] hover:bg-primary flex items-center justify-center text-[#9eb7a8] hover:text-white transition-all"
                    aria-label="YouTube"
                  >
                    <span className="material-symbols-outlined text-base">play_circle</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{t('notFound.quickAccess')}</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleQuickLink('/')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('common.home')}
              </button>
              <button
                onClick={() => handleQuickLink('/xtreme-code-list')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('nav.xtremeCode')} {t('nav.accounts')}
              </button>
              <button
                onClick={() => handleQuickLink('/m3u-list')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('nav.m3uPlaylist')} {t('nav.accounts')}
              </button>
              <button
                onClick={() => handleQuickLink('/login')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('common.login')}
              </button>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{t('nav.support')}</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleQuickLink('/support')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('nav.support')}
              </button>
              <button
                onClick={() => handleQuickLink('/terms')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('nav.terms')}
              </button>
              <button
                onClick={() => handleQuickLink('/privacy')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('nav.privacy')}
              </button>
              <button
                onClick={() => handleQuickLink('/cookie-policy')}
                className="block text-[#9eb7a8] hover:text-primary text-xs font-medium transition-colors text-left"
              >
                {t('nav.cookiePolicy')}
              </button>
            </div>
            {/* Contact Info */}
            {settings.contactInfo && (settings.contactInfo.email || settings.contactInfo.phone) && (
              <div className="pt-3 space-y-1.5 border-t border-[#293836] mt-3">
                {settings.contactInfo.email && (
                  <a
                    href={`mailto:${settings.contactInfo.email}`}
                    className="flex items-center gap-1.5 text-[#9eb7a8] hover:text-primary text-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    <span className="truncate">{settings.contactInfo.email}</span>
                  </a>
                )}
                {settings.contactInfo.phone && (
                  <a
                    href={`tel:${settings.contactInfo.phone}`}
                    className="flex items-center gap-1.5 text-[#9eb7a8] hover:text-primary text-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">phone</span>
                    <span className="truncate">{settings.contactInfo.phone}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-[#293836]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-[#9eb7a8] text-center sm:text-left">
              © {settings.copyrightYear} {settings.companyName}. {t('common.allRightsReserved')}
            </p>
            <span className="text-xs text-[#9eb7a8] bg-[#293836] px-2.5 py-1 rounded-full">
              {settings.version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
