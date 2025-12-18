import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EmailVerificationBanner = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const lang = i18n.language.split('-')[0] || 'az';

  useEffect(() => {
    const checkEmailVerification = async () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setShowBanner(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // Eğer email zaten doğrulanmışsa banner'ı gösterme
        if (user.emailVerified) {
          setShowBanner(false);
          return;
        }

        // Backend'den güncel kullanıcı bilgilerini al
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            if (data.user.emailVerified) {
              setShowBanner(false);
              // localStorage'ı güncelle
              const updatedUser = { ...user, emailVerified: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              return;
            }
            setUserEmail(data.user.email || user.email);
            setShowBanner(true);
          }
        }
      } catch (err) {
        console.error('Check email verification error:', err);
        // Hata olsa bile kullanıcı bilgilerini kontrol et
        const user = JSON.parse(userStr);
        if (!user.emailVerified) {
          setUserEmail(user.email);
          setShowBanner(true);
        }
      }
    };

    checkEmailVerification();
  }, []);

  const handleResendVerification = async () => {
    if (!userEmail) {
      setError('Email adresi bulunamadı.');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccess(false);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setRemainingCount(data.remainingCount !== undefined ? data.remainingCount : null);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(data.message || 'Email gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError('Email gönderilirken bir hata oluştu.');
    } finally {
      setIsResending(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="material-symbols-outlined text-yellow-400">warning</span>
          <div className="flex-1">
            <p className="text-yellow-300 text-sm font-medium">
              {t('auth.verifyEmailBanner') || 'Email adresinizi doğrulamanız gerekiyor. Lütfen email kutunuzu kontrol edin.'}
            </p>
            {error && (
              <p className="text-red-400 text-xs mt-1">{error}</p>
            )}
            {success && (
              <p className="text-green-400 text-xs mt-1">
                {t('auth.resendSuccess') || 'Doğrulama email\'i başarıyla gönderildi.'}
                {remainingCount !== null && remainingCount >= 0 && (
                  <span className="ml-2">
                    ({t('auth.remainingEmails') || 'Kalan'}: {remainingCount})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending 
              ? (t('common.loading') || 'Gönderiliyor...') 
              : (t('auth.resendVerification') || 'Yeniden Gönder')
            }
          </button>
          <button
            onClick={() => navigate(`/verify-email?email=${encodeURIComponent(userEmail)}`)}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t('auth.verifyEmail') || 'Email Doğrula'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;

