import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type Channel = {
  id: string;
  name: string;
  logo: string;
  status: 'live' | 'offline';
  currentProgram: string;
  category: string;
};

type Program = {
  time: string;
  title: string;
  description: string;
  type: string;
  isCurrent?: boolean;
};

const VideoPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('Spor');
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // URL'den kanal bilgisini al veya default kullan
  const channel: Channel = location.state?.channel || {
    id: '1',
    name: 'TRT 1 HD',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApt2PJZHV5DYxB2pcfnFDwK-6wUIb-Q5cTp5GzxNfoNckqghZ_p3m_qoPb9ZSXu9LkuW5-2PC0pRCwiFOU8aI87QS6apGUup8OmXb2_7EXHwX06QckFsvgLViCuX0glSITruIXPjPkGYQSszOPmyHAwvQ8poH2FWnS645UzeKL1xXgPdRNv48KJXlmEOo_WsQtMTvbUXxPZQuszEJ-XpoKVBD4Ais30j0zB1URvuIwND0hoQt2zgoauSTRtij3R37aTu5Vb8O-0Tk',
    status: 'live',
    currentProgram: 'Ana Haber Bülteni',
    category: 'Haber',
  };

  // Demo kanallar (sidebar için)
  const sidebarChannels: Channel[] = [
    { id: '1', name: 'TRT 1 HD', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApt2PJZHV5DYxB2pcfnFDwK-6wUIb-Q5cTp5GzxNfoNckqghZ_p3m_qoPb9ZSXu9LkuW5-2PC0pRCwiFOU8aI87QS6apGUup8OmXb2_7EXHwX06QckFsvgLViCuX0glSITruIXPjPkGYQSszOPmyHAwvQ8poH2FWnS645UzeKL1xXgPdRNv48KJXlmEOo_WsQtMTvbUXxPZQuszEJ-XpoKVBD4Ais30j0zB1URvuIwND0hoQt2zgoauSTRtij3R37aTu5Vb8O-0Tk', status: 'live', currentProgram: 'Ana Haber Bülteni', category: 'Haber' },
    { id: '2', name: 'ATV HD', logo: '', status: 'live', currentProgram: 'Kim Milyoner Olmak İster?', category: 'Eğlence' },
    { id: '3', name: 'Show TV HD', logo: '', status: 'live', currentProgram: 'Güldür Güldür Show', category: 'Eğlence' },
    { id: '4', name: 'TV8 HD', logo: '', status: 'live', currentProgram: 'MasterChef Türkiye', category: 'Eğlence' },
    { id: '5', name: 'Star TV HD', logo: '', status: 'live', currentProgram: 'Yalı Çapkını', category: 'Dizi' },
    { id: '6', name: 'BeIN Sports 1', logo: '', status: 'live', currentProgram: 'Galatasaray - Fenerbahçe', category: 'Spor' },
    { id: '7', name: 'S Sport', logo: '', status: 'live', currentProgram: 'NBA: Lakers vs Warriors', category: 'Spor' },
    { id: '8', name: 'NTV Spor', logo: '', status: 'live', currentProgram: 'Spor Akşamı', category: 'Spor' },
    { id: '9', name: 'NOW TV', logo: '', status: 'live', currentProgram: 'Selçuk Tepeli ile Ana Haber', category: 'Haber' },
  ];

  // EPG (Yayın Akışı) verileri
  const programs: Program[] = [
    { time: '19:00', title: 'Ana Haber Bülteni', description: 'Şu an oynatılıyor', type: 'Haber', isCurrent: true },
    { time: '20:00', title: 'Gönül Dağı', description: 'Yerli Dizi • Yeni Bölüm', type: 'Dizi' },
    { time: '23:15', title: 'Pelin Çift ile Gündem Ötesi', description: 'Talk Show', type: 'Talk Show' },
  ];

  const categories = [
    { id: 'Spor', icon: 'sports_soccer', label: 'Spor' },
    { id: 'Haber', icon: 'newspaper', label: 'Haber' },
    { id: 'Sinema', icon: 'movie', label: 'Sinema' },
    { id: 'Belgesel', icon: 'public', label: 'Belgesel' },
    { id: 'Ulusal', icon: 'tv', label: 'Ulusal' },
    { id: 'Çocuk', icon: 'child_care', label: 'Çocuk' },
    { id: 'Müzik', icon: 'music_note', label: 'Müzik' },
    { id: 'Favoriler', icon: 'favorite', label: 'Favoriler' },
  ];

  const filteredSidebarChannels = sidebarChannels.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChannelClick = (selectedChannel: Channel) => {
    navigate('/player', { state: { channel: selectedChannel } });
    window.location.reload(); // Sayfayı yenile (state güncellemesi için)
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleBack = () => {
    navigate('/channels');
  };

  return (
    <div className="bg-[#f6f8f8] dark:bg-[#11211e] font-display text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden w-full">
      {/* Header Section */}
      <header className="shrink-0 border-b border-[#293836] bg-[#11211e] z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[#19e6c4] to-emerald-600 shadow-[0_0_15px_rgba(25,230,196,0.3)] hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-black font-bold">live_tv</span>
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">IPTV Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full border-2 border-[#11211e]"></span>
            </button>
            <div className="h-8 w-px bg-[#293836] mx-2"></div>
            <div className="bg-gradient-to-br from-[#19e6c4] to-emerald-600 rounded-full size-10 border-2 border-[#293836] flex items-center justify-center text-white font-bold">
              AY
            </div>
          </div>
        </div>

        {/* Category Bar */}
        <div className="px-6 pb-4 pt-0">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all active:scale-95 ${
                  selectedCategory === category.id
                    ? 'bg-[#19e6c4] shadow-[0_0_10px_rgba(25,230,196,0.2)]'
                    : 'bg-[#1a2c29] border border-[#293836] hover:bg-[#243834] hover:border-gray-600'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    selectedCategory === category.id ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {category.icon}
                </span>
                <span
                  className={`text-sm font-medium ${
                    selectedCategory === category.id
                      ? 'text-black font-semibold'
                      : 'text-gray-300'
                  }`}
                >
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-0 lg:p-6 lg:pt-2">
        {/* Video Player Section (Left) */}
        <div className="lg:col-span-9 flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/* Player Container */}
          <div className="bg-black relative aspect-video w-full rounded-none lg:rounded-2xl overflow-hidden group shadow-2xl">
            {/* Video Image Placeholder */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBnSo10WMVdDCXcW-fCsR8p1t1a2EcAbA8wmm2hWZLHZ6dMa_R2UArLsW7rdgS-aI40n7r3ANxc2njTnrqWf2Zdb6idHxxgeYVzVPiwSUKvoUsMhx84B-sdbEJDfMsw-qtzMPA7dBl3U6SJJN5NQYrUmWzhOW_5dbmZ_BJytMHVb936teut4k09bIOOP4jLl4mveZpYfLFcTEwrhNottmdLdjHnhBfQS6xsRTUjQyCB5OteQ8UpKBuJBsvocpFK97HjZCizsR2uYIg")',
              }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>

            {/* Center Play Button */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <button
                onClick={handlePlayPause}
                className="bg-[#19e6c4]/90 text-black rounded-full size-20 flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_30px_rgba(25,230,196,0.4)]"
              >
                <span className="material-symbols-outlined text-[48px] ml-1">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>

            {/* Top Overlay Info */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <p className="text-white font-medium text-sm flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                  CANLI
                </p>
              </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black via-black/60 to-transparent">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-4 group/progress cursor-pointer">
                <span className="text-xs font-medium text-white/80">Canlı</span>
                <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 w-[85%] bg-white/10"></div>
                  <div className="absolute inset-y-0 left-0 w-[82%] bg-[#19e6c4] shadow-[0_0_10px_rgba(25,230,196,0.8)]"></div>
                </div>
                <span className="text-xs font-medium text-white/80">-0:45</span>
              </div>

              {/* Buttons Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-[#19e6c4] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[32px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button className="text-white hover:text-[#19e6c4] transition-colors">
                    <span className="material-symbols-outlined text-[28px]">replay_10</span>
                  </button>
                  <div className="flex items-center gap-2 group/volume ml-2">
                    <button className="text-white hover:text-[#19e6c4] transition-colors">
                      <span className="material-symbols-outlined">volume_up</span>
                    </button>
                    <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                      <div className="h-1 bg-white/30 rounded-full w-20 ml-2 cursor-pointer">
                        <div className="h-full w-2/3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium border border-white/10 rounded px-2 py-1 bg-black/20">
                    HD <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                  <button className="text-white hover:text-[#19e6c4] transition-colors">
                    <span className="material-symbols-outlined">subtitles</span>
                  </button>
                  <button className="text-white hover:text-[#19e6c4] transition-colors">
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Information Area */}
          <div className="p-5 lg:px-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{channel.name}</h2>
                  <span className="bg-[#19e6c4]/20 text-[#19e6c4] px-2 py-0.5 rounded text-xs font-bold border border-[#19e6c4]/20">
                    1080p
                  </span>
                </div>
                <h3 className="text-lg text-gray-300 font-medium mb-3">Canlı Yayın: {channel.currentProgram}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-[#1a2c29] border border-[#293836] rounded px-3 py-1 text-xs text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    19:00 - 20:00
                  </div>
                  <div className="bg-[#1a2c29] border border-[#293836] rounded px-3 py-1 text-xs text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">category</span>
                    {channel.category}
                  </div>
                  <div className="bg-[#1a2c29] border border-[#293836] rounded px-3 py-1 text-xs text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">language</span>
                    TR
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                  Türkiye ve dünyadan en sıcak gelişmeler, son dakika haberleri ve özel dosyalar Ana Haber Bülteni ile
                  ekranlarınıza geliyor. Gündemin nabzını tutan özel röportajlar ve uzman konuklarla derinlemesine
                  analizler.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="flex items-center justify-center gap-2 bg-[#1a2c29] hover:bg-[#243834] border border-[#293836] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                  Favori Ekle
                </button>
                <button className="flex items-center justify-center gap-2 bg-[#1a2c29] hover:bg-[#243834] border border-[#293836] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  Paylaş
                </button>
              </div>
            </div>

            {/* Next Program (EPG) */}
            <div className="mt-8">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#19e6c4]">upcoming</span>
                Yayın Akışı
              </h4>
              <div className="space-y-2">
                {programs.map((program, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-lg relative overflow-hidden transition-colors ${
                      program.isCurrent
                        ? 'bg-[#1a2c29]/50 border border-[#19e6c4]/30'
                        : 'hover:bg-[#1a2c29] border border-transparent hover:border-[#293836] cursor-pointer group'
                    }`}
                  >
                    {program.isCurrent && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#19e6c4]"></div>
                    )}
                    <span
                      className={`font-medium text-sm w-12 shrink-0 ${
                        program.isCurrent ? 'text-[#19e6c4] font-bold' : 'text-gray-400 group-hover:text-white'
                      }`}
                    >
                      {program.time}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          program.isCurrent
                            ? 'text-white'
                            : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {program.title}
                      </p>
                      <p className="text-gray-500 text-xs">{program.description}</p>
                    </div>
                    {program.isCurrent ? (
                      <div className="bg-[#19e6c4]/10 p-1.5 rounded text-[#19e6c4]">
                        <span className="material-symbols-outlined text-[18px] block">play_circle</span>
                      </div>
                    ) : (
                      <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity">
                        <span className="material-symbols-outlined text-[20px]">notifications_none</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Channel List (Right) */}
        <div className="lg:col-span-3 flex flex-col h-[500px] lg:h-full bg-[#1a2c29] lg:rounded-2xl border-t lg:border border-[#293836] overflow-hidden">
          {/* Sidebar Header / Search */}
          <div className="p-4 border-b border-[#293836] bg-[#1a2c29]/95 backdrop-blur z-10">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-outlined text-[20px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11211e] border border-[#293836] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#19e6c4] focus:ring-1 focus:ring-[#19e6c4] placeholder-gray-600 transition-all"
                placeholder="Kanal ara..."
                type="text"
              />
            </div>
          </div>

          {/* List Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredSidebarChannels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => handleChannelClick(ch)}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer relative overflow-hidden transition-all ${
                  ch.id === channel.id
                    ? 'bg-[#243834] border-l-4 border-[#19e6c4]'
                    : 'hover:bg-white/5 border-l-4 border-transparent hover:border-white/20'
                }`}
              >
                {ch.id === channel.id && (
                  <div className="absolute inset-0 bg-[#19e6c4]/5 pointer-events-none"></div>
                )}
                <div
                  className={`relative size-10 shrink-0 rounded overflow-hidden flex items-center justify-center p-1 ${
                    ch.id === channel.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                >
                  {ch.logo ? (
                    <img alt={`${ch.name} Logo`} className="w-full h-full object-contain" src={ch.logo} />
                  ) : (
                    <div className="text-white font-bold text-xs">{ch.name.substring(0, 3).toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        ch.id === channel.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}
                    >
                      {ch.name}
                    </h4>
                    {ch.id === channel.id && (
                      <span className="size-1.5 rounded-full bg-[#19e6c4] animate-pulse shadow-[0_0_8px_#19e6c4]"></span>
                    )}
                  </div>
                  <p
                    className={`text-xs truncate ${
                      ch.id === channel.id
                        ? 'text-[#19e6c4]'
                        : 'text-gray-500 group-hover:text-gray-400'
                    }`}
                  >
                    {ch.currentProgram}
                  </p>
                </div>
                {ch.id === channel.id && (
                  <div className="opacity-100 transition-opacity z-10">
                    <span className="material-symbols-outlined text-[#19e6c4] text-[20px]">equalizer</span>
                  </div>
                )}
                {ch.status === 'live' && ch.id !== channel.id && (
                  <span className="text-red-500 text-[10px] border border-red-500/30 bg-red-500/10 px-1 rounded">
                    LIVE
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar Footer Status */}
          <div className="p-3 bg-[#243834] border-t border-[#293836] flex justify-between items-center text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500"></div>
              <span>Online: 412 Kanal</span>
            </div>
            <span>v2.4.1</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;

