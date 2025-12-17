import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

const SEO = ({ title, description, keywords, image, type = 'website' }: SEOProps) => {
  const { i18n, ready } = useTranslation();
  const location = useLocation();
  const params = useParams<{ lang?: string }>();
  const currentLang = params.lang || i18n.language?.split('-')[0] || 'tr';
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = `${baseUrl}${location.pathname}`;
  const defaultImage = `${baseUrl}/og-image.jpg`;

  useEffect(() => {
    if (!ready) return;
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', title || '', 'property');
    updateMetaTag('og:description', description || '', 'property');
    updateMetaTag('og:image', image || defaultImage, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:locale', currentLang === 'tr' ? 'tr_TR' : currentLang === 'ru' ? 'ru_RU' : currentLang === 'az' ? 'az_AZ' : 'en_US', 'property');
    updateMetaTag('og:site_name', 'StreamHub', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title || '', 'name');
    updateMetaTag('twitter:description', description || '', 'name');
    updateMetaTag('twitter:image', image || defaultImage, 'name');

    // Language tags
    updateMetaTag('language', currentLang, 'name');
    document.documentElement.setAttribute('lang', currentLang);

    // Hreflang tags for multi-language SEO (path-based)
    const languages = ['tr', 'en', 'ru', 'az'];
    const pathWithoutLang = location.pathname.replace(/^\/(tr|en|ru|az)/, '') || '/';
    
    languages.forEach((lang) => {
      let hreflangTag = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hreflangTag) {
        hreflangTag = document.createElement('link');
        hreflangTag.setAttribute('rel', 'alternate');
        hreflangTag.setAttribute('hreflang', lang);
        document.head.appendChild(hreflangTag);
      }
      const langPath = pathWithoutLang === '/' ? `/${lang}` : `/${lang}${pathWithoutLang}`;
      hreflangTag.setAttribute('href', `${baseUrl}${langPath}`);
    });

    // Default hreflang
    let defaultHreflang = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement;
    if (!defaultHreflang) {
      defaultHreflang = document.createElement('link');
      defaultHreflang.setAttribute('rel', 'alternate');
      defaultHreflang.setAttribute('hreflang', 'x-default');
      document.head.appendChild(defaultHreflang);
    }
    const defaultPath = pathWithoutLang === '/' ? '/tr' : `/tr${pathWithoutLang}`;
    defaultHreflang.setAttribute('href', `${baseUrl}${defaultPath}`);

  }, [title, description, keywords, image, type, currentUrl, currentLang, location.pathname, defaultImage, baseUrl, ready]);

  return null;
};

export default SEO;

