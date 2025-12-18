import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import SEO from './SEO';
import LanguageSwitcher from './LanguageSwitcher';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const lang = i18n.language.split('-')[0] || 'az';
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Şifre sıfırlama token\'ı bulunamadı.');
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Tüm alanlar doldurulmalıdır.');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/${lang}/login`);
        }, 3000);
      } else {
        setError(data.message || 'Şifre sıfırlama başarısız.');
      }
    } catch (err) {
      setError('Şifre sıfırlama sırasında bir hata oluştu.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background-dark">
        <SEO
          title={t('auth.resetPassword') || 'Şifre Sıfırlama'}
          description="Şifrenizi sıfırlayın"
          lang={lang}
        />
        
        <div className="container mx-auto px-4 py-8">
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

          <div className="max-w-md mx-auto bg-surface-dark rounded-xl p-8 border border-white/10 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {t('auth.invalidToken') || 'Geçersiz Token'}
            </h1>
            <p className="text-slate-400 mb-6">
              {t('auth.invalidTokenMessage') || 'Şifre sıfırlama token\'ı bulunamadı veya geçersiz.'}
            </p>
            <button
              onClick={() => navigate(`/${lang}/login`)}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-medium"
            >
              {t('common.login')}
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <SEO
        title={t('auth.resetPassword') || 'Şifre Sıfırlama'}
        description="Şifrenizi sıfırlayın"
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
          {success ? (
            <div className="text-center">
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-white mb-4">
                {t('auth.passwordResetSuccess') || 'Şifreniz Başarıyla Sıfırlandı!'}
              </h1>
              <p className="text-slate-400 mb-6">
                {t('auth.passwordResetSuccessMessage') || 'Şifreniz başarıyla sıfırlandı. Yönlendiriliyorsunuz...'}
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
                <h1 className="text-2xl font-bold text-white mb-2">
                  {t('auth.resetPassword') || 'Şifre Sıfırlama'}
                </h1>
                <p className="text-slate-400 text-sm">
                  {t('auth.resetPasswordMessage') || 'Yeni şifrenizi belirleyin'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    {t('auth.newPassword') || 'Yeni Şifre'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder={t('auth.newPasswordPlaceholder') || 'En az 8 karakter'}
                      className="w-full bg-background-dark border border-white/10 text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    {t('auth.confirmPassword') || 'Yeni Şifre (Tekrar)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder={t('auth.confirmPasswordPlaceholder') || 'Şifreyi tekrar girin'}
                      className="w-full bg-background-dark border border-white/10 text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.loading') : t('auth.resetPassword') || 'Şifreyi Sıfırla'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;

