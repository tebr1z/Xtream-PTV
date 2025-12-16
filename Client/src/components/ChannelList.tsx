import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiveCategories, getLiveStreams } from '../services/xtremeCodeService';

type XtremeCodeStream = {
  stream_id: string;
  num: number;
  name: string;
  stream_type: string;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  category_ids: number[];
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
};

type XtremeCodeCategory = {
  category_id: string;
  category_name: string;
  parent_id: number;
};

type Channel = {
  id: string;
  name: string;
  logo: string;
  status: 'live' | 'offline';
  currentProgram: string;
  category: string;
  streamUrl?: string;
  streamId?: string;
};

const ChannelList = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<{ serverUrl: string; username: string; password: string } | null>(null);
  const [categories, setCategories] = useState<XtremeCodeCategory[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popülerlik');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage'dan credentials'ları al
  useEffect(() => {
    const storedCredentials = localStorage.getItem('xtremeCodeCredentials');
    if (storedCredentials) {
      try {
        const creds = JSON.parse(storedCredentials);
        setCredentials({
          serverUrl: creds.serverUrl,
          username: creds.username,
          password: creds.password,
        });
      } catch (err) {
        console.error('Credentials parse error:', err);
        setError('Giriş bilgileri yüklenemedi. Lütfen tekrar giriş yapın.');
        navigate('/xtreme-code');
      }
    } else {
      setError('Giriş yapılmamış. Lütfen önce giriş yapın.');
      navigate('/xtreme-code');
    }
  }, [navigate]);

  // Kategorileri yükle (cache ile)
  useEffect(() => {
    if (!credentials) return;

    const loadCategories = async () => {
      try {
        // Cache'den kontrol et
        const cacheKey = `xtreme_categories_${credentials.serverUrl}_${credentials.username}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Cache 5 dakika geçerli
        const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
        const now = Date.now();
        
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          try {
            const categoriesData = JSON.parse(cachedData);
            if (Array.isArray(categoriesData)) {
              setCategories(categoriesData);
              return; // Cache'den yüklendi, API çağrısı yapma
            }
          } catch (e) {
            // Cache bozuksa devam et
          }
        }
        
        setIsLoading(true);
        const categoriesData = await getLiveCategories(
          credentials.serverUrl,
          credentials.username,
          credentials.password
        );
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          // Cache'e kaydet
          localStorage.setItem(cacheKey, JSON.stringify(categoriesData));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        }
      } catch (err) {
        console.error('Categories load error:', err);
        setError('Kategoriler yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [credentials]);

  // Kanalları yükle (cache ile)
  useEffect(() => {
    if (!credentials) return;

    const loadStreams = async () => {
      try {
        // Cache'den kontrol et
        const categoryId = selectedCategory === 'all' ? undefined : selectedCategory;
        const cacheKey = `xtreme_streams_${credentials.serverUrl}_${credentials.username}_${categoryId || 'all'}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Cache 5 dakika geçerli
        const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
        const now = Date.now();
        
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          try {
            const streamsData = JSON.parse(cachedData);
            if (Array.isArray(streamsData)) {
              // Streams'i Channel formatına dönüştür
              const channelsData: Channel[] = streamsData.map((stream: XtremeCodeStream) => ({
                id: stream.stream_id,
                name: stream.name,
                logo: stream.stream_icon || '',
                status: 'live' as const,
                currentProgram: 'Canlı Yayın',
                category: stream.category_id || 'Genel',
                streamUrl: stream.direct_source,
                streamId: stream.stream_id,
              }));

              // Sıralama
              let sortedChannels = [...channelsData];
              if (sortBy === 'A-Z') {
                sortedChannels.sort((a, b) => a.name.localeCompare(b.name));
              } else if (sortBy === 'Yeni Eklenenler') {
                sortedChannels.sort((a, b) => {
                  const streamA = streamsData.find((s: XtremeCodeStream) => s.stream_id === a.id);
                  const streamB = streamsData.find((s: XtremeCodeStream) => s.stream_id === b.id);
                  const dateA = streamA?.added ? new Date(streamA.added).getTime() : 0;
                  const dateB = streamB?.added ? new Date(streamB.added).getTime() : 0;
                  return dateB - dateA;
                });
              }

              setChannels(sortedChannels);
              return; // Cache'den yüklendi, API çağrısı yapma
            }
          } catch (e) {
            // Cache bozuksa devam et
          }
        }
        
        setIsLoading(true);
        const streamsData = await getLiveStreams(
          credentials.serverUrl,
          credentials.username,
          credentials.password,
          categoryId
        );

        if (Array.isArray(streamsData)) {
          // Cache'e kaydet
          localStorage.setItem(cacheKey, JSON.stringify(streamsData));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
          
          // Streams'i Channel formatına dönüştür
          const channelsData: Channel[] = streamsData.map((stream: XtremeCodeStream) => ({
            id: stream.stream_id,
            name: stream.name,
            logo: stream.stream_icon || '',
            status: 'live' as const,
            currentProgram: 'Canlı Yayın',
            category: stream.category_id || 'Genel',
            streamUrl: stream.direct_source,
            streamId: stream.stream_id,
          }));

          // Sıralama
          let sortedChannels = [...channelsData];
          if (sortBy === 'A-Z') {
            sortedChannels.sort((a, b) => a.name.localeCompare(b.name));
          } else if (sortBy === 'Yeni Eklenenler') {
            sortedChannels.sort((a, b) => {
              const streamA = streamsData.find((s: XtremeCodeStream) => s.stream_id === a.id);
              const streamB = streamsData.find((s: XtremeCodeStream) => s.stream_id === b.id);
              const dateA = streamA?.added ? new Date(streamA.added).getTime() : 0;
              const dateB = streamB?.added ? new Date(streamB.added).getTime() : 0;
              return dateB - dateA;
            });
          }

          setChannels(sortedChannels);
        }
      } catch (err) {
        console.error('Streams load error:', err);
        setError('Kanallar yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, [credentials, selectedCategory, sortBy]);

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleChannelClick = (channel: Channel) => {
    navigate('/player', { state: { channel } });
  };

  const handleLogout = () => {
    localStorage.removeItem('xtremeCodeCredentials');
    localStorage.removeItem('xtremeCodeConnected');
    navigate('/');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
  };

  if (error && !credentials) {
    return (
      <div className="font-display bg-[#f6f8f8] dark:bg-[#11211e] text-[#111817] dark:text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/xtreme-code')}
            className="bg-primary text-background-dark px-6 py-2 rounded-lg font-bold"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-[#f6f8f8] dark:bg-[#11211e] text-[#111817] dark:text-white h-screen overflow-hidden flex flex-col md:flex-row w-full">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a2624] border-b dark:border-[#293836]">
        <div className="flex items-center gap-2">
          <div className="size-6 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
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
              {credentials?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-white text-base font-bold truncate">{credentials?.username || 'Kullanıcı'}</h1>
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
            <p className="text-xs text-[#9db8b4] mb-2">Aktif Kanallar:</p>
            <p className="text-white text-sm font-bold">{channels.length} Kanal</p>
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
            <span className="text-white font-medium">
              {selectedCategory === 'all' 
                ? 'Tüm Kanallar' 
                : categories.find(c => c.category_id === selectedCategory)?.category_name || 'Kanallar'}
            </span>
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
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {selectedCategory === 'all' 
                  ? 'Tüm Kanallar' 
                  : categories.find(c => c.category_id === selectedCategory)?.category_name || 'Kanallar'}
              </h2>
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
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#19e6c4] text-[#11211e] font-bold hover:scale-105'
                    : 'bg-[#293836] text-[#9db8b4] hover:text-white hover:bg-[#3e524f]'
                }`}
              >
                Tümü
              </button>
              {categories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => handleCategoryChange(category.category_id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.category_id
                      ? 'bg-[#19e6c4] text-[#11211e] font-bold hover:scale-105'
                      : 'bg-[#293836] text-[#9db8b4] hover:text-white hover:bg-[#3e524f]'
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#19e6c4] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#9db8b4] text-sm">Kanallar yükleniyor...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-background-dark px-6 py-2 rounded-lg font-bold"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-[#9db8b4] text-sm">Kanal bulunamadı</p>
            </div>
          ) : (
            <>
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

              {/* Results Count */}
              <div className="flex justify-center mt-8 mb-6">
                <p className="text-[#9db8b4] text-sm">
                  {filteredChannels.length} kanal gösteriliyor
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChannelList;
