import { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import StreamHub from './components/StreamHub'
import XtremeCodeLogin from './components/XtremeCodeLogin'
import SavedXtremeCodeAccounts from './components/SavedXtremeCodeAccounts'
import M3ULogin from './components/M3ULogin'
import SavedM3UAccounts from './components/SavedM3UAccounts'
import Auth from './components/Auth'
import ChannelList from './components/ChannelList'
import VideoPlayer from './components/VideoPlayer'
import AdminPanel from './components/AdminPanel'
import UserPanel from './components/UserPanel'
import NotFound from './components/NotFound'
import Support from './components/Support'
import SupportDetail from './components/SupportDetail'
import SupportTicketsList from './components/SupportTicketsList'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import CookiePolicy from './components/CookiePolicy'
import VerifyEmail from './components/VerifyEmail'
import ResetPassword from './components/ResetPassword'
import LanguageRoutes from './components/LanguageRoute'
import './App.css'

// Dil algılama ve yönlendirme bileşeni
const LanguageRedirect = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [targetLang, setTargetLang] = useState<string | null>(null);

  useEffect(() => {
    const detectLanguage = async () => {
      const supportedLangs = ['tr', 'en', 'ru', 'az'];

      // 1) localStorage'daki tercih
      const savedLang = localStorage.getItem('i18nextLng')?.split('-')[0];
      if (savedLang && supportedLangs.includes(savedLang)) {
        i18n.changeLanguage(savedLang);
        document.documentElement.setAttribute('lang', savedLang);
        setTargetLang(savedLang);
        return;
      }

      // 2) IP ile ülke tespiti
      try {
        const resp = await fetch('https://ipapi.co/json/');
        if (resp.ok) {
          const data = await resp.json();
          const countryCode = (data?.country_code || '').toUpperCase();

          let langFromIp: string | null = null;
          if (countryCode === 'AZ') langFromIp = 'az';
          else if (countryCode === 'TR') langFromIp = 'tr';
          else if (['RU', 'BY', 'KZ', 'KG'].includes(countryCode)) langFromIp = 'ru';

          // Bizde olmayan ülke ise varsayılan EN
          const finalLang = langFromIp && supportedLangs.includes(langFromIp) ? langFromIp : 'en';

          i18n.changeLanguage(finalLang);
          localStorage.setItem('i18nextLng', finalLang);
          document.documentElement.setAttribute('lang', finalLang);
          setTargetLang(finalLang);
          return;
        }
      } catch (e) {
        console.warn('IP based language detection failed:', e);
      }

      // 3) Tarayıcı dili fallback
      const browserLang = navigator.language.split('-')[0];
      const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'az';

      i18n.changeLanguage(detectedLang);
      localStorage.setItem('i18nextLng', detectedLang);
      document.documentElement.setAttribute('lang', detectedLang);
      setTargetLang(detectedLang);
    };

    // Sadece bir kere çalışsın
    if (!targetLang) {
      detectLanguage();
    }
  }, [i18n, targetLang]);

  // Dil henüz tespit edilmediyse bekle (boş ekran yerine istersen küçük loader eklenebilir)
  if (!targetLang) {
    return null;
  }

  // Ana sayfaya yönlendir, dil prefix'i ile
  const supportedLangs = ['tr', 'en', 'ru', 'az'];
  const lang = supportedLangs.includes(targetLang) ? targetLang : 'az';
  const path = location.pathname === '/' ? '' : location.pathname;

  return <Navigate to={`/${lang}${path}${location.search}`} replace />;
};

function App() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <BrowserRouter>
        <Routes>
          {/* Ana sayfa - dil algılama ve yönlendirme */}
          <Route path="/" element={<LanguageRedirect />} />
          
          {/* Dil prefix'li route'lar */}
          <Route path="/:lang" element={<LanguageRoutes />}>
            <Route index element={<StreamHub />} />
            <Route path="xtreme-code" element={<XtremeCodeLogin />} />
            <Route path="xtreme-code-list" element={<SavedXtremeCodeAccounts />} />
            <Route path="m3u-playlist" element={<M3ULogin />} />
            <Route path="m3u-list" element={<SavedM3UAccounts />} />
            <Route path="login" element={<Auth />} />
            <Route path="channels" element={<ChannelList />} />
            <Route path="player" element={<VideoPlayer />} />
            <Route path="t4br1z" element={<AdminPanel />} />
            <Route path="user" element={<UserPanel />} />
            <Route path="support" element={<Support />} />
            <Route path="support/tickets" element={<SupportTicketsList />} />
            <Route path="support/:supportId" element={<SupportDetail />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Verify Email - dil prefix'i olmadan */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Reset Password - dil prefix'i olmadan */}
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Eski URL'ler için yönlendirme (SEO için) */}
          <Route path="/xtreme-code" element={<LanguageRedirect />} />
          <Route path="/xtreme-code-list" element={<LanguageRedirect />} />
          <Route path="/m3u-playlist" element={<LanguageRedirect />} />
          <Route path="/m3u-list" element={<LanguageRedirect />} />
          <Route path="/login" element={<LanguageRedirect />} />
          <Route path="/channels" element={<LanguageRedirect />} />
          <Route path="/player" element={<LanguageRedirect />} />
          <Route path="/t4br1z" element={<LanguageRedirect />} />
          <Route path="/user" element={<LanguageRedirect />} />
          <Route path="/support" element={<LanguageRedirect />} />
          <Route path="/terms" element={<LanguageRedirect />} />
          <Route path="/privacy" element={<LanguageRedirect />} />
          <Route path="/cookie-policy" element={<LanguageRedirect />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
