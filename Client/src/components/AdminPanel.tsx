import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedAccounts } from '../services/xtremeCodeService';
import { getSavedM3UAccounts } from '../services/m3uService';
import Footer from './Footer';
import SettingsView from './SettingsView';
import SupportTicketsView from './SupportTicketsView';

type FooterSettings = {
  companyName: string;
  copyrightYear: string;
  version: string;
  description?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
};

type Subscription = {
  id: string;
  user: string;
  avatar: string;
  packageType: 'Xtreme' | 'M3U';
  status: 'Aktif' | 'Beklemede' | 'Süresi Doldu';
  endDate: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  userId: string;
  registerDate: string;
  lastLogin: string;
  status: 'Aktif' | 'Pasif';
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tümü');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Settings state
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: 'IPTV Manager',
    copyrightYear: '2023 - 2026',
    version: 'V 2.1.0 (Beta)',
    description: 'Professional IPTV Management Platform',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Support state
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [supportStatusFilter, setSupportStatusFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // Role kontrolü ve kullanıcı yükleme
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        navigate('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // Admin kontrolü
        if (user.role !== 'admin') {
          setError('Bu sayfaya erişmek için admin yetkisi gereklidir.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Kullanıcıları yükle
        await loadUsers();
        
        // Kayıtsız hesapları backend'e gönder
        await syncAnonymousAccounts();
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Kayıtsız hesapları backend'e senkronize et
  const syncAnonymousAccounts = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Xtreme Code hesaplarını al
      const xtremeAccounts = getSavedAccounts();
      if (xtremeAccounts.length > 0) {
        await fetch(`${backendUrl}/api/accounts/anonymous`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accounts: xtremeAccounts,
            type: 'xtreme'
          }),
        });
      }

      // M3U hesaplarını al
      const m3uAccounts = getSavedM3UAccounts();
      if (m3uAccounts.length > 0) {
        await fetch(`${backendUrl}/api/accounts/anonymous`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accounts: m3uAccounts,
            type: 'm3u'
          }),
        });
      }
    } catch (err) {
      console.error('Sync anonymous accounts error:', err);
      // Hata olsa bile devam et
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/users?page=${currentPage}&limit=10&search=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Backend'den gelen kullanıcıları formatla
        const formattedUsers: User[] = data.users.map((u: any) => {
          // MongoDB _id'yi string'e çevir
          const userId = String(u._id || u.id || '');
          return {
            id: userId,
            name: u.username,
            email: u.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=19e6c4&color=000`,
            userId: `#${userId.slice(-6)}`,
            registerDate: new Date(u.createdAt).toLocaleDateString('tr-TR'),
            lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('tr-TR') : 'Hiç',
            status: u.isActive ? 'Aktif' : 'Pasif',
            role: u.role || 'user',
          };
        });
        setUsers(formattedUsers);
      } else {
        setError(data.message || 'Kullanıcılar yüklenemedi.');
      }
    } catch (err) {
      console.error('Load users error:', err);
      setError('Kullanıcılar yüklenirken hata oluştu.');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        await loadUsers(); // Kullanıcı listesini yenile
      } else {
        alert(data.message || 'Role güncellenemedi.');
      }
    } catch (err) {
      console.error('Role change error:', err);
      alert('Role güncellenirken hata oluştu.');
    }
  };

  // Kullanıcılar artık backend'den yükleniyor (useEffect'te)

  const subscriptions: Subscription[] = [
    {
      id: '1',
      user: 'Ahmet Yılmaz',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDScOzfZOmjeY_anqYenYQlvB2tiouBmUDtODarWH-qeNgqKL_6AFedWRxmWbV4ls47pLUQx4nHiifOrkjhaZs6SeaCgtjfbxcw-ajFVJf_HvLRaYm0LHmS21wcIXdgVvw4tEhfmSQcqvVzW8jundiFEWLohGv3fukvJURGsfoTTNq1Xv_nMnaWtRE_ufkXErwOZJK8EnhVUgeTfo_ycAmVcE8AdV0aY6B0HPXTGvNQ5vDPw_S-HgtTpla-kN8LOFeEJIsCMbHwsLc',
      packageType: 'Xtreme',
      status: 'Aktif',
      endDate: '24 Oca 2025',
    },
    {
      id: '2',
      user: 'Mehmet Kaya',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnaOqU_iecaXG2uPCbUtSYKumJVi7MGZ-83q7NsZ8ZQU4N2kN-tQJWc29hdOKY3cJLPMhkhpJbffMQ1Ng687IaIiWe2Yu2zucI-7xlUnI-5T4HRi5biiyZgBsABv9bjWU0URV96uYz-SlS8XMTw32p7hbUzDDoI8-nRVlJMvehkKthkuG_JJSlaxF6t07KWfE2te-TOUSOw4u4cYii_dC4HyIu4_flHMcP_sI50ugX-NkPhNLw0y0pNBF_KyzFBgEWysvUp_pCGFk',
      packageType: 'M3U',
      status: 'Beklemede',
      endDate: '12 Şub 2025',
    },
    {
      id: '3',
      user: 'Zeynep Demir',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Lvw9rvZmQ0FklQdCfYWOg0bPpjdivDOHolzp3arE0b1mVIopiUgcJC06WgDRjVHJJyYsyFCECRp6pMo0Ux5W5gOFePQ1dy-hyWFlsAv-N1O2BA6-wPF0sX_-Pu5YKaw19_lAE931LEDarpbPVYESskQGHRMHeAlPILm0DvW-XM7glb-OXzZhlf9PLmfg4YRO1uTtdL-wnagZJjfhoMCl5qgQI9JH_aBpejiPWEL73PHRJjWzHWWnZAbsvgjQtajZFJMFmkTjCts',
      packageType: 'Xtreme',
      status: 'Süresi Doldu',
      endDate: '01 Ara 2023',
    },
    {
      id: '4',
      user: 'Can Erkin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsU71920ulk5q2c6XRh6uAkOSD79wkO59cNrlMqCJREGt7EyTEkBrPFN7kbmr28hYG0sY6mqDExxHGxXxuAoibDJS58fQ-9xWiLH9mnXp4iI26KsittidwaGL6o5GiFOIJqtebwoJ7Y8UzFb-kSUIB22aXqZ7t7Xorr1ywcTmrQsFQoJYhI1-gw13s4l_mEvmzqNb2366KVS9SboSS6L-8OP06j_vXlJL5wS8GEq8ss8kk8g06uGiiVrCMxsHhLiFqPnjX1U3KV-U',
      packageType: 'Xtreme',
      status: 'Aktif',
      endDate: '15 Haz 2024',
    },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  // Support ticket yükleme
  const loadSupportTickets = async () => {
    setSupportLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/support?status=${supportStatusFilter === 'all' ? '' : supportStatusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSupportTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Load support tickets error:', err);
    } finally {
      setSupportLoading(false);
    }
  };

  // Support ticket güncelleme
  const updateSupportTicket = async (ticketId: string, status?: string, notes?: string) => {
    setIsUpdatingTicket(true);
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes !== undefined) {
        updateData.adminNotes = notes;
        // Eğer cevap veriliyorsa ve status belirtilmemişse, status'u "in_progress" yap
        if (notes && notes.trim() && !status) {
          updateData.status = 'in_progress';
        }
      }

      const response = await fetch(`${backendUrl}/api/support/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        // Önce ticket listesini yenile
        await loadSupportTickets();
        
        // Eğer güncellenen ticket seçiliyse, güncellenmiş ticket'ı tekrar yükle
        if (selectedTicket?.supportId === ticketId) {
          try {
            const ticketResponse = await fetch(`${backendUrl}/api/support/${ticketId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const ticketData = await ticketResponse.json();
            if (ticketData.success && ticketData.ticket) {
              // Ticket'ı yükle ama adminNotes field'ını kaldır (yeni mesaj için)
              const cleanTicket = { ...ticketData.ticket };
              delete cleanTicket.adminNotes; // adminNotes'u kaldır, sadece adminReplies kullan
              setSelectedTicket(cleanTicket);
              // Her zaman adminNotes'u temizle (yeni mesaj için)
              setAdminNotes('');
            }
          } catch (err) {
            console.error('Failed to reload ticket:', err);
            // Hata olsa bile data.ticket'ı kullan
            if (data.ticket) {
              const cleanTicket = { ...data.ticket };
              delete cleanTicket.adminNotes; // adminNotes'u kaldır, sadece adminReplies kullan
              setSelectedTicket(cleanTicket);
              setAdminNotes('');
            }
          }
        }
        
        setAdminNotes('');
        if (notes && notes.trim()) {
          alert('Cevap başarıyla gönderildi ve kullanıcıya mail gönderildi');
        } else {
          alert('Destek talebi başarıyla güncellendi');
        }
      } else {
        alert(data.message || 'Güncelleme başarısız');
      }
    } catch (err) {
      console.error('Update support ticket error:', err);
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Aktif: 'bg-green-500/10 text-green-500 border-green-500/20',
      Beklemede: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Süresi Doldu': 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return styles[status as keyof typeof styles] || styles.Aktif;
  };

  const getPackageBadge = (type: string) => {
    if (type === 'Xtreme') {
      return 'bg-[#19e6c4]/10 text-[#19e6c4] border-[#19e6c4]/20';
    }
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  };

  return (
    <div className="bg-[#f6f8f8] dark:bg-[#11211e] font-display text-slate-900 dark:text-white antialiased overflow-hidden w-full h-screen flex">
      {/* SIDEBAR */}
      <aside className="flex w-72 flex-col gap-4 border-r border-[#293836] bg-[#111817] px-4 py-6 hidden md:flex z-20">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#19e6c4] to-[#0f8a75] shadow-lg shadow-[#19e6c4]/20">
            <span className="material-symbols-outlined text-[#11211e] font-bold text-2xl">admin_panel_settings</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Xtreme Admin</h2>
        </div>
        <div className="flex flex-col gap-2">
          <a
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'dashboard' ? 'fill' : ''}`}>
              grid_view
            </span>
            <span className="text-sm font-medium">Panel</span>
          </a>
          <a
            onClick={() => setActiveTab('users')}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'users' ? 'fill' : ''}`}>group</span>
            <span className="text-sm font-medium">Kullanıcılar</span>
          </a>
          <a
            onClick={() => setActiveTab('anonymous')}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'anonymous'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'anonymous' ? 'fill' : ''}`}>person_off</span>
            <span className="text-sm font-medium">Kayıtsız Hesaplar</span>
          </a>
          <a
            onClick={() => setActiveTab('iptv')}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'iptv'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
            <span className="text-sm font-medium">Kanallar</span>
          </a>
          <a
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">movie</span>
            <span className="text-sm font-medium">İçerik Yönetimi</span>
          </a>
          <a
            onClick={() => {
              setActiveTab('support');
              loadSupportTickets();
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'support' ? 'fill' : ''}`}>support_agent</span>
            <span className="text-sm font-medium">Destek Talepleri</span>
          </a>
          <a
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#19e6c4]/10 text-[#19e6c4]'
                : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-sm font-medium">Ayarlar</span>
          </a>
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <div className="mx-2 h-px bg-[#293836]"></div>
          <div className="flex items-center gap-3 px-2">
            <div
              className="h-10 w-10 overflow-hidden rounded-full border border-[#19e6c4]/30"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCumBmJHLte22k-cMjygBBaDUJRCFRbOPwK66-v-_gwP9mcdzwPx8zaDHTIJW6sc8lYcRJoJMkwIP9Mvwx2vPL-gWDgaVVTAzUUNAcb4CKIGeY0vH0CoTI5BwQJc092CtQmKp3W_iMN8Jf5biMwAq_LBonK4k0EqAgyU9362a7exGS3a5Jz-vcvulc7_HX3IfVQAzMwE1l6SGNOmx8gGMd-arc-2ROcCInubcGFzSlu8425wfwAkSIs8-puh0OWq3pDKDPG0iAa8JY")',
                backgroundSize: 'cover',
              }}
            ></div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Yönetici</span>
              <span className="text-xs text-[#9db8b4]">admin@xtreme.com</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* TOP NAVBAR */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#293836] bg-[#11211e]/50 backdrop-blur-md px-6 py-4 z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="md:hidden text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-4 text-white">
              <div className="size-8 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  {activeTab === 'users' ? 'Kullanıcı Listesi' : 'Genel Bakış'}
                </h2>
                {activeTab === 'users' && (
                  <p className="text-sm text-[#9db8b4] mt-1">Sistemdeki tüm kayıtlı kullanıcıları yönetin ve izleyin</p>
                )}
              </div>
            </div>
            {/* Search */}
            {activeTab === 'dashboard' && (
              <div className="hidden md:flex items-center">
                <label className="flex flex-col min-w-40 h-10 w-64 lg:w-96">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-[#293836] bg-[#1b2725] focus-within:border-[#19e6c4]/50 transition-colors">
                    <div className="text-[#9db8b4] flex items-center justify-center pl-3">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input
                      className="flex w-full min-w-0 flex-1 bg-transparent text-white focus:outline-0 placeholder:text-[#9db8b4] px-3 text-sm font-normal leading-normal"
                      placeholder="Kullanıcı veya yayın ara..."
                      type="text"
                    />
                  </div>
                </label>
              </div>
            )}
            {activeTab === 'users' && (
              <button className="flex items-center gap-2 rounded-lg bg-[#19e6c4] px-4 py-2.5 text-sm font-bold text-[#11211e] shadow-lg shadow-[#19e6c4]/20 transition-all hover:bg-[#14b89d] hover:shadow-[#19e6c4]/30">
                <span className="material-symbols-outlined text-xl">person_add</span>
                Yeni Kullanıcı Ekle
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-[#1b2725] text-[#9db8b4] hover:text-white transition-all relative">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-[#19e6c4] rounded-full border border-[#11211e]"></span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#293836]"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDWXV9NeIRpLK7G1mnmWg5GWNqRsd9acrSWpUTAbfOUiWv4uDWrkErk2kfbT8i-nuurvx4nkXZq3y2IifTqvIpMeFjqCJAcyqrj33bnYrs1r_0m30K3EcTpfZ9o58n1WKI2S5LAKj68FzZtzs8seNBWZOrOI153ar5QEkTaxovf5bN9smXhUlwVA_e-N15TydC3eN4GLn_Mt0HJT5NXaobDjYFPDsX51d7z3SqTWFZAIQWdXgfq5NuJ0Q6G4ysoiwNWdKr08xZiqhQ")',
              }}
            ></div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'settings' ? (
            <SettingsView
              footerSettings={footerSettings}
              setFooterSettings={setFooterSettings}
              isSaving={isSavingSettings}
              setIsSaving={setIsSavingSettings}
            />
          ) : activeTab === 'support' ? (
            <SupportTicketsView
              tickets={supportTickets}
              loading={supportLoading}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              statusFilter={supportStatusFilter}
              setStatusFilter={setSupportStatusFilter}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              onUpdate={updateSupportTicket}
              onLoad={loadSupportTickets}
              isUpdating={isUpdatingTicket}
            />
          ) : activeTab === 'anonymous' ? (
            <AnonymousAccountsView />
          ) : activeTab === 'users' ? (
            <UserListView
              users={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          ) : (
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#293836] bg-[#1b2725] relative overflow-hidden group hover:border-[#19e6c4]/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-[#19e6c4]">group</span>
                </div>
                <p className="text-[#9db8b4] text-sm font-medium leading-normal">Toplam Kullanıcı</p>
                <div className="flex items-end gap-2">
                  <p className="text-white text-3xl font-bold leading-tight">1,245</p>
                  <span className="text-[#0bda4d] text-xs font-bold mb-1 flex items-center bg-[#0bda4d]/10 px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#293836] bg-[#1b2725] relative overflow-hidden group hover:border-[#19e6c4]/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-[#19e6c4]">live_tv</span>
                </div>
                <p className="text-[#9db8b4] text-sm font-medium leading-normal">Aktif Yayınlar</p>
                <div className="flex items-end gap-2">
                  <p className="text-white text-3xl font-bold leading-tight">850</p>
                  <span className="text-[#0bda4d] text-xs font-bold mb-1 flex items-center bg-[#0bda4d]/10 px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> 5%
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#293836] bg-[#1b2725] relative overflow-hidden group hover:border-[#19e6c4]/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-[#19e6c4]">terminal</span>
                </div>
                <p className="text-[#9db8b4] text-sm font-medium leading-normal">Xtreme Code</p>
                <div className="flex items-end gap-2">
                  <p className="text-white text-3xl font-bold leading-tight">620</p>
                  <span className="text-[#0bda4d] text-xs font-bold mb-1 flex items-center bg-[#0bda4d]/10 px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> 8%
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col gap-2 rounded-xl p-5 border border-[#293836] bg-[#1b2725] relative overflow-hidden group hover:border-[#19e6c4]/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-[#19e6c4]">playlist_play</span>
                </div>
                <p className="text-[#9db8b4] text-sm font-medium leading-normal">M3U Linkleri</p>
                <div className="flex items-end gap-2">
                  <p className="text-white text-3xl font-bold leading-tight">230</p>
                  <span className="text-[#fa5838] text-xs font-bold mb-1 flex items-center bg-[#fa5838]/10 px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">trending_down</span> 2%
                  </span>
                </div>
              </div>
            </div>

            {/* MAIN GRID AREA: CHART + QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CHART SECTION */}
              <div className="lg:col-span-2 rounded-xl border border-[#293836] bg-[#1b2725] p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white text-base font-bold leading-normal">Sunucu Trafiği</h3>
                    <div className="flex gap-2 items-baseline">
                      <p className="text-white text-2xl font-bold">2.4 TB</p>
                      <p className="text-[#9db8b4] text-xs">Son 24 Saat</p>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-[#11211e] p-1 rounded-lg">
                    <button
                      onClick={() => setTimeRange('24H')}
                      className={`px-3 py-1 text-xs font-medium rounded shadow-sm transition-colors ${
                        timeRange === '24H'
                          ? 'text-[#11211e] bg-[#19e6c4]'
                          : 'text-[#9db8b4] hover:text-white'
                      }`}
                    >
                      24H
                    </button>
                    <button
                      onClick={() => setTimeRange('7D')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        timeRange === '7D'
                          ? 'text-[#11211e] bg-[#19e6c4]'
                          : 'text-[#9db8b4] hover:text-white'
                      }`}
                    >
                      7D
                    </button>
                    <button
                      onClick={() => setTimeRange('30D')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        timeRange === '30D'
                          ? 'text-[#11211e] bg-[#19e6c4]'
                          : 'text-[#9db8b4] hover:text-white'
                      }`}
                    >
                      30D
                    </button>
                  </div>
                </div>

                {/* Chart Visualization (SVG) */}
                <div className="w-full aspect-[2/1] max-h-[250px] relative">
                  <svg
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 478 150"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chart" x1="236" x2="236" y1="0" y2="150">
                        <stop stopColor="#19e6c4" stopOpacity="0.2"></stop>
                        <stop offset="1" stopColor="#19e6c4" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 109C18.15 109 18.15 41 36.3 41C54.46 41 54.46 61 72.61 61C90.76 61 90.76 113 108.9 113C127 113 127 53 145.2 53C163.3 53 163.3 121 181.5 121C199.6 121 199.6 81 217.8 81C236 81 236 65 254.1 65C272.3 65 272.3 141 290.4 141C308.6 141 308.6 149 326.7 149C344.9 149 344.9 21 363 21C381.2 21 381.2 101 399.3 101C417.5 101 417.5 149 435.6 149C453.8 149 453.8 45 472 45V150H0V109Z"
                      fill="url(#paint0_linear_chart)"
                    ></path>
                    <path
                      d="M0 109C18.15 109 18.15 41 36.3 41C54.46 41 54.46 61 72.61 61C90.76 61 90.76 113 108.9 113C127 113 127 53 145.2 53C163.3 53 163.3 121 181.5 121C199.6 121 199.6 81 217.8 81C236 81 236 65 254.1 65C272.3 65 272.3 141 290.4 141C308.6 141 308.6 149 326.7 149C344.9 149 344.9 21 363 21C381.2 21 381.2 101 399.3 101C417.5 101 417.5 149 435.6 149C453.8 149 453.8 45 472 45"
                      fill="none"
                      stroke="#19e6c4"
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between mt-4 px-2">
                  <p className="text-[#9db8b4] text-xs font-mono">00:00</p>
                  <p className="text-[#9db8b4] text-xs font-mono">04:00</p>
                  <p className="text-[#9db8b4] text-xs font-mono">08:00</p>
                  <p className="text-[#9db8b4] text-xs font-mono">12:00</p>
                  <p className="text-[#9db8b4] text-xs font-mono">16:00</p>
                  <p className="text-[#9db8b4] text-xs font-mono">20:00</p>
                  <p className="text-[#9db8b4] text-xs font-mono">23:59</p>
                </div>
              </div>

              {/* SERVER HEALTH / SIDE WIDGET */}
              <div className="flex flex-col gap-4">
                {/* Server Load */}
                <div className="flex-1 rounded-xl border border-[#293836] bg-[#1b2725] p-6 flex flex-col justify-center items-center">
                  <h3 className="text-white text-base font-bold mb-6 self-start">Sunucu Sağlığı</h3>
                  <div className="relative size-40">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <path
                        className="text-[#293836]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></path>
                      <path
                        className="text-[#19e6c4]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="75, 100"
                        strokeWidth="4"
                      ></path>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">75%</span>
                      <span className="text-xs text-[#9db8b4]">CPU Load</span>
                    </div>
                  </div>
                  <div className="w-full mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-[#11211e] p-3 rounded-lg text-center">
                      <p className="text-[#9db8b4] text-xs">RAM</p>
                      <p className="text-white font-bold">12/16 GB</p>
                    </div>
                    <div className="bg-[#11211e] p-3 rounded-lg text-center">
                      <p className="text-[#9db8b4] text-xs">Disk</p>
                      <p className="text-white font-bold">45%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT SUBSCRIPTIONS TABLE */}
            <div className="rounded-xl border border-[#293836] bg-[#1b2725] overflow-hidden">
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#293836]">
                <h3 className="text-white text-lg font-bold leading-tight">Son Abonelikler</h3>
                <button className="text-[#19e6c4] text-sm font-semibold hover:text-white transition-colors">
                  Tümünü Gör
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#9db8b4]">
                  <thead className="bg-[#11211e] text-xs uppercase font-semibold text-[#9db8b4]">
                    <tr>
                      <th className="px-6 py-4" scope="col">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-4" scope="col">
                        Paket Tipi
                      </th>
                      <th className="px-6 py-4" scope="col">
                        Durum
                      </th>
                      <th className="px-6 py-4" scope="col">
                        Bitiş Tarihi
                      </th>
                      <th className="px-6 py-4 text-right" scope="col">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#293836]">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#11211e]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
                              style={{ backgroundImage: `url("${sub.avatar}")` }}
                            ></div>
                            <div className="font-medium text-white">{sub.user}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium border ${getPackageBadge(
                              sub.packageType
                            )}`}
                          >
                            {sub.packageType === 'Xtreme' && (
                              <span className="size-1.5 rounded-full bg-[#19e6c4]"></span>
                            )}
                            {sub.packageType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium border ${getStatusBadge(
                              sub.status
                            )}`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 ${sub.status === 'Süresi Doldu' ? 'text-red-400' : ''}`}>
                          {sub.endDate}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#9db8b4] hover:text-[#19e6c4] transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

// User List View Component
const UserListView = ({
  users,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  currentPage,
  setCurrentPage,
  onRoleChange,
}: {
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onRoleChange?: (userId: string, newRole: 'admin' | 'user') => void;
}) => {
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'Tümü' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getUserStatusBadge = (status: string) => {
    if (status === 'Aktif') {
      return 'bg-[#19e6c4]/10 text-[#19e6c4] border-[#19e6c4]/20';
    }
    return 'bg-gray-700/30 text-gray-400 border-gray-600/30';
  };

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showXtremeModal, setShowXtremeModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showXtremeListModal, setShowXtremeListModal] = useState(false);
  const [editingXtremeAccount, setEditingXtremeAccount] = useState<any>(null);
  const [userXtremeAccounts, setUserXtremeAccounts] = useState<any[]>([]);
  const [userPackage, setUserPackage] = useState<any>(null);
  const [xtremeForm, setXtremeForm] = useState({ serverUrl: '', tvName: '', username: '', password: '', apiEndpoint: '/player_api.php' });
  const [packageForm, setPackageForm] = useState({ name: '', endDate: '', quality: '', channelCount: '', status: 'Aktif' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kullanıcının Xtreme Code hesaplarını ve paketini yükle
  const loadUserAccounts = async (user: User) => {
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const userId = String(user.id || (user as any)._id || '');
      
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUserXtremeAccounts(data.user.adminXtremeCodeAccounts || []);
          setUserPackage(data.user.assignedPackage || null);
        }
      }
    } catch (err) {
      console.error('Load user accounts error:', err);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    loadUserAccounts(user);
    setShowXtremeListModal(true);
  };

  const handleEditXtremeAccount = (account: any) => {
    setEditingXtremeAccount(account);
    setXtremeForm({
      serverUrl: account.serverUrl || '',
      tvName: account.tvName || '',
      username: account.username || '',
      password: account.password || '',
      apiEndpoint: account.apiEndpoint || '/player_api.php'
    });
    setShowXtremeListModal(false);
    setShowXtremeModal(true);
  };

  const handleDeleteXtremeAccount = async (accountId: string) => {
    if (!selectedUser || !confirm('Bu Xtreme Code hesabını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const userId = String(selectedUser.id || (selectedUser as any)._id || '');

      if (!userId || userId === 'undefined' || userId === 'null') {
        alert('Kullanıcı ID bulunamadı.');
        return;
      }

      if (!accountId) {
        alert('Hesap ID bulunamadı.');
        return;
      }

      console.log('Deleting Xtreme Code account:', { userId, accountId });
      console.log('Request URL:', `${backendUrl}/api/users/${userId}/xtreme-code/${accountId}`);

      const response = await fetch(`${backendUrl}/api/users/${userId}/xtreme-code/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Delete response data:', data);
        if (data.success) {
          alert('Xtreme Code hesabı başarıyla silindi!');
          await loadUserAccounts(selectedUser);
        } else {
          alert(data.message || 'Hesap silinirken hata oluştu.');
        }
      } else {
        const errorText = await response.text();
        console.error('Delete error response:', response.status, errorText);
        alert(`Hesap silinirken hata oluştu: ${response.status} - ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Delete Xtreme Code error:', err);
      alert(`Hesap silinirken hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleAddXtremeCode = async () => {
    if (!selectedUser) return;
    
    if (!xtremeForm.serverUrl || !xtremeForm.username || !xtremeForm.password) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // User ID'yi doğru al (id veya _id) ve string'e çevir
      const userId = String(selectedUser.id || (selectedUser as any)._id || '');
      if (!userId || userId === 'undefined' || userId === 'null') {
        alert('Kullanıcı ID bulunamadı.');
        return;
      }
      
      // Eğer düzenleme modundaysa PUT, yoksa POST
      const isEdit = editingXtremeAccount !== null;
      const url = isEdit 
        ? `${backendUrl}/api/users/${userId}/xtreme-code/${editingXtremeAccount.id}`
        : `${backendUrl}/api/users/${userId}/xtreme-code`;
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log(`${isEdit ? 'Updating' : 'Adding'} Xtreme Code for user:`, userId);
      console.log('Request URL:', url);
      console.log('Request body:', xtremeForm);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(xtremeForm),
      });

      // Response status kontrolü
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        alert(`Hata: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        alert(`Xtreme Code hesabı başarıyla ${isEdit ? 'güncellendi' : 'eklendi'}!`);
        setShowXtremeModal(false);
        setEditingXtremeAccount(null);
        setXtremeForm({ serverUrl: '', tvName: '', username: '', password: '', apiEndpoint: '/player_api.php' });
        await loadUserAccounts(selectedUser);
        if (showXtremeListModal) {
          setShowXtremeListModal(true);
        }
      } else {
        alert(data.message || `Xtreme Code hesabı ${isEdit ? 'güncellenirken' : 'eklenirken'} hata oluştu.`);
      }
    } catch (err: any) {
      console.error(`${editingXtremeAccount ? 'Update' : 'Add'} Xtreme Code error:`, err);
      alert(`Xtreme Code hesabı ${editingXtremeAccount ? 'güncellenirken' : 'eklenirken'} hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedUser) return;
    
    if (!packageForm.name) {
      alert('Paket adı gereklidir.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // User ID'yi doğru al (id veya _id) ve string'e çevir
      const userId = String(selectedUser.id || (selectedUser as any)._id || '');
      if (!userId || userId === 'undefined' || userId === 'null') {
        alert('Kullanıcı ID bulunamadı.');
        return;
      }
      
      console.log('Assigning package for user:', userId);
      
      const response = await fetch(`${backendUrl}/api/users/${userId}/package`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(packageForm),
      });

      // Response status kontrolü
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        alert(`Hata: ${response.status} - ${response.statusText}`);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        alert('IPTV paketi başarıyla atandı!');
        setShowPackageModal(false);
        setPackageForm({ name: '', endDate: '', quality: '', channelCount: '', status: 'Aktif' });
        window.location.reload(); // Sayfayı yenile
      } else {
        alert(data.message || 'IPTV paketi atanırken hata oluştu.');
      }
    } catch (err: any) {
      console.error('Assign package error:', err);
      alert(`IPTV paketi atanırken hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Kullanıcı başarıyla silindi.');
        await loadUsers(); // Kullanıcı listesini yenile
      } else {
        alert(data.message || 'Kullanıcı silinemedi.');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Kullanıcı silinirken hata oluştu.');
    }
  };

  const handleBanUser = async (userId: string, userName: string, isActive: boolean) => {
    const action = isActive ? 'banlamak' : 'banı kaldırmak';
    if (!confirm(`"${userName}" kullanıcısını ${action} istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'İşlem başarısız.' }));
        alert(errorData.message || 'İşlem başarısız.');
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert(data.message || `Kullanıcı ${isActive ? 'banlandı' : 'banı kaldırıldı'}.`);
        await loadUsers(); // Kullanıcı listesini yenile
      } else {
        alert(data.message || 'İşlem başarısız.');
      }
    } catch (err) {
      console.error('Ban user error:', err);
      alert('İşlem sırasında hata oluştu.');
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col gap-4 rounded-xl border border-[#293836] bg-[#1a2c29] p-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="flex w-full md:w-96">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-[#9db8b4]">search</span>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border-0 bg-[#293836] py-2.5 pl-10 pr-3 text-white placeholder-[#9db8b4] focus:ring-2 focus:ring-[#19e6c4]/50 sm:text-sm outline-none"
                placeholder="Kullanıcı adı veya e-posta ara..."
                type="text"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setFilterStatus('Tümü')}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === 'Tümü'
                  ? 'bg-[#19e6c4]/20 border-[#19e6c4]/30 text-[#19e6c4]'
                  : 'bg-[#293836] border-transparent text-[#9db8b4] hover:bg-[#354644] hover:text-white'
              }`}
            >
              <span>Tümü</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${
                  filterStatus === 'Tümü'
                    ? 'bg-[#19e6c4] text-[#11211e]'
                    : 'bg-[#354644]'
                }`}
              >
                128
              </span>
            </button>
            <button
              onClick={() => setFilterStatus('Aktif')}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === 'Aktif'
                  ? 'bg-[#19e6c4]/20 border-[#19e6c4]/30 text-[#19e6c4]'
                  : 'bg-[#293836] border-transparent text-[#9db8b4] hover:bg-[#354644] hover:text-white'
              }`}
            >
              <span>Aktif</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${
                  filterStatus === 'Aktif'
                    ? 'bg-[#19e6c4] text-[#11211e]'
                    : 'bg-[#354644]'
                }`}
              >
                98
              </span>
            </button>
            <button
              onClick={() => setFilterStatus('Pasif')}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === 'Pasif'
                  ? 'bg-[#19e6c4]/20 border-[#19e6c4]/30 text-[#19e6c4]'
                  : 'bg-[#293836] border-transparent text-[#9db8b4] hover:bg-[#354644] hover:text-white'
              }`}
            >
              <span>Pasif</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${
                  filterStatus === 'Pasif'
                    ? 'bg-[#19e6c4] text-[#11211e]'
                    : 'bg-[#354644]'
                }`}
              >
                30
              </span>
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-[#293836] border border-transparent px-3 py-1.5 text-xs font-medium text-[#9db8b4] transition-colors hover:bg-[#354644] hover:text-white">
              <span className="material-symbols-outlined text-base">filter_list</span>
              <span>Filtrele</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-[#293836] bg-[#1a2c29] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#293836] bg-[#1c2625] text-xs uppercase text-[#9db8b4]">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                      Kullanıcı Adı
                      <span className="material-symbols-outlined text-sm">unfold_more</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                      E-posta
                      <span className="material-symbols-outlined text-sm">unfold_more</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                      Kayıt Tarihi
                      <span className="material-symbols-outlined text-sm">unfold_more</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider" scope="col">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                      Son Giriş
                      <span className="material-symbols-outlined text-sm">unfold_more</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-center" scope="col">
                    Durum
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-center" scope="col">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right font-semibold tracking-wider" scope="col">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293836]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-[#233935]">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 overflow-hidden rounded-full bg-slate-700"
                          style={{ backgroundImage: `url("${user.avatar}")`, backgroundSize: 'cover' }}
                        ></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white group-hover:text-[#19e6c4] transition-colors">
                            {user.name}
                          </span>
                          <span className="text-xs text-[#9db8b4]">ID: {user.userId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#9db8b4]">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#9db8b4] font-mono text-xs">
                      {user.registerDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#9db8b4] font-mono text-xs">
                      {user.lastLogin}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${getUserStatusBadge(
                          user.status
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === 'Aktif' ? 'bg-[#19e6c4]' : 'bg-gray-500'
                          }`}
                        ></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => {
                          handleRoleChange(user.id, e.target.value as 'admin' | 'user');
                        }}
                        className="bg-[#11211e] border border-[#293836] text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-[#19e6c4]"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded p-1.5 text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors"
                          title="Xtreme Code Ekle"
                        >
                          <span className="material-symbols-outlined text-lg">add_circle</span>
                        </button>
                        <button
                          onClick={async () => {
                            setSelectedUser(user);
                            await loadUserAccounts(user);
                            if (userPackage) {
                              setPackageForm({
                                name: userPackage.name || '',
                                endDate: userPackage.endDate || '',
                                quality: userPackage.quality || '',
                                channelCount: userPackage.channelCount || '',
                                status: userPackage.status || 'Aktif'
                              });
                            }
                            setShowPackageModal(true);
                          }}
                          className="rounded p-1.5 text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors"
                          title="IPTV Paketi Ata/Düzenle"
                        >
                          <span className="material-symbols-outlined text-lg">card_giftcard</span>
                        </button>
                        <button
                          onClick={() => handleBanUser(user.id, user.name, user.status === 'Aktif')}
                          className={`rounded p-1.5 transition-colors ${
                            user.status === 'Aktif'
                              ? 'text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300'
                              : 'text-green-400 hover:bg-green-500/20 hover:text-green-300'
                          }`}
                          title={user.status === 'Aktif' ? 'Kullanıcıyı Banla' : 'Banı Kaldır'}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {user.status === 'Aktif' ? 'block' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                          title="Kullanıcıyı Sil"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <button
                          onClick={() => handleBanUser(user.id, user.name, user.status === 'Aktif')}
                          className={`rounded p-1.5 transition-colors ${
                            user.status === 'Aktif'
                              ? 'text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300'
                              : 'text-green-400 hover:bg-green-500/20 hover:text-green-300'
                          }`}
                          title={user.status === 'Aktif' ? 'Kullanıcıyı Banla' : 'Banı Kaldır'}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {user.status === 'Aktif' ? 'block' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                          title="Kullanıcıyı Sil"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded p-1.5 text-[#9db8b4] hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Sil"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#293836] bg-[#1c2625] px-6 py-3">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#9db8b4]">
                  Toplam <span className="font-medium text-white">128</span> kayıttan{' '}
                  <span className="font-medium text-white">1</span> ile{' '}
                  <span className="font-medium text-white">5</span> arası gösteriliyor
                </p>
              </div>
              <div>
                <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[#9db8b4] hover:bg-[#293836] hover:text-white focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Önceki</span>
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19e6c4] ${
                      currentPage === 1
                        ? 'bg-[#293836] text-[#19e6c4]'
                        : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
                    }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setCurrentPage(2)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                      currentPage === 2
                        ? 'bg-[#293836] text-[#19e6c4]'
                        : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
                    }`}
                  >
                    2
                  </button>
                  <button
                    onClick={() => setCurrentPage(3)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                      currentPage === 3
                        ? 'bg-[#293836] text-[#19e6c4]'
                        : 'text-[#9db8b4] hover:bg-[#293836] hover:text-white'
                    }`}
                  >
                    3
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9db8b4]">
                    ...
                  </span>
                  <button
                    onClick={() => setCurrentPage(10)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9db8b4] hover:bg-[#293836] hover:text-white focus:z-20 focus:outline-offset-0"
                  >
                    10
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[#9db8b4] hover:bg-[#293836] hover:text-white focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Sonraki</span>
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Mobile Pagination View */}
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="relative inline-flex items-center rounded-md border border-[#354644] bg-[#293836] px-4 py-2 text-sm font-medium text-[#9db8b4] hover:bg-[#354644] hover:text-white"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                className="relative ml-3 inline-flex items-center rounded-md border border-[#354644] bg-[#293836] px-4 py-2 text-sm font-medium text-[#9db8b4] hover:bg-[#354644] hover:text-white"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Xtreme Code Liste Modal */}
      {showXtremeListModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{selectedUser.name} - Xtreme Code Hesapları</h3>
              <button
                onClick={() => {
                  setShowXtremeListModal(false);
                  setSelectedUser(null);
                }}
                className="text-[#9db8b4] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Mevcut Hesaplar Listesi */}
            <div className="space-y-3 mb-6">
              {userXtremeAccounts.length > 0 ? (
                userXtremeAccounts.map((account, index) => (
                  <div key={account.id || index} className="bg-[#11211e] border border-[#293836] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-semibold">{account.tvName || `Hesap ${index + 1}`}</span>
                          <span className="text-xs text-[#9db8b4]">({account.serverUrl})</span>
                        </div>
                        <div className="text-sm text-[#9db8b4]">
                          <span>Kullanıcı: {account.username}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditXtremeAccount(account)}
                          className="px-3 py-1.5 bg-[#19e6c4] text-[#11211e] font-bold rounded-lg hover:bg-[#14b89d] transition-colors text-sm"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            if (!account.id) {
                              alert('Hesap ID bulunamadı. Lütfen sayfayı yenileyin.');
                              return;
                            }
                            handleDeleteXtremeAccount(account.id);
                          }}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#9db8b4]">
                  Henüz Xtreme Code hesabı eklenmemiş.
                </div>
              )}
            </div>

            {/* Yeni Hesap Ekle Butonu */}
            <button
              onClick={() => {
                setEditingXtremeAccount(null);
                setXtremeForm({ serverUrl: '', tvName: '', username: '', password: '', apiEndpoint: '/player_api.php' });
                setShowXtremeListModal(false);
                setShowXtremeModal(true);
              }}
              className="w-full bg-[#19e6c4] text-[#11211e] font-bold py-2 rounded-lg hover:bg-[#14b89d] transition-colors"
            >
              + Yeni Xtreme Code Hesabı Ekle
            </button>
          </div>
        </div>
      )}

      {/* Xtreme Code Ekleme/Düzenleme Modal */}
      {showXtremeModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Xtreme Code Ekle</h3>
              <button
                onClick={() => {
                  setShowXtremeModal(false);
                  setXtremeForm({ serverUrl: '', tvName: '', username: '', password: '', apiEndpoint: '/player_api.php' });
                }}
                className="text-[#9db8b4] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Kullanıcı</label>
                <p className="text-white">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Sunucu URL *</label>
                <input
                  type="text"
                  value={xtremeForm.serverUrl}
                  onChange={(e) => setXtremeForm({ ...xtremeForm, serverUrl: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="http://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">TV Adı</label>
                <input
                  type="text"
                  value={xtremeForm.tvName}
                  onChange={(e) => setXtremeForm({ ...xtremeForm, tvName: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="TV Adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Kullanıcı Adı *</label>
                <input
                  type="text"
                  value={xtremeForm.username}
                  onChange={(e) => setXtremeForm({ ...xtremeForm, username: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="Kullanıcı Adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Şifre *</label>
                <input
                  type="password"
                  value={xtremeForm.password}
                  onChange={(e) => setXtremeForm({ ...xtremeForm, password: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="Şifre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">API Endpoint</label>
                <input
                  type="text"
                  value={xtremeForm.apiEndpoint}
                  onChange={(e) => setXtremeForm({ ...xtremeForm, apiEndpoint: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="/player_api.php"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddXtremeCode}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#19e6c4] text-[#11211e] font-bold py-2 rounded-lg hover:bg-[#14b89d] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (editingXtremeAccount ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingXtremeAccount ? 'Güncelle' : 'Ekle')}
                </button>
                <button
                  onClick={() => {
                    setShowXtremeModal(false);
                    setEditingXtremeAccount(null);
                    setXtremeForm({ serverUrl: '', tvName: '', username: '', password: '', apiEndpoint: '/player_api.php' });
                    if (userXtremeAccounts.length > 0) {
                      setShowXtremeListModal(true);
                    }
                  }}
                  className="flex-1 bg-[#293836] text-white font-bold py-2 rounded-lg hover:bg-[#354644] transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IPTV Paketi Atama Modal */}
      {showPackageModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{userPackage ? 'IPTV Paketi Düzenle' : 'IPTV Paketi Ata'}</h3>
              <button
                onClick={() => {
                  setShowPackageModal(false);
                  setPackageForm({ name: '', endDate: '', quality: '', channelCount: '', status: 'Aktif' });
                  setUserPackage(null);
                }}
                className="text-[#9db8b4] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Kullanıcı</label>
                <p className="text-white">{selectedUser.name}</p>
              </div>
              {userPackage && (
                <div className="bg-[#11211e] border border-[#293836] rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#9db8b4] mb-2">Mevcut Paket:</p>
                  <p className="text-white font-semibold">{userPackage.name}</p>
                  <p className="text-xs text-[#9db8b4] mt-1">Bitiş: {userPackage.endDate || 'Sınırsız'}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Paket Adı *</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="Örn: Premium Paket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Bitiş Tarihi</label>
                <input
                  type="text"
                  value={packageForm.endDate}
                  onChange={(e) => setPackageForm({ ...packageForm, endDate: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="Örn: 24.12.2024 veya Sınırsız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Kalite</label>
                <input
                  type="text"
                  value={packageForm.quality}
                  onChange={(e) => setPackageForm({ ...packageForm, quality: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="Örn: HD, Full HD, 4K"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Kanal Sayısı</label>
                <input
                  type="text"
                  value={packageForm.channelCount}
                  onChange={(e) => setPackageForm({ ...packageForm, channelCount: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                  placeholder="Örn: 2,500+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9db8b4] mb-2">Durum</label>
                <select
                  value={packageForm.status}
                  onChange={(e) => setPackageForm({ ...packageForm, status: e.target.value })}
                  className="w-full bg-[#11211e] border border-[#293836] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#19e6c4]"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAssignPackage}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#19e6c4] text-[#11211e] font-bold py-2 rounded-lg hover:bg-[#14b89d] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (userPackage ? 'Güncelleniyor...' : 'Atanıyor...') : (userPackage ? 'Güncelle' : 'Ata')}
                </button>
                <button
                  onClick={() => {
                    setShowPackageModal(false);
                    setPackageForm({ name: '', endDate: '', quality: '', channelCount: '', status: 'Aktif' });
                  }}
                  className="flex-1 bg-[#293836] text-white font-bold py-2 rounded-lg hover:bg-[#354644] transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Anonymous Accounts View Component
const AnonymousAccountsView = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'xtreme' | 'm3u'>('all');
  const [ipFilter, setIpFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAccounts();
  }, [filterType, ipFilter]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (ipFilter) {
        params.append('ip', ipFilter);
      }

      const response = await fetch(`${backendUrl}/api/accounts/anonymous?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Load anonymous accounts error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Bu hesabı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/accounts/anonymous/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        loadAccounts();
      } else {
        alert(data.message || 'Hesap silinemedi.');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Hesap silinirken hata oluştu.');
    }
  };

  const filteredAccounts = accounts.filter(account => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (account.tvName || account.name || '').toLowerCase().includes(query) ||
        (account.serverUrl || account.url || '').toLowerCase().includes(query) ||
        (account.username || '').toLowerCase().includes(query) ||
        (account.password || '').toLowerCase().includes(query) ||
        (account.ip || '').toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Kayıtsız Hesaplar</h2>
          <p className="text-sm text-[#9db8b4]">Kayıt olmadan kullanılan M3U ve Xtreme Code hesapları</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ara (TV adı, URL, kullanıcı adı, IP...)"
            className="w-full bg-[#1a2c29] border border-[#293836] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] placeholder-gray-600"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'xtreme' | 'm3u')}
          className="bg-[#1a2c29] border border-[#293836] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4]"
        >
          <option value="all">Tümü</option>
          <option value="xtreme">Xtreme Code</option>
          <option value="m3u">M3U</option>
        </select>
        <input
          type="text"
          value={ipFilter}
          onChange={(e) => setIpFilter(e.target.value)}
          placeholder="IP adresi filtrele"
          className="bg-[#1a2c29] border border-[#293836] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] placeholder-gray-600 w-full sm:w-48"
        />
      </div>

      {/* Accounts Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#19e6c4]"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#9db8b4]">Kayıtsız hesap bulunamadı</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#293836] bg-[#1b2725] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#11211e] text-xs uppercase font-semibold text-[#9db8b4]">
                <tr>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">TV Adı / Playlist</th>
                  <th className="px-6 py-4">URL / Link</th>
                  <th className="px-6 py-4">Kullanıcı Adı</th>
                  <th className="px-6 py-4">Şifre</th>
                  <th className="px-6 py-4">IP Adresi</th>
                  <th className="px-6 py-4">Oluşturulma</th>
                  <th className="px-6 py-4">Son Güncelleme</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293836]">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-[#233935] transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium border ${
                        account.type === 'xtreme'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {account.type === 'xtreme' ? 'Xtreme Code' : 'M3U'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {account.tvName || account.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-[#9db8b4] text-xs font-mono max-w-xs truncate" title={account.serverUrl || account.url || ''}>
                      {account.serverUrl || account.url || '-'}
                    </td>
                    <td className="px-6 py-4 text-[#9db8b4]">
                      {account.username || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {account.password ? (
                          <>
                            <span className={`font-mono text-xs ${visiblePasswords.has(account.id || '') ? 'text-red-400' : 'text-yellow-400'}`}>
                              {visiblePasswords.has(account.id || '') ? account.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => {
                                const newVisible = new Set(visiblePasswords);
                                if (newVisible.has(account.id || '')) {
                                  newVisible.delete(account.id || '');
                                } else {
                                  newVisible.add(account.id || '');
                                }
                                setVisiblePasswords(newVisible);
                              }}
                              className="text-[#9db8b4] hover:text-[#19e6c4] transition-colors"
                              title={visiblePasswords.has(account.id || '') ? 'Şifreyi gizle' : 'Şifreyi göster'}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {visiblePasswords.has(account.id || '') ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[#9db8b4]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#19e6c4] font-mono text-xs" title={account.ip || 'Bilinmiyor'}>
                        {account.ip && account.ip !== 'unknown' 
                          ? account.ip.replace('::1', '127.0.0.1 (Localhost)').replace('::ffff:', '')
                          : 'Bilinmiyor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#9db8b4] text-xs">
                      {account.createdAt
                        ? new Date(account.createdAt).toLocaleString('tr-TR')
                        : account.submittedAt
                        ? new Date(account.submittedAt).toLocaleString('tr-TR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-[#9db8b4] text-xs">
                      {account.updatedAt || account.lastUsed
                        ? new Date(account.updatedAt || account.lastUsed).toLocaleString('tr-TR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="rounded p-1.5 text-[#9db8b4] hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Sil"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-4">
          <p className="text-[#9db8b4] text-sm mb-1">Toplam Hesap</p>
          <p className="text-2xl font-bold text-white">{accounts.length}</p>
        </div>
        <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-4">
          <p className="text-[#9db8b4] text-sm mb-1">Xtreme Code</p>
          <p className="text-2xl font-bold text-blue-400">
            {accounts.filter(a => a.type === 'xtreme').length}
          </p>
        </div>
        <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-4">
          <p className="text-[#9db8b4] text-sm mb-1">M3U Playlist</p>
          <p className="text-2xl font-bold text-purple-400">
            {accounts.filter(a => a.type === 'm3u').length}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;

