import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

const Support = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simüle edilmiş gönderim (gerçek uygulamada backend'e gönderilir)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#293836] bg-[#1a2c29]/80 backdrop-blur-md">
          <div className="px-4 md:px-10 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="size-8 text-primary hover:opacity-80 transition-opacity"
              >
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </button>
              <h2 className="text-xl font-bold tracking-tight text-white">{t('common.appName')}</h2>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[#9eb7a8] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span>{t('common.home')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Page Title */}
          <div className="mb-10 text-center">
            <div className="size-16 text-primary mx-auto mb-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">{t('support.title')}</h1>
            <p className="text-[#9eb7a8] text-base max-w-2xl mx-auto">
              {t('support.subtitle')}
            </p>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Xtreme Code Support */}
            <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">dns</span>
                </div>
                <h3 className="text-xl font-bold text-white">Xtreme Code Desteği</h3>
              </div>
              <p className="text-[#9eb7a8] text-sm mb-4">
                Xtreme Code API bağlantı sorunları, hesap yönetimi ve kanal listesi ile ilgili yardım.
              </p>
              <ul className="space-y-2 text-sm text-[#9eb7a8]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>API bağlantı sorunları</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Hesap yönetimi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Kanal listesi sorunları</span>
                </li>
              </ul>
            </div>

            {/* M3U Support */}
            <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined text-2xl">playlist_play</span>
                </div>
                <h3 className="text-xl font-bold text-white">M3U Playlist Desteği</h3>
              </div>
              <p className="text-[#9eb7a8] text-sm mb-4">
                M3U playlist yükleme, kanal görüntüleme ve oynatma sorunları ile ilgili yardım.
              </p>
              <ul className="space-y-2 text-sm text-[#9eb7a8]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-base">check_circle</span>
                  <span>Playlist yükleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-base">check_circle</span>
                  <span>Kanal görüntüleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-base">check_circle</span>
                  <span>Video oynatma sorunları</span>
                </li>
              </ul>
            </div>

            {/* Account Support */}
            <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <h3 className="text-xl font-bold text-white">Hesap Desteği</h3>
              </div>
              <p className="text-[#9eb7a8] text-sm mb-4">
                Kullanıcı hesabı, giriş/çıkış ve yetkilendirme sorunları ile ilgili yardım.
              </p>
              <ul className="space-y-2 text-sm text-[#9eb7a8]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-base">check_circle</span>
                  <span>Giriş/çıkış sorunları</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-base">check_circle</span>
                  <span>Şifre sıfırlama</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-base">check_circle</span>
                  <span>Yetkilendirme sorunları</span>
                </li>
              </ul>
            </div>

            {/* Technical Support */}
            <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                  <span className="material-symbols-outlined text-2xl">build</span>
                </div>
                <h3 className="text-xl font-bold text-white">Teknik Destek</h3>
              </div>
              <p className="text-[#9eb7a8] text-sm mb-4">
                Genel teknik sorunlar, hata raporları ve özellik önerileri.
              </p>
              <ul className="space-y-2 text-sm text-[#9eb7a8]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400 text-base">check_circle</span>
                  <span>Hata raporları</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400 text-base">check_circle</span>
                  <span>Özellik önerileri</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400 text-base">check_circle</span>
                  <span>Performans sorunları</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t('support.contactForm')}</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {t('support.success')}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {t('support.error')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    {t('support.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder={t('support.name')}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    {t('support.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder={t('support.email')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                  {t('support.subject')} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">{t('support.subject')}</option>
                  <option value="xtreme-code">{t('support.xtremeCodeSupport')}</option>
                  <option value="m3u">{t('support.m3uSupport')}</option>
                  <option value="account">{t('support.contactForm')}</option>
                  <option value="technical">{t('support.contactForm')}</option>
                  <option value="feature">{t('support.contactForm')}</option>
                  <option value="bug">{t('support.contactForm')}</option>
                  <option value="other">{t('common.other')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  {t('support.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder={t('support.message')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>{t('support.sending')}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    <span>{t('support.send')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">{t('support.faq')}</h2>
            <div className="space-y-4">
              <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{t('support.faq1')}</h3>
                <p className="text-[#9eb7a8] text-sm">
                  {t('support.faq1Answer')}
                </p>
              </div>
              <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{t('support.faq2')}</h3>
                <p className="text-[#9eb7a8] text-sm">
                  {t('support.faq2Answer')}
                </p>
              </div>
              <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{t('support.faq3')}</h3>
                <p className="text-[#9eb7a8] text-sm">
                  {t('support.faq3Answer')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Support;

