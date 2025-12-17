import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

const PrivacyPolicy = () => {
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
          {/* Page Title */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">{t('privacy.title')}</h1>
            <p className="text-[#9eb7a8] text-sm">{t('privacy.lastUpdated')}: {new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6 md:p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.introduction')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.introText1')}
              </p>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.introText2')}
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section1')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section1_1')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section1_1Text')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section1_2')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section1_2Text')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section1_3')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section1_3Text')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section1_4')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section1_4Text')}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section2')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed mb-4">{t('privacy.section2Intro')}</p>
              <ul className="list-disc list-inside text-[#9eb7a8] space-y-2 ml-4">
                <li>{t('privacy.section2Item1')}</li>
                <li>{t('privacy.section2Item2')}</li>
                <li>{t('privacy.section2Item3')}</li>
                <li>{t('privacy.section2Item4')}</li>
                <li>{t('privacy.section2Item5')}</li>
                <li>{t('privacy.section2Item6')}</li>
                <li>{t('privacy.section2Item7')}</li>
                <li>{t('privacy.section2Item8')}</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section3')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section3Intro')}
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section3_1')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section3_1Text')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section3_2')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section3_2Text')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section3_3')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section3_3Text')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('privacy.section3_4')}</h3>
                  <p className="text-[#9eb7a8] leading-relaxed">
                    {t('privacy.section3_4Text')}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section4')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section4Intro')}
              </p>
              <ul className="list-disc list-inside text-[#9eb7a8] space-y-2 ml-4 mt-4">
                <li>{t('privacy.section4Item1')}</li>
                <li>{t('privacy.section4Item2')}</li>
                <li>{t('privacy.section4Item3')}</li>
                <li>{t('privacy.section4Item4')}</li>
                <li>{t('privacy.section4Item5')}</li>
              </ul>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section4Text')}
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section5')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section5Text1')}
              </p>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section5Text2')}
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section6')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed mb-4">
                {t('privacy.section6Intro')}
              </p>
              <ul className="list-disc list-inside text-[#9eb7a8] space-y-2 ml-4">
                <li><strong className="text-white">{t('privacy.section6Item1')}</strong> {t('privacy.section6Item1Text')}</li>
                <li><strong className="text-white">{t('privacy.section6Item2')}</strong> {t('privacy.section6Item2Text')}</li>
                <li><strong className="text-white">{t('privacy.section6Item3')}</strong> {t('privacy.section6Item3Text')}</li>
                <li><strong className="text-white">{t('privacy.section6Item4')}</strong> {t('privacy.section6Item4Text')}</li>
                <li><strong className="text-white">{t('privacy.section6Item5')}</strong> {t('privacy.section6Item5Text')}</li>
                <li><strong className="text-white">{t('privacy.section6Item6')}</strong> {t('privacy.section6Item6Text')}</li>
              </ul>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section6Text')}
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section7')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section7Text1')}
              </p>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section7Text2')}
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section8')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section8Text')}
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section9')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section9Text1')}
              </p>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section9Text2')}
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section10')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section10Text1')}
              </p>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section10Text2')}
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section11')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section11Text1')}
              </p>
              <p className="text-[#9eb7a8] leading-relaxed mt-4">
                {t('privacy.section11Text2')}
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section12')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section12Text')}
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('privacy.section13')}</h2>
              <p className="text-[#9eb7a8] leading-relaxed">
                {t('privacy.section13Text')}
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

