import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

const CookiePolicy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'tr';

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
            <button
              onClick={() => navigate(`/${lang}`)}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="size-8 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">{t('common.appName')}</h2>
            </button>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate(`/${lang}`)}
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
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6 md:p-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('cookie.title')}</h1>
            <p className="text-[#9eb7a8] mb-8 text-sm md:text-base leading-relaxed">
              {t('cookie.lastUpdated')}: {new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'az-AZ')}
            </p>

            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.introduction.title')}</h2>
                <p className="text-[#9eb7a8] leading-relaxed mb-4">{t('cookie.introduction.text1')}</p>
                <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.introduction.text2')}</p>
              </section>

              {/* What are Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.whatAreCookies.title')}</h2>
                <p className="text-[#9eb7a8] leading-relaxed mb-4">{t('cookie.whatAreCookies.text1')}</p>
                <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.whatAreCookies.text2')}</p>
              </section>

              {/* Types of Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.types.title')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('cookie.types.essential.title')}</h3>
                    <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.types.essential.text')}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('cookie.types.functional.title')}</h3>
                    <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.types.functional.text')}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('cookie.types.analytics.title')}</h3>
                    <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.types.analytics.text')}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('cookie.types.marketing.title')}</h3>
                    <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.types.marketing.text')}</p>
                  </div>
                </div>
              </section>

              {/* Cookies We Use */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.weUse.title')}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#293836]">
                        <th className="text-left py-3 px-4 text-white font-semibold">{t('cookie.weUse.table.name')}</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">{t('cookie.weUse.table.purpose')}</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">{t('cookie.weUse.table.duration')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#293836]">
                        <td className="py-3 px-4 text-[#9eb7a8]">authToken</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.authToken')}</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.session')}</td>
                      </tr>
                      <tr className="border-b border-[#293836]">
                        <td className="py-3 px-4 text-[#9eb7a8]">user</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.user')}</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.session')}</td>
                      </tr>
                      <tr className="border-b border-[#293836]">
                        <td className="py-3 px-4 text-[#9eb7a8]">i18nextLng</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.language')}</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.persistent')}</td>
                      </tr>
                      <tr className="border-b border-[#293836]">
                        <td className="py-3 px-4 text-[#9eb7a8]">cookieConsent</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.consent')}</td>
                        <td className="py-3 px-4 text-[#9eb7a8]">{t('cookie.weUse.table.persistent')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.managing.title')}</h2>
                <p className="text-[#9eb7a8] leading-relaxed mb-4">{t('cookie.managing.text1')}</p>
                <p className="text-[#9eb7a8] leading-relaxed mb-4">{t('cookie.managing.text2')}</p>
                <ul className="list-disc list-inside text-[#9eb7a8] space-y-2 ml-4">
                  <li>{t('cookie.managing.option1')}</li>
                  <li>{t('cookie.managing.option2')}</li>
                  <li>{t('cookie.managing.option3')}</li>
                </ul>
              </section>

              {/* Third-Party Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.thirdParty.title')}</h2>
                <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.thirdParty.text')}</p>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.updates.title')}</h2>
                <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.updates.text')}</p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">{t('cookie.contact.title')}</h2>
                <p className="text-[#9eb7a8] leading-relaxed">{t('cookie.contact.text')}</p>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CookiePolicy;

