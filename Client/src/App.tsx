import { Suspense, useEffect } from 'react'
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
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import LanguageRoutes from './components/LanguageRoute'
import './App.css'

// Dil algılama ve yönlendirme bileşeni
const LanguageRedirect = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Tarayıcı dilini algıla
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['tr', 'en', 'ru', 'az'];
    const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'tr';
    
    // localStorage'dan dil tercihini kontrol et
    const savedLang = localStorage.getItem('i18nextLng')?.split('-')[0];
    const lang = savedLang && supportedLangs.includes(savedLang) ? savedLang : detectedLang;
    
    i18n.changeLanguage(lang);
  }, [i18n]);

  // Ana sayfaya yönlendir, dil prefix'i ile
  const currentLang = i18n.language?.split('-')[0] || 'tr';
  const supportedLangs = ['tr', 'en', 'ru', 'az'];
  const lang = supportedLangs.includes(currentLang) ? currentLang : 'tr';
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
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          
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
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
