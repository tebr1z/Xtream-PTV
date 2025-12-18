import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLiveCategories, getLiveStreams } from '../services/xtremeCodeService';
import { getM3UCategories, getM3UChannelsByCategory } from '../services/m3uService';
import Footer from './Footer';

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
  const location = useLocation();
  const params = useParams<{ lang?: string }>();
  const { t } = useTranslation();
  const lang = params.lang || 'tr';
  const [sourceType, setSourceType] = useState<'xtreme' | 'm3u'>('xtreme');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [credentials, setCredentials] = useState<{ serverUrl: string; username: string; password: string } | null>(null);
  const [m3uChannels, setM3UChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<XtremeCodeCategory[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popülerlik');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // Cache reset kontrolü
  const [lastCacheReset, setLastCacheReset] = useState<number | null>(null);
  const [isResettingCache, setIsResettingCache] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  // localStorage'dan credentials'ları al (Xtreme Code veya M3U)
  useEffect(() => {
    if (isInitialized) return; // Sadece bir kez çalışsın
    
    setIsLoading(true);
    setError(null);
    
    // location.state'den sourceType'ı kontrol et (öncelikli)
    const stateSourceType = (location.state as any)?.sourceType;
    
    // ÖNCE: activeXtremeCodeAccount kontrol et (kullanıcının kendi seçtiği hesap - en yüksek öncelik)
    const activeXtremeAccount = localStorage.getItem('activeXtremeCodeAccount');
    if (activeXtremeAccount) {
      try {
        const account = JSON.parse(activeXtremeAccount);
        if (!stateSourceType || stateSourceType === 'xtreme') {
          setCredentials({
            serverUrl: account.serverUrl,
            username: account.username,
            password: account.password
          });
          setSourceType('xtreme');
          setIsInitialized(true);
          return; // M3U kontrolünü atla
        }
      } catch (err) {
        console.error('Active Xtreme account parse error:', err);
      }
    }
    
    // Eğer Xtreme Code için geldiyse ve activeXtremeAccount yoksa, eski yöntemi kontrol et
    if (stateSourceType === 'xtreme') {
      const storedCredentials = localStorage.getItem('xtremeCodeCredentials');
      if (storedCredentials) {
        try {
          const creds = JSON.parse(storedCredentials);
          setCredentials({
            serverUrl: creds.serverUrl,
            username: creds.username,
            password: creds.password
          });
          setSourceType('xtreme');
          setIsInitialized(true);
          return;
        } catch (err) {
          console.error('Credentials parse error:', err);
        }
      }
    }
    
    // Eğer M3U için geldiyse veya sourceType belirtilmemişse M3U kontrol et
    if (stateSourceType === 'm3u' || !stateSourceType) {
      const m3uLoaded = localStorage.getItem('m3uLoaded');
      const m3uChannelsData = localStorage.getItem('m3uChannels');
      
      if (m3uLoaded === 'true' && m3uChannelsData) {
        try {
          const channels = JSON.parse(m3uChannelsData);
          if (Array.isArray(channels) && channels.length > 0) {
            setM3UChannels(channels);
            setSourceType('m3u');
            
            // M3U kategorilerini çıkar
            const m3uCategories = getM3UCategories(channels);
            setCategories(m3uCategories);
            
            // M3U kanallarını formatla
            const formattedChannels: Channel[] = channels.map((ch: any) => ({
              id: ch.id || ch.stream_id || `m3u_${Math.random()}`,
              name: ch.name || 'İsimsiz Kanal',
              logo: ch.logo || ch.stream_icon || ch.tvg?.logo || '',
              status: 'live' as const,
              currentProgram: 'Canlı Yayın',
              category: ch.category_name || ch.group || ch.tvg?.group || 'Genel',
              streamUrl: ch.streamUrl || ch.url,
              streamId: ch.id || ch.stream_id,
            }));
            
            // Sıralama
            let sortedChannels = [...formattedChannels];
            if (sortBy === 'A-Z') {
              sortedChannels.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            setChannels(sortedChannels);
            setIsLoading(false);
            setIsInitialized(true);
            return;
          } else {
            setError('M3U playlist boş. Lütfen tekrar yükleyin.');
            setIsLoading(false);
            setIsInitialized(true);
            setTimeout(() => navigate('/m3u-list'), 2000);
            return;
          }
        } catch (err) {
          console.error('M3U parse error:', err);
          setError('M3U playlist yüklenemedi. Lütfen tekrar deneyin.');
          setIsLoading(false);
          setIsInitialized(true);
          setTimeout(() => navigate('/m3u-list'), 2000);
          return;
        }
      }
    }
    
    // Xtreme Code kontrol et (sadece sourceType 'm3u' değilse ve activeXtremeAccount yoksa)
    if (stateSourceType !== 'm3u' && !activeXtremeAccount) {
      const storedCredentials = localStorage.getItem('xtremeCodeCredentials');
      if (storedCredentials) {
        try {
          const creds = JSON.parse(storedCredentials);
          setCredentials({
            serverUrl: creds.serverUrl,
            username: creds.username,
            password: creds.password,
          });
          setSourceType('xtreme');
          setIsInitialized(true);
          return;
        } catch (err) {
          console.error('Credentials parse error:', err);
        }
      }
    }
    
    // Ne M3U ne de Xtreme Code bulunamadı
    setError('Giriş yapılmamış. Lütfen önce bir hesap seçin.');
    setIsLoading(false);
    setIsInitialized(true);
    
    const m3uAccounts = localStorage.getItem('m3uAccounts');
    if (m3uAccounts) {
      setTimeout(() => navigate('/m3u-list'), 2000);
    } else {
      setTimeout(() => navigate('/xtreme-code-list'), 2000);
    }
  }, [navigate, location, isInitialized]);

  // Kategorileri yükle (cache ile) - Sadece Xtreme Code için
  useEffect(() => {
    if (!credentials || sourceType !== 'xtreme') return;

    // Daha önce cache reset zamanı varsa yükle
    const resetKey = `xtreme_cache_reset_${credentials.serverUrl}_${credentials.username}`;
    const storedReset = localStorage.getItem(resetKey);
    if (storedReset) {
      const ts = parseInt(storedReset);
      if (!Number.isNaN(ts)) {
        setLastCacheReset(ts);
      }
    }

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cache'den kontrol et
        const cacheKey = `xtreme_categories_${credentials.serverUrl}_${credentials.username}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Cache 5 dakika geçerli
        const CACHE_DURATION = 5 * 60 * 1000;
        const now = Date.now();
        
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          try {
            const categoriesData = JSON.parse(cachedData);
            if (Array.isArray(categoriesData) && categoriesData.length > 0) {
              setCategories(categoriesData);
              return; // Cache'den yüklendi
            }
          } catch (e) {
            console.error('Cache parse error:', e);
          }
        }
        
        const categoriesData = await getLiveCategories(
          credentials.serverUrl,
          credentials.username,
          credentials.password
        );
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
          // Cache'e kaydet
          localStorage.setItem(cacheKey, JSON.stringify(categoriesData));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        } else {
          setError('Kategoriler bulunamadı.');
        }
      } catch (err: any) {
        console.error('Categories load error:', err);
        setError(err.message || 'Kategoriler yüklenemedi. Lütfen tekrar deneyin.');
      }
    };

    loadCategories();
  }, [credentials, sourceType, refreshToken]);

  // Kanalları yükle (cache ile) - Sadece Xtreme Code için
  useEffect(() => {
    if (!credentials || sourceType !== 'xtreme') return;

    const loadStreams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cache'den kontrol et
        const categoryId = selectedCategory === 'all' ? undefined : selectedCategory;
        const cacheKey = `xtreme_streams_${credentials.serverUrl}_${credentials.username}_${categoryId || 'all'}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Cache 5 dakika geçerli
        const CACHE_DURATION = 5 * 60 * 1000;
        const now = Date.now();
        
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          try {
            const streamsData = JSON.parse(cachedData);
            if (Array.isArray(streamsData) && streamsData.length > 0) {
              // Streams'i Channel formatına dönüştür
              const channelsData: Channel[] = streamsData.map((stream: XtremeCodeStream) => ({
                id: stream.stream_id || `xtreme_${stream.num}`,
                name: stream.name || 'İsimsiz Kanal',
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
              setIsLoading(false);
              return; // Cache'den yüklendi
            }
          } catch (e) {
            console.error('Cache parse error:', e);
          }
        }
        
        const streamsData = await getLiveStreams(
          credentials.serverUrl,
          credentials.username,
          credentials.password,
          categoryId
        );

        if (Array.isArray(streamsData) && streamsData.length > 0) {
          // Cache'e kaydet
          localStorage.setItem(cacheKey, JSON.stringify(streamsData));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
          
          // Streams'i Channel formatına dönüştür
          const channelsData: Channel[] = streamsData.map((stream: XtremeCodeStream) => ({
            id: stream.stream_id || `xtreme_${stream.num}`,
            name: stream.name || 'İsimsiz Kanal',
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
        } else {
          setError('Kanallar bulunamadı.');
        }
      } catch (err: any) {
        console.error('Streams load error:', err);
        setError(err.message || 'Kanallar yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, [credentials, selectedCategory, sortBy, sourceType, refreshToken]);

  // M3U için kategori filtreleme ve sıralama
  useEffect(() => {
    if (sourceType !== 'm3u' || m3uChannels.length === 0) return;

    try {
      const filtered = getM3UChannelsByCategory(m3uChannels, selectedCategory === 'all' ? undefined : selectedCategory);
      
      const formattedChannels: Channel[] = filtered.map((ch: any) => ({
        id: ch.id || ch.stream_id || `m3u_${Math.random()}`,
        name: ch.name || 'İsimsiz Kanal',
        logo: ch.logo || ch.stream_icon || ch.tvg?.logo || '',
        status: 'live' as const,
        currentProgram: 'Canlı Yayın',
        category: ch.category_name || ch.group || ch.tvg?.group || 'Genel',
        streamUrl: ch.streamUrl || ch.url,
        streamId: ch.id || ch.stream_id,
      }));
      
      // Sıralama
      let sortedChannels = [...formattedChannels];
      if (sortBy === 'A-Z') {
        sortedChannels.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      setChannels(sortedChannels);
      setIsLoading(false);
    } catch (err) {
      console.error('M3U filter error:', err);
      setError('Kanallar filtrelenirken bir hata oluştu.');
      setIsLoading(false);
    }
  }, [selectedCategory, m3uChannels, sourceType, sortBy]);

  const filteredChannels = channels.filter(channel => {
    if (!channel.name) return false;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleChannelClick = (channel: Channel) => {
    if (!channel.streamUrl && !channel.streamId) {
      alert('Bu kanal için stream URL bulunamadı.');
      return;
    }
    navigate('/player', { state: { channel, sourceType, credentials } });
  };

  const handleLogout = () => {
    if (sourceType === 'xtreme') {
      localStorage.removeItem('xtremeCodeCredentials');
      localStorage.removeItem('xtremeCodeConnected');
      localStorage.removeItem('activeXtremeCodeAccount');
      navigate('/xtreme-code-list');
    } else {
      localStorage.removeItem('m3uCredentials');
      localStorage.removeItem('m3uChannels');
      localStorage.removeItem('m3uLoaded');
      navigate('/m3u-list');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (sourceType === 'xtreme') {
      setIsLoading(true);
    }
  };

  // Cache reset butonu
  const handleCacheReset = () => {
    if (!credentials) return;

    const THREE_HOURS = 3 * 60 * 60 * 1000;
    const now = Date.now();
    const resetKey = `xtreme_cache_reset_${credentials.serverUrl}_${credentials.username}`;
    const last = lastCacheReset ?? parseInt(localStorage.getItem(resetKey) || '0');

    if (last && !Number.isNaN(last) && now - last < THREE_HOURS) {
      const remainingMs = THREE_HOURS - (now - last);
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      alert(`Cache en fazla 3 saatte bir yenilenebilir. Kalan süre: ${remainingMinutes} dakika`);
      return;
    }

    setIsResettingCache(true);

    try {
      // Kategori cache'ini temizle
      const catKey = `xtreme_categories_${credentials.serverUrl}_${credentials.username}`;
      localStorage.removeItem(catKey);
      localStorage.removeItem(`${catKey}_timestamp`);

      // Kanal cache'lerini temizle
      const streamsPrefix = `xtreme_streams_${credentials.serverUrl}_${credentials.username}_`;
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(streamsPrefix)) {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        }
      });

      // Son reset zamanını kaydet
      localStorage.setItem(resetKey, now.toString());
      setLastCacheReset(now);

      // Yeniden yükleme tetikle
      setRefreshToken((prev) => prev + 1);
    } finally {
      setIsResettingCache(false);
    }
  };

  if (error && !credentials && !m3uChannels.length) {
    return (
      <div className="font-display bg-[#f6f8f8] dark:bg-[#11211e] text-[#111817] dark:text-white h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Bağlantı Hatası</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-[#f6f8f8] dark:bg-[#11211e] text-[#111817] dark:text-white h-screen overflow-hidden flex flex-col md:flex-row w-full relative">
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
              {(credentials?.username || 'Kullanıcı').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-white text-base font-bold truncate">{credentials?.username || 'Kullanıcı'}</h1>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <a 
            onClick={() => setShowComingSoon(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">favorite</span>
            <span className="text-sm font-medium">{t('nav.favorites')}</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#19e6c4]/10 text-[#19e6c4] transition-colors cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tv</span>
            <span className="text-sm font-medium">{t('nav.liveTV')}</span>
          </a>
          <a 
            onClick={() => setShowComingSoon(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">movie</span>
            <span className="text-sm font-medium">{t('nav.movies')}</span>
          </a>
          <a 
            onClick={() => setShowComingSoon(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">smart_display</span>
            <span className="text-sm font-medium">{t('nav.series')}</span>
          </a>
          <a 
            onClick={() => setShowComingSoon(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">history</span>
            <span className="text-sm font-medium">{t('nav.watchlist')}</span>
          </a>
          <div className="my-4 border-t border-[#293836] mx-3"></div>
          <a 
            onClick={() => setShowComingSoon(true)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">settings</span>
            <span className="text-sm font-medium">{t('common.settings')}</span>
          </a>
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9db8b4] hover:bg-[#293836] hover:text-white transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:text-[#19e6c4] transition-colors">logout</span>
            <span className="text-sm font-medium">{t('common.logout')}</span>
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
          <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
            <button
              onClick={() => navigate(`/${lang}`)}
              className="flex items-center gap-1.5 text-[#9db8b4] hover:text-[#19e6c4] transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>{t('common.home')}</span>
            </button>
            <span className="material-symbols-outlined text-[#9db8b4] text-[16px] flex-shrink-0">chevron_right</span>
            <span className="text-[#9db8b4] whitespace-nowrap">{t('nav.liveTV')}</span>
            <span className="material-symbols-outlined text-[#9db8b4] text-[16px] flex-shrink-0">chevron_right</span>
            <span className="text-white font-medium truncate">
              {selectedCategory === 'all' 
                ? t('channels.allChannels')
                : categories.find(c => c.category_id === selectedCategory)?.category_name || t('channels.channelsLabel')}
            </span>
          </div>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-[#293836] rounded-lg h-10 w-64 px-3 focus-within:ring-1 focus-within:ring-[#19e6c4] transition-all">
              <span className="material-symbols-outlined text-[#9db8b4] text-lg">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white placeholder-[#9db8b4] text-sm w-full focus:ring-0 outline-none ml-2"
                placeholder="Kanal ara..."
                type="text"
              />
            </div>
            {/* Cache Reset Button */}
            <button
              onClick={handleCacheReset}
              disabled={isResettingCache || !credentials}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#19e6c4]/70 text-[#19e6c4] hover:bg-[#19e6c4]/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Cache Yenile</span>
            </button>
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
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight break-words">
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
            <div className="flex justify-center items-center py-20 min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#19e6c4] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#9db8b4] text-sm">Kanallar yükleniyor...</span>
                {(credentials || m3uChannels.length > 0) && (
                  <p className="text-[#9db8b4] text-xs mt-2">
                    {sourceType === 'xtreme' ? 'Xtreme Code' : 'M3U'} bağlantısından kanallar getiriliyor...
                  </p>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-20 min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Bir Hata Oluştu</h3>
                <p className="text-red-400 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    Tekrar Dene
                  </button>
                  <button
                    onClick={() => navigate(sourceType === 'xtreme' ? '/xtreme-code-list' : '/m3u-list')}
                    className="bg-[#293836] hover:bg-[#3e524f] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Hesaplara Dön
                  </button>
                </div>
              </div>
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 min-h-[400px]">
              <div className="mb-6">
                <div className="size-20 rounded-full bg-[#293836] flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-4xl text-[#9db8b4]">tv_off</span>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Kanal bulunamadı'}
                </h3>
                <p className="text-[#9db8b4] text-sm text-center max-w-md">
                  {searchQuery 
                    ? `"${searchQuery}" için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
                    : 'Henüz kanal yüklenmedi veya seçili kategoride kanal bulunmuyor.'}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-[#19e6c4] hover:bg-[#14b89d] text-[#11211e] font-semibold rounded-lg transition-colors"
                >
                  Aramayı Temizle
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Channel Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => handleChannelClick(channel)}
                    className="group relative bg-[#1a2624] hover:bg-[#202e2c] border border-[#293836] hover:border-[#19e6c4]/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#19e6c4]/10 cursor-pointer"
                  >
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`${channel.name} favorilere eklendi!`);
                        }}
                        className="text-white hover:text-[#19e6c4] bg-black/50 rounded-full p-1.5 backdrop-blur-sm transition-colors"
                        title="Favorilere Ekle"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                      </button>
                    </div>
                    <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-[#293836] to-[#1a2624] rounded-lg mb-3 p-4 overflow-hidden">
                      {channel.logo ? (
                        <img
                          alt={`${channel.name} Logo`}
                          className="w-full h-full object-contain max-h-[80px] group-hover:scale-110 transition-transform duration-300"
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
                        <div className="text-5xl font-bold text-white/30 group-hover:text-white/50 transition-colors">
                          {channel.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-h-[60px]">
                      <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-[#19e6c4] transition-colors">
                        {channel.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-auto">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            channel.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                          }`}
                        ></span>
                        <span className="text-[#9db8b4] text-xs truncate">
                          {channel.status === 'live' ? 'Canlı' : 'Çevrimdışı'}
                        </span>
                      </div>
                      {channel.currentProgram && (
                        <p className="text-[#9db8b4] text-xs mt-1 truncate group-hover:text-[#19e6c4] transition-colors">
                          {channel.currentProgram}
                        </p>
                      )}
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
      <div className="md:hidden">
        <Footer />
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
          <div className="bg-[#1a2c29] border border-[#293836] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="flex items-center justify-center size-16 rounded-full bg-primary/20 mb-4 mx-auto">
                <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('common.comingSoon')}</h3>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full px-6 py-3 bg-primary hover:bg-[#14b89d] text-[#11211e] font-bold rounded-lg transition-colors"
              >
                {t('common.ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
