import { useEffect, useState } from 'react';

type SupportTicketsViewProps = {
  tickets: any[];
  loading: boolean;
  selectedTicket: any | null;
  setSelectedTicket: (ticket: any | null) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onUpdate: (ticketId: string, status?: string, notes?: string) => Promise<void>;
  onLoad: () => Promise<void>;
  isUpdating: boolean;
};

const SupportTicketsView = ({
  tickets,
  loading,
  selectedTicket,
  setSelectedTicket,
  statusFilter,
  setStatusFilter,
  adminNotes,
  setAdminNotes,
  onUpdate,
  onLoad,
  isUpdating,
}: SupportTicketsViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Beklemede',
      in_progress: 'İşleniyor',
      resolved: 'Cevaplandı',
      closed: 'Kapatıldı',
    };
    return statusMap[status] || status;
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await onUpdate(ticketId, newStatus);
  };

  const handleSaveNotes = async () => {
    if (!selectedTicket || !adminNotes.trim()) return;
    
    // Mesajı gönder (sadece yeni mesaj, eski mesajı değiştirme)
    const messageToSend = adminNotes.trim();
    
    // Textarea'yı hemen temizle (kullanıcı deneyimi için)
    setAdminNotes('');
    
    // Mesajı gönder
    await onUpdate(selectedTicket.supportId, undefined, messageToSend);
  };

  useEffect(() => {
    onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Ticket seçildiğinde veya değiştiğinde adminNotes'u temizle
  useEffect(() => {
    if (selectedTicket) {
      // Her zaman boş başla, yeni mesaj için (chat gibi)
      setAdminNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicket?.supportId]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Destek Talepleri</h2>
          <p className="text-sm text-[#9db8b4]">Kullanıcı destek taleplerini yönetin ve cevap verin</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1a2c29] border border-[#293836] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4]"
        >
          <option value="all">Tümü</option>
          <option value="pending">Beklemede</option>
          <option value="in_progress">İşleniyor</option>
          <option value="resolved">Çözüldü</option>
          <option value="closed">Kapatıldı</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#19e6c4]"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20 bg-[#1b2725] rounded-xl border border-[#293836]">
              <p className="text-[#9db8b4]">Destek talebi bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.supportId}
                  onClick={() => {
                    // Ticket'ı yükle ama adminNotes field'ını kaldır (yeni mesaj için)
                    const cleanTicket = { ...ticket };
                    delete cleanTicket.adminNotes; // adminNotes'u kaldır, sadece adminReplies kullan
                    setSelectedTicket(cleanTicket);
                    setAdminNotes(''); // Her seferinde boş başla, yeni mesaj için
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket?.supportId === ticket.supportId
                      ? 'bg-[#19e6c4]/10 border-[#19e6c4]'
                      : 'bg-[#1b2725] border-[#293836] hover:border-[#3e524f]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[#19e6c4]">{ticket.supportId}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(ticket.status || 'pending')}`}>
                          {getStatusText(ticket.status || 'pending')}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-[#9db8b4] line-clamp-2">{ticket.message}</p>
                      {(ticket.userReplies && ticket.userReplies.length > 0) && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-[#19e6c4]">💬 {ticket.userReplies.length} müşteri cevabı</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-[#9db8b4]">
                    <span>{ticket.name} ({ticket.email})</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <div className="bg-[#1b2725] rounded-xl border border-[#293836] p-6 sticky top-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#19e6c4]">{selectedTicket.supportId}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">{selectedTicket.subject}</h3>
                <div className="text-sm text-[#9db8b4] mb-4">
                  <p className="mb-1"><strong>İsim:</strong> {selectedTicket.name}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedTicket.email}</p>
                  <p className="mb-1"><strong>Dil:</strong> {selectedTicket.lang?.toUpperCase() || selectedTicket.lang}</p>
                  <p className="mb-1"><strong>Oluşturulma:</strong> {new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              {/* User Replies - Müşteri Cevapları */}
              {selectedTicket.userReplies && selectedTicket.userReplies.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-white mb-2">Müşteri Cevapları ({selectedTicket.userReplies.length})</p>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedTicket.userReplies.map((reply: any, index: number) => (
                      <div key={index} className="p-3 bg-[#11211e] rounded-lg border border-[#293836]">
                        <p className="text-sm text-white whitespace-pre-wrap mb-2">{reply.message}</p>
                        <p className="text-xs text-[#9db8b4]">
                          {new Date(reply.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Change */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Durum Değiştir</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedTicket.supportId, 'pending')}
                    disabled={isUpdating || selectedTicket.status === 'pending'}
                    className="px-3 py-2 text-xs rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Beklemede
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.supportId, 'in_progress')}
                    disabled={isUpdating || selectedTicket.status === 'in_progress'}
                    className="px-3 py-2 text-xs rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    İşleniyor
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.supportId, 'resolved')}
                    disabled={isUpdating || selectedTicket.status === 'resolved'}
                    className="px-3 py-2 text-xs rounded-lg bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cevaplandı
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.supportId, 'closed')}
                    disabled={isUpdating || selectedTicket.status === 'closed'}
                    className="px-3 py-2 text-xs rounded-lg bg-gray-500/10 text-gray-500 border border-gray-500/30 hover:bg-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kapatıldı
                  </button>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Cevap</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Kullanıcıya cevap yazın..."
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] min-h-[120px] resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="mt-2 w-full px-4 py-2 bg-[#19e6c4] hover:bg-[#14b89d] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Kaydediliyor...' : 'Cevabı Gönder'}
                </button>
              </div>

              {/* Chat Benzeri Mesaj Geçmişi - WhatsApp Tarzı */}
              <div className="mb-4">
                <p className="text-sm font-medium text-white mb-2">Mesaj Geçmişi</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto bg-[#11211e] rounded-lg p-4 border border-[#293836]">
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
                      message: selectedTicket.message,
                      createdAt: selectedTicket.createdAt,
                      senderName: selectedTicket.name,
                    });

                    // Müşteri cevapları
                    if (selectedTicket.userReplies && selectedTicket.userReplies.length > 0) {
                      selectedTicket.userReplies.forEach((reply: any) => {
                        allMessages.push({
                          type: 'user',
                          message: reply.message,
                          createdAt: reply.createdAt,
                          senderName: selectedTicket.name,
                        });
                      });
                    }

                    // Admin cevapları
                    if (selectedTicket.adminReplies && selectedTicket.adminReplies.length > 0) {
                      selectedTicket.adminReplies.forEach((reply: any) => {
                        allMessages.push({
                          type: 'admin',
                          message: reply.message,
                          createdAt: reply.createdAt,
                          senderName: 'Yönetici',
                        });
                      });
                    }

                    // Eski adminNotes (geriye dönük uyumluluk)
                    if (selectedTicket.adminNotes && (!selectedTicket.adminReplies || selectedTicket.adminReplies.length === 0)) {
                      allMessages.push({
                        type: 'admin',
                        message: selectedTicket.adminNotes,
                        createdAt: selectedTicket.updatedAt || selectedTicket.createdAt,
                        senderName: 'Yönetici',
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
                              <span className={`text-xs font-medium ${isUser ? 'text-[#9db8b4]' : 'text-[#19e6c4]'}`}>
                                {msg.senderName}
                              </span>
                              <span className={`text-xs ${isUser ? 'text-[#9db8b4]' : 'text-[#19e6c4]'}`}>
                                {new Date(msg.createdAt).toLocaleString('tr-TR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {/* Mesaj Balonu */}
                            <div
                              className={`p-3 rounded-2xl ${
                                isUser
                                  ? 'bg-[#1b2725] border border-[#293836] rounded-tl-none'
                                  : 'bg-[#19e6c4]/10 border border-[#19e6c4]/30 rounded-tr-none'
                              }`}
                            >
                              <p className="text-sm text-white whitespace-pre-wrap">
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
            </div>
          ) : (
            <div className="bg-[#1b2725] rounded-xl border border-[#293836] p-6 text-center">
              <p className="text-[#9db8b4]">Bir destek talebi seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsView;

