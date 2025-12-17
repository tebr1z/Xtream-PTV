import { Route, Navigate, useParams, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const LanguageWrapper = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    const supportedLangs = ['tr', 'en', 'ru', 'az'];
    if (lang && supportedLangs.includes(lang)) {
      i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
      document.documentElement.setAttribute('lang', lang);
    }
  }, [lang, i18n]);

  return <Outlet />;
};

const LanguageRoutes = () => {
  const { lang } = useParams<{ lang: string }>();
  const supportedLangs = ['tr', 'en', 'ru', 'az'];

  // Eğer geçersiz bir dil kodu varsa, varsayılan dile yönlendir
  if (lang && !supportedLangs.includes(lang)) {
    return <Navigate to="/tr" replace />;
  }

  return <LanguageWrapper />;
};

export default LanguageRoutes;

