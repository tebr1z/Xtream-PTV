import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';
import SEO from './SEO';

interface SupportTicket {
  supportId: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  lang: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  adminReplies?: Array<{ message: string; createdAt: string }>;
  userReplies?: Array<{ message: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  isImportant?: boolean;
}

const SupportTicketsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = params.lang || 'az';
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Kullanıcı email'ini localStorage'dan al
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserEmail(userData.email || '');
      } catch (e) {
        console.error('User data parse error:', e);
      }
    }
  }, []);

  // Ticket'ları yükle
  useEffect(() => {
    const fetchTickets = async () => {
      if (!userEmail) return;
      
      setLoading(true);
      try {
        const backendUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/support/user/${encodeURIComponent(userEmail)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tickets) {
            // Okunma durumunu localStorage'dan yükle
            const readTickets = JSON.parse(localStorage.getItem('readTickets') || '[]');
            const importantTickets = JSON.parse(localStorage.getItem('importantTickets') || '[]');
            
            const ticketsWithStatus = data.tickets.map((ticket: SupportTicket) => ({
              ...ticket,
              isRead: readTickets.includes(ticket.supportId),
              isImportant: importantTickets.includes(ticket.supportId),
            }));
            
            setTickets(ticketsWithStatus);
          }
        }
      } catch (err) {
        console.error('Fetch tickets error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userEmail]);

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = [...tickets];

    // Status filtresi
    if (activeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === activeFilter);
    }

    // Kategori filtresi
    if (activeCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === activeCategory);
    }

    // Arama
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(query) ||
        ticket.message.toLowerCase().includes(query) ||
        ticket.supportId.toLowerCase().includes(query)
      );
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    setFilteredTickets(filtered);
  }, [tickets, activeFilter, activeCategory, searchQuery]);

  // URL'den ticket ID al
  useEffect(() => {
    const ticketId = searchParams.get('ticket');
    if (ticketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.supportId === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
        markAsRead(ticket.supportId);
      }
    }
  }, [searchParams, tickets]);

  const markAsRead = (ticketId: string) => {
    const readTickets = JSON.parse(localStorage.getItem('readTickets') || '[]');
    if (!readTickets.includes(ticketId)) {
      readTickets.push(ticketId);
      localStorage.setItem('readTickets', JSON.stringify(readTickets));
      setTickets(prev => prev.map(t => t.supportId === ticketId ? { ...t, isRead: true } : t));
    }
  };

  const toggleImportant = (ticketId: string) => {
    const importantTickets = JSON.parse(localStorage.getItem('importantTickets') || '[]');
    const index = importantTickets.indexOf(ticketId);
    
    if (index > -1) {
      importantTickets.splice(index, 1);
    } else {
      importantTickets.push(ticketId);
    }
    
    localStorage.setItem('importantTickets', JSON.stringify(importantTickets));
    setTickets(prev => prev.map(t => 
      t.supportId === ticketId ? { ...t, isImportant: !t.isImportant } : t
    ));
    
    if (selectedTicket?.supportId === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, isImportant: !prev.isImportant } : null);
    }
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    markAsRead(ticket.supportId);
    setSearchParams({ ticket: ticket.supportId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    return t(`support.status.${status}`) || status;
  };

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'general': t('support.categoryGeneral'),
      'bug_report': t('support.categoryBugReport'),
      'xtreme_code': t('support.categoryXtremeCode'),
      'm3u': t('support.categoryM3U'),
      'account': t('support.categoryAccount'),
      'technical': t('support.categoryTechnical'),
      'feature_request': t('support.categoryFeatureRequest'),
      'other': t('support.categoryOther'),
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return t('support.yesterday') || 'Yesterday';
    } else if (days < 7) {
      return `${days} ${t('support.daysAgo') || 'days ago'}`;
    } else {
      return date.toLocaleDateString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getUnreadCount = () => {
    return tickets.filter(t => !t.isRead).length;
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">{t('support.loginRequired') || 'Please log in to view your support tickets.'}</p>
          <button
            onClick={() => navigate(`/${lang}/login`)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            {t('common.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={t('support.myTickets') || 'My Support Tickets'}
        description={t('support.myTicketsDesc') || 'View and manage your support tickets'}
      />
      <div className="font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col">
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
                onClick={() => setShowCompose(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                <span>{t('support.newTicket') || 'New Ticket'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Gmail Style */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Categories */}
          <aside className="w-64 border-r border-[#293836] bg-[#1a2c29] overflow-y-auto hidden md:block">
            <div className="p-4">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setActiveCategory('all');
                  setSelectedTicket(null);
                  setSearchParams({});
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center justify-between transition-colors ${
                  activeFilter === 'all' && activeCategory === 'all'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-gray-300 hover:bg-[#293836]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">inbox</span>
                  <span>{t('support.allTickets') || 'All Tickets'}</span>
                </div>
                {getUnreadCount() > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {getUnreadCount()}
                  </span>
                )}
              </button>

              <div className="mt-4 mb-2 px-4 text-xs text-gray-400 uppercase">
                {t('support.status') || 'Status'}
              </div>
              
              {['pending', 'in_progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveFilter(status as any);
                    setSelectedTicket(null);
                    setSearchParams({});
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center gap-3 transition-colors ${
                    activeFilter === status
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-gray-300 hover:bg-[#293836]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {status === 'pending' ? 'schedule' : 
                     status === 'in_progress' ? 'sync' : 
                     status === 'resolved' ? 'check_circle' : 'archive'}
                  </span>
                  <span>{getStatusText(status)}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {tickets.filter(t => t.status === status).length}
                  </span>
                </button>
              ))}

              <div className="mt-4 mb-2 px-4 text-xs text-gray-400 uppercase">
                {t('support.category') || 'Category'}
              </div>

              {['all', 'bug_report', 'xtreme_code', 'm3u', 'account', 'technical', 'feature_request', 'other'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedTicket(null);
                    setSearchParams({});
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center gap-3 transition-colors ${
                    activeCategory === category
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-gray-300 hover:bg-[#293836]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {category === 'bug_report' ? 'bug_report' :
                     category === 'xtreme_code' ? 'dns' :
                     category === 'm3u' ? 'playlist_play' :
                     category === 'account' ? 'person' :
                     category === 'technical' ? 'build' :
                     category === 'feature_request' ? 'lightbulb' : 'folder'}
                  </span>
                  <span>{category === 'all' ? (t('support.allCategories') || 'All') : getCategoryText(category)}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Center - Ticket List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-[#293836] bg-[#1a2c29]">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <span className="material-symbols-outlined">search</span>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('support.searchTickets') || 'Search tickets...'}
                  className="w-full pl-10 pr-4 py-2 bg-[#11211e] border border-[#293836] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">{t('common.loading')}</div>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                  <p>{t('support.noTickets') || 'No tickets found'}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#293836]">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.supportId}
                      onClick={() => handleTicketClick(ticket)}
                      className={`p-4 cursor-pointer hover:bg-[#293836]/50 transition-colors ${
                        selectedTicket?.supportId === ticket.supportId ? 'bg-[#293836] border-l-4 border-primary' : ''
                      } ${!ticket.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImportant(ticket.supportId);
                          }}
                          className={`mt-1 ${ticket.isImportant ? 'text-yellow-400' : 'text-gray-500'}`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {ticket.isImportant ? 'star' : 'star_border'}
                          </span>
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!ticket.isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                            <span className="font-semibold text-white truncate">
                              {ticket.subject}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(ticket.status)}`}>
                              {getStatusText(ticket.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate mb-1">
                            {ticket.message.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{ticket.supportId}</span>
                            <span>{formatDate(ticket.updatedAt)}</span>
                            <span className="px-2 py-0.5 bg-primary/20 text-primary rounded">
                              {getCategoryText(ticket.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Ticket Detail (Gmail style) */}
          {selectedTicket && (
            <div className="w-full md:w-1/2 lg:w-2/5 border-l border-[#293836] bg-[#1a2c29] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleImportant(selectedTicket.supportId)}
                        className={selectedTicket.isImportant ? 'text-yellow-400' : 'text-gray-400'}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {selectedTicket.isImportant ? 'star' : 'star_border'}
                        </span>
                      </button>
                      <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusText(selectedTicket.status)}
                      </span>
                      <span className="px-3 py-1 rounded text-sm bg-primary/20 text-primary">
                        {getCategoryText(selectedTicket.category)}
                      </span>
                      <span className="text-sm text-gray-400">
                        ID: {selectedTicket.supportId}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicket(null);
                      setSearchParams({});
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Ticket Info */}
                <div className="bg-[#11211e] rounded-lg p-4 mb-4 border border-[#293836]">
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="text-gray-400 w-24">{t('support.from') || 'From'}:</span>
                      <span className="text-white">{selectedTicket.name} ({selectedTicket.email})</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-24">{t('support.date') || 'Date'}:</span>
                      <span className="text-white">
                        {new Date(selectedTicket.createdAt).toLocaleString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                      </span>
                    </div>
                    {selectedTicket.updatedAt !== selectedTicket.createdAt && (
                      <div className="flex">
                        <span className="text-gray-400 w-24">{t('support.updated') || 'Updated'}:</span>
                        <span className="text-white">
                          {new Date(selectedTicket.updatedAt).toLocaleString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                  {/* Initial Message */}
                  <div className="bg-[#11211e] rounded-lg p-4 border border-[#293836]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{selectedTicket.name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(selectedTicket.createdAt).toLocaleString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                      </span>
                    </div>
                    <div className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</div>
                  </div>

                  {/* User Replies */}
                  {selectedTicket.userReplies && selectedTicket.userReplies.map((reply, index) => (
                    <div key={index} className="bg-[#11211e] rounded-lg p-4 border border-[#293836]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{selectedTicket.name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(reply.createdAt).toLocaleString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                        </span>
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap">{reply.message}</div>
                    </div>
                  ))}

                  {/* Admin Replies */}
                  {selectedTicket.adminReplies && selectedTicket.adminReplies.map((reply, index) => (
                    <div key={index} className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-primary">{t('support.admin') || 'Admin'}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(reply.createdAt).toLocaleString(lang === 'az' ? 'az-AZ' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                        </span>
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap">{reply.message}</div>
                    </div>
                  ))}

                  {/* Reply Form */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="bg-[#11211e] rounded-lg p-4 border border-[#293836]">
                      <SupportReplyForm ticketId={selectedTicket.supportId} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2c29] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{t('support.newTicket') || 'New Ticket'}</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <SupportForm onSuccess={() => {
                  setShowCompose(false);
                  window.location.reload();
                }} />
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

// Reply Form Component
const SupportReplyForm = ({ ticketId }: { ticketId: string }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(t('support.messageRequired') || 'Message is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const backendUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/support/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => {
          setSuccess(false);
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || t('support.replyError') || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Reply error:', err);
      setError(t('support.replyError') || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
          {t('support.replySent') || 'Reply sent successfully!'}
        </div>
      )}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('support.replyPlaceholder') || 'Type your reply...'}
        className="w-full h-32 px-4 py-3 bg-[#11211e] border border-[#293836] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? t('support.sending') || 'Sending...' : t('support.sendReply') || 'Send Reply'}
      </button>
    </form>
  );
};

// Support Form Component (reused from Support.tsx)
const SupportForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const lang = params.lang || 'az';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setFormData(prev => ({
          ...prev,
          name: userData.username || '',
          email: userData.email || ''
        }));
      } catch (e) {
        console.error('User data parse error:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const backendUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lang,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setSubmitStatus('success');
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1000);
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error('Support submit exception:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitStatus === 'success' && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
          {t('support.success')}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {t('support.error')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t('support.name')} *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t('support.email')} *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('support.category')} *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
        >
          <option value="general">{t('support.categoryGeneral')}</option>
          <option value="bug_report">{t('support.categoryBugReport')}</option>
          <option value="xtreme_code">{t('support.categoryXtremeCode')}</option>
          <option value="m3u">{t('support.categoryM3U')}</option>
          <option value="account">{t('support.categoryAccount')}</option>
          <option value="technical">{t('support.categoryTechnical')}</option>
          <option value="feature_request">{t('support.categoryFeatureRequest')}</option>
          <option value="other">{t('support.categoryOther')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('support.subject')} *
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          required
          className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
          placeholder={t('support.subjectPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {t('support.message')} *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={6}
          className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? t('support.sending') : t('support.send')}
      </button>
    </form>
  );
};

export default SupportTicketsList;

