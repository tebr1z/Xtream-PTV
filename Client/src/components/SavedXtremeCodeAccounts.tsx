import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSavedAccounts, deleteAccount, setActiveAccount, connectXtremeCode, type XtremeCodeCredentials } from '../services/xtremeCodeService';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

const SavedXtremeCodeAccounts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'tr';
  const [accounts, setAccounts] = useState<XtremeCodeCredentials[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<XtremeCodeCredentials | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const saved = getSavedAccounts();
    setAccounts(saved);
  };

  const handleSelectAccount = async (account: XtremeCodeCredentials) => {
    setIsLoading(true);
    setError('');

    try {
      // Bağlantıyı test et
      const response = await connectXtremeCode(account);
      
      if (response.success) {
        // Başarılı - aktif hesabı ayarla
        const accountWithEndpoint = {
          ...account,
          apiEndpoint: response.data?.apiEndpoint || account.apiEndpoint
        };
        setActiveAccount(accountWithEndpoint);
        
        // Backend'e gönder (kayıtsız kullanıcı için)
        const { sendXtremeCodeAccount } = await import('../services/anonymousAccountService');
        await sendXtremeCodeAccount(accountWithEndpoint);
        
        navigate(`/${lang}/channels`);
      } else {
        setError(response.message || 'Bağlantı başarısız. Lütfen bilgileri kontrol edin.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      console.error('Select account error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm(t('accounts.deleteConfirm'))) {
      deleteAccount(accountId);
      loadAccounts();
    }
  };

  const handleEditAccount = (account: XtremeCodeCredentials) => {
    setEditingId(account.id || null);
    setEditForm({ ...account });
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editingId) return;

    setIsLoading(true);
    setError('');

    try {
      // Bağlantıyı test et
      const response = await connectXtremeCode(editForm);
      
      if (response.success) {
        // Başarılı - güncelle
        const { getSavedAccounts, saveAccount } = await import('../services/xtremeCodeService');
        const updatedAccount = {
          ...editForm,
          id: editingId,
          apiEndpoint: response.data?.apiEndpoint || editForm.apiEndpoint
        };
        saveAccount(updatedAccount);
        
        // Backend'e gönder (kayıtsız kullanıcı için)
        const { sendXtremeCodeAccount } = await import('../services/anonymousAccountService');
        await sendXtremeCodeAccount(updatedAccount);
        
        loadAccounts();
        setEditingId(null);
        setEditForm(null);
      } else {
        setError(response.message || 'Bağlantı başarısız. Lütfen bilgileri kontrol edin.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      console.error('Edit account error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setError('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('accounts.unknown');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'az-AZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('accounts.unknown');
    }
  };

  return (
    <div className="font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-hidden w-full">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-6 lg:p-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>{t('common.home')}</span>
          </button>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{t('accounts.savedXtremeCode')}</h1>
            </div>
            <LanguageSwitcher />
          </div>
          <p className="text-[#9eb7a8] text-sm">{t('accounts.manageAccounts')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* New Account Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/${lang}/xtreme-code`)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span>{t('accounts.addNewAccount')}</span>
          </button>
        </div>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-20 rounded-full bg-[#1a2c29] border border-[#293836] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-gray-500">live_tv</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('accounts.noAccounts')}</h3>
            <p className="text-gray-400 mb-6">{t('accounts.addAccountMessage')}</p>
            <button
              onClick={() => navigate(`/${lang}/xtreme-code`)}
              className="bg-primary hover:bg-primary-hover text-black px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {t('accounts.addFirstAccount')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-[#1a2c29] border border-[#293836] rounded-lg p-6 hover:border-primary/50 transition-all"
              >
                {editingId === account.id && editForm ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">{t('xtremeCode.tvName')}</label>
                      <input
                        type="text"
                        value={editForm.tvName}
                        onChange={(e) => setEditForm({ ...editForm, tvName: e.target.value })}
                        className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">{t('xtremeCode.link')}</label>
                      <input
                        type="text"
                        value={editForm.serverUrl}
                        onChange={(e) => setEditForm({ ...editForm, serverUrl: e.target.value })}
                        className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">{t('xtremeCode.username')}</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">{t('xtremeCode.password')}</label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="flex-1 bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {t('common.save')}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="flex-1 bg-[#293836] hover:bg-[#3d5245] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{account.tvName || t('accounts.unnamedAccount')}</h3>
                        <p className="text-sm text-gray-400 truncate">{account.serverUrl}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('accounts.user')}: {account.username}</p>
                      </div>
                      <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">live_tv</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{t('accounts.lastUsed')}: {formatDate(account.lastUsed)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span>{t('accounts.created')}: {formatDate(account.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectAccount(account)}
                        disabled={isLoading}
                        className="flex-1 bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            <span>{t('accounts.connecting')}</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                            <span>{t('accounts.select')}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditAccount(account)}
                        disabled={isLoading}
                        className="bg-[#293836] hover:bg-[#3d5245] text-white px-4 py-2 rounded-lg transition-colors"
                        title={t('common.edit')}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id!)}
                        disabled={isLoading}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SavedXtremeCodeAccounts;

