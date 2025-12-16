import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Channel = {
  id: string;
  name: string;
  logo: string;
  status: 'live' | 'offline';
  currentProgram: string;
  category: string;
};

const ChannelList = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popülerlik');

  // Demo kanallar
  const channels: Channel[] = [
    { id: '1', name: 'BBC Sport', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBztjPEIpnJkU8XQDz9_Q1NGMa1w5QN0OqQNQXaMcZNd_qvHblG4Ic0HOi24ZzwcyG1y8gNWe8GOU4bXWMaKxVefRN3KF9eYm-0idZGeMubrd2sTodJlikU1WD88rD4vEgAaswuSLHFaMy-EhNd7LwddA33b0DewguGr_uGnBvxuL510kx8UlUVQxd6m5lpAPx_SfwkCILPB802dNsLbEsw12edpdpQ0ZPAAszF94oTFpzfmCgs3zxxKof-alTt1W2sdLjIvO5gyJ8', status: 'live', currentProgram: 'Football Focus', category: 'Futbol' },
    { id: '2', name: 'Eurosport 1', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD87Z8nUAnNp5SKWDyXp1weZ_DUQxNwUxI-ioM9Scr6Shj7aghg4qKbZ-UIuEDBJ2j53WudKJcT_7T3wQwQTuxbSCcuSHVShbM5q6-ZwV-eskxYEylXz4JE07MbnSAxKqsEoFRCxCi_YnXSfhR2RjI9MHhjJDwKOj44kTee1NF2yumhtd18at7utao2TjmY17nteRDzYHu0oOdy4HWfBqwXTHoM21pzcfhM3Lhy1xYFJseDzsI9JolrlAZuclKqFOjrR2OY6daesFo', status: 'live', currentProgram: 'Tour de France', category: 'Motor Sporları' },
    { id: '3', name: 'BeIN Sports 1', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnsVjJoa9y79vPFH8oq9QWz-fL_3o_-KoSS2B8fhPmhuV1S1Lot18oDJkeDnlSeYaEkFc6O3M6wv8cxOiPm2A3LJhmm7z4anNf9WUJ5PUgEo7QAeDOTeyYSMwYv79-iU8k9ZAFLNaLGQQfSsK7Jvia1ld8che_CMP0HYTMrEDHamtXRkUFD-gj4XXPzPJcKxY7YXYBZG_r3GwQ58od-dg5maMqUpshCt_-eTrjXiOiI0uizQPCvOLEvmg8eWCkTbAEydllvH8J_Bs', status: 'live', currentProgram: 'Süper Lig: GS vs FB', category: 'Futbol' },
    { id: '4', name: 'Sky Sports PL', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4iBNvBHVgBd7eI-KVnyXRt0oG_yzmY2dFo3V9LwGhtkGuwOlox4p8O2Xh32VQpp7aENOxlxHaQBMvzVQ-JiOXHJMOM6UDs91llJvG3G5VNDyUi4FuZ4F6LjE3MbJmxA2L_6vewx0MDEM5fgF3b-KeR2RTZZ-sVP-52KTSNtySB0JFAkM0ydWD-lePrEp9Ef4muf7lJX9F35P5ZGS6PJ6w66ab-gZ5K_C5Ufm4B6HtOgoULuncZ0U5-egJ9tSsdmuX9Wxd4xkvQ4', status: 'live', currentProgram: 'Match Day Live', category: 'Futbol' },
    { id: '5', name: 'ESPN', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA55k0MkRN-0RdjrCk2TAiqAuXolRLgxF3KJWTjw3bdkTTcIKw2C6qxTkLGT3tWN10gfhRh0o7TU_39y9Y7YapMducRqh2eUzoSVziiXXEwJYzhhAVJju7qyGJdOxCuXkZeMpj8_KI6RPQudC6qAmBCZoinpUdwCwKdHX6UAtAKtDwLN4mU7hjL8JFCZOtYyHXIyvMzClyhDIPP0cUaC9whn6ne4oqxkCYZkW0so5kFxEDmj8axK7rGB3Gc1qyve_aQtpqT_dc6IuM', status: 'live', currentProgram: 'NBA Tonight', category: 'Basketbol' },
    { id: '6', name: 'Fox Sports', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtSC15DnAu8DMW8aPAbRp55-qoMewg4ryVGkBW7kRqKAXVyH7Aw1G-cZ8MNvTYq_bQ-4bBH_X9SW0A7jnLZx-aYiv5zJXS8N8l0VMURkylEXaWbtwabLLROgOu3-VmQ6mA6hX2xwDUmBldpZ4vKb-q72c2Sb9-DdyU0szPDdhwpnMykprEq0Ca_QwJVSv5FF11w9DN1aYMQQMn2vufAkRHNbUGRisHPl2dSxFH0k5v7D0aOFUOrXBeHUg36Y_P3EBza4XK1VGznUw', status: 'offline', currentProgram: 'Yayın yok', category: 'Futbol' },
    { id: '7', name: 'Canal+ Sport', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQClwjaFZpNjmL6xHXP05NpkCneAK0O-Z7gmLF2fL8T7xLgLlKvmfs-wDHxYQnxZrh6timK0OVrwyoTsSrCTIEn1MBKwxY3Ywp_r7yMGjQO2VnX_c4b7gKsxI9E-5pqCk3IQV3N10cE70J10Iybri9OGjvxaVyGyd84qH41KumiHR2_wGTnzBjgZF9cyEmfCo-D66_2Vy_loccY5E5t8O32xP96xQs3_sTMmEDULNavScv6P8PcJ_LFdAcq6QQsJJrwZqS8RBPCBA', status: 'live', currentProgram: 'Ligue 1', category: 'Futbol' },
    { id: '8', name: 'DAZN 1', logo: '', status: 'live', currentProgram: 'Boxing Fight Night', category: 'Boks' },
    { id: '9', name: 'S Sport', logo: '', status: 'live', currentProgram: 'F1 GP Highlights', category: 'Motor Sporları' },
    { id: '10', name: 'TRT Spor', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfO9LnzmDtk-7891DyYQGFs7V-k_NpCfy4hbqKbwZ_BUxSC2J2E6JWHMv-d6Qy3XReQ8BKydQCTfXiFKQ34XmDVOdI5ABKnr-P1Xm91ys_Uukg8hqG_hMlD5_hVUv_zBKe8GNEsBLHoGF3vYwFvQ-tCYIytFAI6TDwAt2xuDgVfWn1zJ5aege_EjGKxLRDPNnGmO-fhiAn_f2o60EjPgnMnaeH9OzXLAJOWbtY-Yw-OcMFAMH9lGAsPM77tB5yVwJnuuKTSgIOioY', status: 'live', currentProgram: 'Spor Artı', category: 'Futbol' },
  ];

  const categories = ['Tümü', 'Futbol', 'Basketbol', 'Motor Sporları', 'Tenis', 'Voleybol'];

  const filteredChannels = channels.filter(channel => {
    const matchesCategory = selectedCategory === 'Tümü' || channel.category === selectedCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleChannelClick = (channel: Channel) => {
    // Kanal oynatma sayfasına yönlendir
    alert(`${channel.name} kanalı açılıyor... (Demo)`);
  };

  const handleLogout = () => {
    localStorage.removeItem('xtremeCodeCredentials');
    localStorage.removeItem('xtremeCodeConnected');
    navigate('/');
  };

  return (
    <div className="font-display bg-[#f6f8f8] dark:bg-[#11211e] text-[#111817] dark:text-white h-screen overflow-hidden flex flex-col md:flex-row w-full">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a2624] border-b dark:border-[#293836]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#19e6c4]">live_tv</span>
          <span className="font-bold text-lg">IPTV Player</span>
        </div>
        <button className="p-2 text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Side Navigation */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-[#1a2624] border-r border-[#293836] flex-shrink-0">
        {/* User Profile Area */}
        <div className="p-6 border-b border-[#293836]">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-[#19e6c4] to-[#14b89d] rounded-full h-12 w-12 border-2 border-[#19e6c4]/20 flex items-center justify-center text-white font-bold">
              AY
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-white text-base font-bold truncate">Ahmet Yılmaz</h1>
              <p className="text-[#19e6c4] text-xs font-medium">Premium Üyelik</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer">
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">favorite</span>
            <span className="text-sm font-medium">Favoriler</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#19e6c4]/10 text-[#19e6c4] transition-colors cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tv</span>
            <span className="text-sm font-medium">Canlı TV</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer">
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">movie</span>
            <span className="text-sm font-medium">Filmler</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer">
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">smart_display</span>
            <span className="text-sm font-medium">Diziler</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer">
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">history</span>
            <span className="text-sm font-medium">İzlemediklerim</span>
          </a>
          <div className="my-4 border-t border-[#293836] mx-3"></div>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer">
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">settings</span>
            <span className="text-sm font-medium">Ayarlar</span>
          </a>
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">logout</span>
            <span className="text-sm font-medium">Çıkış</span>
          </a>
        </nav>

        {/* Bottom Banner */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-[#293836] to-[#1a2624] p-4 rounded-xl border border-[#3e524f]">
            <p className="text-xs text-[#9db8b4] mb-2">Abonelik Bitiş:</p>
            <p className="text-white text-sm font-bold">12 Aralık 2024</p>
            <button className="mt-3 w-full bg-[#19e6c4]/20 hover:bg-[#19e6c4]/30 text-[#19e6c4] text-xs font-bold py-2 rounded transition-colors">
              Uzat
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f6f8f8] dark:bg-[#11211e] h-full relative">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#293836] bg-[#1a2624]/50 backdrop-blur-md sticky top-0 z-20">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#9db8b4]">Canlı TV</span>
            <span className="material-symbols-outlined text-[#9db8b4] text-[16px]">chevron_right</span>
            <span className="text-white font-medium">Spor Kanalları</span>
          </div>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-[#293836] rounded-lg h-10 w-64 px-3 focus-within:ring-1 focus-within:ring-[#19e6c4] transition-all">
              <span className="material-symbols-outlined text-[#9db8b4]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder-[#9db8b4] text-sm w-full focus:ring-0 outline-none"
                placeholder="Kanal ara..."
                type="text"
              />
            </div>
            <button className="relative p-2 rounded-lg bg-[#293836] hover:bg-[#3e524f] text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#19e6c4] rounded-full border border-[#293836]"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {/* Headline & Filter Chips */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Spor Kanalları</h2>
              <div className="flex items-center gap-2 text-sm text-[#9db8b4]">
                <span>Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#293836] border-none rounded text-white text-sm py-1 pl-3 pr-8 focus:ring-1 focus:ring-[#19e6c4] outline-none"
                >
                  <option>Popülerlik</option>
                  <option>A-Z</option>
                  <option>Yeni Eklenenler</option>
                </select>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#19e6c4] text-[#11211e] font-bold hover:scale-105'
                      : 'bg-[#293836] text-[#9db8b4] hover:text-white hover:bg-[#3e524f]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className="group relative bg-[#1a2624] hover:bg-[#202e2c] border border-[#293836] hover:border-[#19e6c4]/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${channel.name} favorilere eklendi!`);
                    }}
                    className="text-white hover:text-[#19e6c4] bg-black/50 rounded-full p-1 backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                </div>
                <div className="aspect-square flex items-center justify-center bg-black/20 rounded-lg mb-3 p-4">
                  {channel.logo ? (
                    <img
                      alt={`${channel.name} Logo`}
                      className="w-full h-auto object-contain max-h-[60px]"
                      src={channel.logo}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {!channel.logo && (
                    <div className="text-4xl font-bold text-white/20">
                      {channel.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-white font-semibold text-sm truncate">{channel.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        channel.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                      }`}
                    ></span>
                    <span className="text-[#9db8b4] text-xs">
                      {channel.status === 'live' ? 'Canlı' : 'Çevrimdışı'}
                    </span>
                  </div>
                  <p className="text-[#9db8b4] text-xs mt-1 truncate group-hover:text-[#19e6c4] transition-colors">
                    {channel.currentProgram}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          <div className="flex justify-center mt-12 mb-6">
            <div className="flex items-center gap-2 text-[#9db8b4]">
              <div className="w-5 h-5 border-2 border-[#19e6c4] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Daha fazla kanal yükleniyor...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChannelList;

