import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const users: User[] = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGNvZlE5-bO05H6Z6zobpvtAIg9IsnO8iRFUjHUdYz1omv0EfLlvD0zRPWeARWi5MjqlXZ1oMC-mEr2hW12Jej-Ex3MZKWRrj2whGZxMaBOHnrBfzOh0KrcjEPFv8QLVFRfM4d7q_Sgfxfc9HjWg-63wBWky8loJe542mSQUf2hgBaLJFVTwbqChNtI1jK0WVwjv8dIles_31hiUj3rmDJlJ6ZItW5rlIjLoevbNulFsUA7kUUoh-WxlM7Jvubi4Q5QiQvtWwPXJM',
      userId: '#849302',
      registerDate: '12.01.2023',
      lastLogin: 'Bugün 10:30',
      status: 'Aktif',
    },
    {
      id: '2',
      name: 'Ayşe Demir',
      email: 'ayse@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeoG3ilKLx760qyy2mt7zi-vLYueVoocjRLw3vL5uaP4bzVDJDBtkjgjgzlrUNQW2NyIm6qfw--psjZZgIYnuy4Br8sLqc0P6U55EH_s_nON2Yg-etqDuR_0URiKLaJi4sn98wjg_L1xiQkCAXhqVBJ5UjMeN12R7yNrz51mFnMf1tJtdv4aLtcO--75aWtymwlR7oXHF1B-4k2agb2JR2H7Bl5yVFKdRv_4RYNpsqTgJcgpPZx0t0wVOzqe7_RVdH7LtYdTs0XFo',
      userId: '#738291',
      registerDate: '15.02.2023',
      lastLogin: 'Dün 14:20',
      status: 'Aktif',
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOGl_bl644ifhtxJVTzJGLkGr4osGyCkw4kwBvhzNTWhxLacFt2-_7r4uY1F8X-DcJsdZspSwLosexhkg3habKcOReS1kCz7_Ezwe1_gqbIAU1KKQRSzU2URXyZIQYhrxE2q9Pkr3ger-RbMQT_gadYEF4D5hvZ_92cImoIDoS3QCwznVXSFOlqU_3ZAuafZ-Jl4_4unohuSzXKHMkRIAkpZbsrgRAj6FTxSBnHAhZ1XG5-8pagOaV_sdXkaXqhydmc8MCMhRrw8A',
      userId: '#192837',
      registerDate: '20.03.2023',
      lastLogin: '2 gün önce',
      status: 'Pasif',
    },
    {
      id: '4',
      name: 'Fatma Çelik',
      email: 'fatma@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFqJr9-yeZ4__2KhC0MvbKtfCxUtnbXnN_b1xs3l8KbMWB0Q7TuM8Wh50LRKaIT5mES-dQBQ-aJwyuT_zKBYnwTZu9_ZhjIGRS4CvW1cmhX8kcgorlKCZ1YZkujN1ZRPFRIxtBhjGGWTuI7u1fvQArmusYOIH-UftJ_S1kqIhHiQdtbyX9fMKlaFwxDeZ0NQgZO4tZGrOx2_0MGGmCjAjoDfn-SfMnv3cgsO6hWKOlGI-902FLBj-vkxILdMVgRDEVQb1gQBEZwmk',
      userId: '#473821',
      registerDate: '05.04.2023',
      lastLogin: '1 hafta önce',
      status: 'Aktif',
    },
    {
      id: '5',
      name: 'Ali Vural',
      email: 'ali@example.com',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG3I-NjXesvxzCkXdXHKOMLEEHS7jky_Wyx0ly0WRmMgHqZUZnMGjkqZqDf9FLpUXoaue2bjMe_QeY0_JhGVewhmnptZI6u7J-pT8XDt_hPIE_ICy3RS414pN2auyeBzI76ADHiO9V_a-rATITY-cleD4GQT--MurPEzeFo4CkZ7IPYSftWvJ0CPe2TZJyToeIJxea6HXSHCyy-5Y5W28A3f2tsyixcuaKuTKFxvr-CUxQh0jO0qJoqBhyFekiSt034tTtthxbCu8',
      userId: '#928374',
      registerDate: '10.05.2023',
      lastLogin: '1 ay önce',
      status: 'Pasif',
    },
  ];

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
          {activeTab === 'users' ? (
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
}: {
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
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

  const handleEdit = (userId: string) => {
    alert(`Kullanıcı düzenleme: ${userId}`);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      alert(`Kullanıcı silindi: ${userId}`);
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
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="rounded p-1.5 text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
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
    </div>
  );
};

export default AdminPanel;

