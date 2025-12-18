import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import SEO from './SEO';
import LanguageSwitcher from './LanguageSwitcher';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const lang = i18n.language.split('-')[0] || 'az';
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  // Email parametresi varsa, resend için kullan
  useEffect(() => {
    if (emailParam && !email) {
      setEmail(emailParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam]);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Doğrulama token\'ı bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-email?token=${token}`
        );
        const data = await response.json();

        if (data.success) {
          setSuccess(true);
        } else {
          setError(data.message || 'Email doğrulama başarısız.');
        }
      } catch (err) {
        setError('Email doğrulama sırasında bir hata oluştu.');
        console.error('Verify email error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResendVerification = async () => {
    if (!email) {
      setError('Lütfen email adresinizi girin.');
      return;
    }

    setResending(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResendSuccess(true);
      } else {
        setError(data.message || 'Email gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      setError('Email gönderilirken bir hata oluştu.');
      console.error('Resend verification error:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <SEO
        title={t('auth.verifyEmail') || 'Email Doğrulama'}
        description="Email adresinizi doğrulayın"
        lang={lang}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/${lang}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>{t('common.back')}</span>
          </button>
          <LanguageSwitcher />
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto bg-surface-dark rounded-xl p-8 border border-white/10">
          {loading ? (
            <div className="text-center">
              <div className="text-white text-lg mb-4">{t('common.loading')}</div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-white mb-4">
                {t('auth.emailVerified') || 'Email Adresiniz Doğrulandı!'}
              </h1>
              <p className="text-slate-400 mb-6">
                {t('auth.emailVerifiedMessage') || 'Email adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.'}
              </p>
              <button
                onClick={() => navigate(`/${lang}/login`)}
                className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-medium"
              >
                {t('common.login')}
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="text-yellow-400 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-white mb-4">
                  {t('auth.emailVerificationFailed') || 'Email Doğrulama Başarısız'}
                </h1>
                <p className="text-slate-400 mb-4">{error}</p>
              </div>

              {/* Resend Verification */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {t('auth.resendVerification') || 'Doğrulama Email\'ini Tekrar Gönder'}
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('support.email') || 'Email'}
                    className="w-full bg-background-dark border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  {resendSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">
                        {t('auth.resendSuccess') || 'Doğrulama email\'i başarıyla gönderildi. Lütfen email kutunuzu kontrol edin.'}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleResendVerification}
                    disabled={resending || !email}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? t('common.loading') : t('auth.sendVerification') || 'Doğrulama Email\'i Gönder'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyEmail;

