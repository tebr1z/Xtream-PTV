import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import SEO from './SEO';
import LanguageSwitcher from './LanguageSwitcher';

interface UserReply {
  message: string;
  createdAt: string;
}

interface AdminReply {
  message: string;
  createdAt: string;
}

interface SupportTicket {
  supportId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
  adminReplies?: AdminReply[];
  userReplies?: UserReply[];
  createdAt: string;
  updatedAt: string;
}

const SupportDetail = () => {
  const { supportId } = useParams<{ supportId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const lang = i18n.language.split('-')[0] || 'az';

  useEffect(() => {
    const fetchTicket = async () => {
      if (!supportId) {
        setError('Destek talebi ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/support/${supportId}`);
        const data = await response.json();

        if (data.success && data.ticket) {
          setTicket(data.ticket);
        } else {
          setError(data.message || 'Destek talebi bulunamadı');
        }
      } catch (err) {
        setError('Destek talebi yüklenirken bir hata oluştu');
        console.error('Fetch ticket error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [supportId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      setSubmitError('Mesaj boş olamaz');
      return;
    }

    if (!supportId) {
      setSubmitError('Destek talebi ID bulunamadı');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/support/${supportId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: replyMessage.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setReplyMessage('');
        setSubmitSuccess(true);
        // Ticket'ı yeniden yükle
        const ticketResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/support/${supportId}`
        );
        const ticketData = await ticketResponse.json();
        if (ticketData.success && ticketData.ticket) {
          setTicket(ticketData.ticket);
        }
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(data.message || 'Cevap gönderilirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Submit reply error:', err);
      setSubmitError('Cevap gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, Record<string, string>> = {
      tr: {
        pending: 'Beklemede',
        in_progress: 'İşleniyor',
        resolved: 'Çözüldü',
        closed: 'Kapatıldı',
      },
      en: {
        pending: 'Pending',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed',
      },
      ru: {
        pending: 'В ожидании',
        in_progress: 'В процессе',
        resolved: 'Решено',
        closed: 'Закрыто',
      },
      az: {
        pending: 'Gözləyir',
        in_progress: 'İşlənir',
        resolved: 'Həll edildi',
        closed: 'Bağlandı',
      },
    };
    return statusMap[lang]?.[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-white text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background-dark">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto bg-surface-dark rounded-xl p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">{error || 'Destek talebi bulunamadı'}</h1>
            <button
              onClick={() => navigate(`/${lang}`)}
              className="mt-6 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            >
              {t('common.home')}
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
        title={`${t('support.ticket')} #${ticket.supportId}`}
        description={`${ticket.subject} - ${t('support.detail')}`}
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

        {/* Ticket Card */}
        <div className="max-w-4xl mx-auto bg-surface-dark rounded-xl p-8 border border-white/10">
          {/* Ticket ID & Status */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
            <div>
              <p className="text-slate-400 text-sm mb-1">{t('support.ticketId')}</p>
              <p className="text-2xl font-bold text-white font-mono tracking-wider">{ticket.supportId}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${getStatusColor(ticket.status)}`}>
              {getStatusText(ticket.status)}
            </div>
          </div>

          {/* Ticket Info */}
          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">{t('support.subject')}</p>
              <p className="text-xl font-semibold text-white">{ticket.subject}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('support.name')}</p>
                <p className="text-white">{ticket.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('support.email')}</p>
                <p className="text-white">{ticket.email}</p>
              </div>
            </div>

            {/* Chat Benzeri Mesaj Geçmişi - WhatsApp Tarzı */}
            <div>
              <p className="text-slate-400 text-sm mb-3 font-medium">{t('support.messageHistory') || 'Mesaj Geçmişi'}</p>
              <div className="space-y-3 max-h-[500px] overflow-y-auto bg-background-dark rounded-lg p-4 border border-white/5">
                {(() => {
                  // Tüm mesajları birleştir ve zaman sırasına göre sırala
                  const allMessages: Array<{
                    type: 'user' | 'admin';
                    message: string;
                    createdAt: string;
                    senderName: string;
                  }> = [];

                  // İlk müşteri mesajı
                  allMessages.push({
                    type: 'user',
                    message: ticket.message,
                    createdAt: ticket.createdAt,
                    senderName: ticket.name,
                  });

                  // Müşteri cevapları
                  if (ticket.userReplies && ticket.userReplies.length > 0) {
                    ticket.userReplies.forEach((reply) => {
                      allMessages.push({
                        type: 'user',
                        message: reply.message,
                        createdAt: reply.createdAt,
                        senderName: ticket.name,
                      });
                    });
                  }

                  // Admin cevapları
                  if (ticket.adminReplies && Array.isArray(ticket.adminReplies) && ticket.adminReplies.length > 0) {
                    ticket.adminReplies.forEach((reply) => {
                      allMessages.push({
                        type: 'admin',
                        message: reply.message,
                        createdAt: reply.createdAt,
                        senderName: t('support.admin') || 'Yönetici',
                      });
                    });
                  }

                  // Eski adminNotes (geriye dönük uyumluluk)
                  if (ticket.adminNotes && (!ticket.adminReplies || ticket.adminReplies.length === 0)) {
                    allMessages.push({
                      type: 'admin',
                      message: ticket.adminNotes,
                      createdAt: ticket.updatedAt,
                      senderName: t('support.admin') || 'Yönetici',
                    });
                  }

                  // Zaman sırasına göre sırala
                  allMessages.sort((a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  });

                  return allMessages.map((msg, index) => {
                    const isUser = msg.type === 'user';
                    return (
                      <div
                        key={`msg-${index}`}
                        className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} max-w-[75%]`}>
                          {/* Gönderen ve Tarih */}
                          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span className={`text-xs font-medium ${isUser ? 'text-slate-400' : 'text-primary'}`}>
                              {msg.senderName}
                            </span>
                            <span className={`text-xs ${isUser ? 'text-slate-500' : 'text-primary/70'}`}>
                              {new Date(msg.createdAt).toLocaleString(
                                lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : lang === 'az' ? 'az-AZ' : 'en-US',
                                {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>
                          {/* Mesaj Balonu */}
                          <div
                            className={`p-3 rounded-2xl ${
                              isUser
                                ? 'bg-surface-dark border border-white/5 rounded-tl-none'
                                : 'bg-primary/20 border border-primary/30 rounded-tr-none'
                            }`}
                          >
                            <p className="text-white whitespace-pre-wrap leading-relaxed text-sm">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Reply Form - Sadece closed değilse göster */}
            {ticket.status !== 'closed' && (
              <div className="pt-6 border-t border-white/10">
                <p className="text-slate-400 text-sm mb-3">{t('support.replyToTicket')}</p>
                {submitSuccess && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{t('support.replySent')}</p>
                  </div>
                )}
                {submitError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}
                <form onSubmit={handleSubmitReply}>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={t('support.replyPlaceholder')}
                    className="w-full bg-background-dark border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none mb-3"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyMessage.trim()}
                    className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t('common.loading') : t('support.sendReply')}
                  </button>
                </form>
              </div>
            )}

            {ticket.status === 'closed' && (
              <div className="pt-6 border-t border-white/10">
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">{t('support.ticketClosed')}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('support.createdAt')}</p>
                <p className="text-white">
                  {new Date(ticket.createdAt).toLocaleString(lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : lang === 'az' ? 'az-AZ' : 'en-US')}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('support.updatedAt')}</p>
                <p className="text-white">
                  {new Date(ticket.updatedAt).toLocaleString(lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : lang === 'az' ? 'az-AZ' : 'en-US')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SupportDetail;

