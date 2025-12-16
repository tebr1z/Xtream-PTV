import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLiveCategories, getLiveStreams, getEpg } from '../services/xtremeCodeService';
import { getM3UCategories, getM3UChannelsByCategory } from '../services/m3uService';
import Hls from 'hls.js';

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
  stream_url?: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const [sourceType, setSourceType] = useState<'xtreme' | 'm3u'>('xtreme');
  const [credentials, setCredentials] = useState<{ serverUrl: string; username: string; password: string } | null>(null);
  const [m3uChannels, setM3UChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<XtremeCodeCategory[]>([]);
  const [streams, setStreams] = useState<XtremeCodeStream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [sidebarChannels, setSidebarChannels] = useState<Channel[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [volume, setVolume] = useState(1); // 0-1 arası
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  // localStorage'dan credentials'ları al (Xtreme Code veya M3U)
  useEffect(() => {
    // Önce M3U kontrol et
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
            id: ch.id || ch.stream_id,
            name: ch.name,
            logo: ch.logo || ch.stream_icon || '',
            status: 'live' as const,
            currentProgram: 'Canlı Yayın',
            category: ch.category_name || ch.group || 'Genel',
            streamUrl: ch.streamUrl || ch.url,
            streamId: ch.id || ch.stream_id,
          }));
          
          setSidebarChannels(formattedChannels);
          
          // URL'den gelen kanal varsa onu seç, yoksa ilk kanalı seç
          if (location.state?.channel) {
            const channelFromState = formattedChannels.find(ch => ch.id === location.state.channel.id);
            if (channelFromState) {
              setSelectedChannel(channelFromState);
            } else if (formattedChannels.length > 0) {
              setSelectedChannel(formattedChannels[0]);
            }
          } else if (formattedChannels.length > 0) {
            setSelectedChannel(formattedChannels[0]);
          }
          
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('M3U parse error:', err);
      }
    }
    
    // Xtreme Code kontrol et
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
      } catch (err) {
        console.error('Credentials parse error:', err);
        setError('Giriş bilgileri yüklenemedi. Lütfen tekrar giriş yapın.');
        navigate('/xtreme-code-list');
      }
    } else {
      setError('Giriş yapılmamış. Lütfen önce giriş yapın.');
      navigate('/m3u-list');
    }
  }, [navigate, location.state]);

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
              if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0].category_id);
              }
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
          
          if (categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0].category_id);
          }
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
              setStreams(streamsData);
              
              // Streams'i Channel formatına dönüştür
              const baseUrl = credentials.serverUrl.endsWith('/') 
                ? credentials.serverUrl.slice(0, -1) 
                : credentials.serverUrl;
              
              const channels: Channel[] = streamsData.map((stream: XtremeCodeStream) => {
                // Stream URL'ini oluştur - önce direct_source'u kontrol et
                let streamUrl = stream.direct_source;
                
                // Eğer direct_source yoksa veya geçersizse, standart format kullan
                if (!streamUrl || streamUrl.trim() === '') {
                  // Xtreme Code API standart stream URL formatı
                  streamUrl = `${baseUrl}/live/${credentials.username}/${credentials.password}/${stream.stream_id}.m3u8`;
                } else if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
                  // Tam URL ise olduğu gibi kullan
                  streamUrl = streamUrl;
                } else if (streamUrl.startsWith('/')) {
                  // Absolute path ise base URL ekle
                  streamUrl = `${baseUrl}${streamUrl}`;
                } else {
                  // Relative path ise base URL ekle
                  streamUrl = `${baseUrl}/${streamUrl}`;
                }
                
                // Logo URL'ini düzelt (relative URL ise base URL ekle)
                let logoUrl = stream.stream_icon || '';
                if (logoUrl && !logoUrl.startsWith('http')) {
                  logoUrl = `${baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
                }
                
                return {
                  id: stream.stream_id,
                  name: stream.name,
                  logo: logoUrl,
                  status: 'live' as const,
                  currentProgram: 'Canlı Yayın',
                  category: stream.category_id || 'Genel',
                  streamUrl: streamUrl,
                  streamId: stream.stream_id,
                };
              });

              setSidebarChannels(channels);

              // URL'den gelen kanal varsa onu seç, yoksa ilk kanalı seç
              if (location.state?.channel) {
                const channelFromState = channels.find(ch => ch.id === location.state.channel.id);
                if (channelFromState) {
                  setSelectedChannel(channelFromState);
                } else if (channels.length > 0) {
                  setSelectedChannel(channels[0]);
                }
              } else if (channels.length > 0) {
                setSelectedChannel(channels[0]);
              }
              
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
          
          setStreams(streamsData);
          
          // Streams'i Channel formatına dönüştür
          const baseUrl = credentials.serverUrl.endsWith('/') 
            ? credentials.serverUrl.slice(0, -1) 
            : credentials.serverUrl;
          
          const channels: Channel[] = streamsData.map((stream: XtremeCodeStream) => {
            // Stream URL'ini oluştur - önce direct_source'u kontrol et
            let streamUrl = stream.direct_source || stream.stream_url || '';
            
            console.log(`Stream ${stream.name}:`, {
              direct_source: stream.direct_source,
              stream_url: stream.stream_url,
              stream_id: stream.stream_id,
              full_stream: stream
            });
            
            // Eğer direct_source yoksa veya geçersizse, standart format kullan
            if (!streamUrl || streamUrl.trim() === '' || streamUrl === '0' || streamUrl === 'false') {
              // Xtreme Code API standart stream URL formatı
              streamUrl = `${baseUrl}/live/${credentials.username}/${credentials.password}/${stream.stream_id}.m3u8`;
              console.log(`Using default stream URL format for ${stream.name}:`, streamUrl);
            } else if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
              // Tam URL ise olduğu gibi kullan
              streamUrl = streamUrl;
              console.log(`Using direct_source URL for ${stream.name}:`, streamUrl);
            } else if (streamUrl.startsWith('/')) {
              // Absolute path ise base URL ekle
              streamUrl = `${baseUrl}${streamUrl}`;
              console.log(`Using absolute path for ${stream.name}:`, streamUrl);
            } else {
              // Relative path ise base URL ekle
              streamUrl = `${baseUrl}/${streamUrl}`;
              console.log(`Using relative path for ${stream.name}:`, streamUrl);
            }
            
            console.log(`Final stream URL for ${stream.name}:`, streamUrl);
            
            // Logo URL'ini düzelt (relative URL ise base URL ekle)
            let logoUrl = stream.stream_icon || '';
            if (logoUrl && !logoUrl.startsWith('http')) {
              logoUrl = `${baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
            }
            
            return {
              id: stream.stream_id,
              name: stream.name,
              logo: logoUrl,
              status: 'live' as const,
              currentProgram: 'Canlı Yayın',
              category: stream.category_id || 'Genel',
              streamUrl: streamUrl,
              streamId: stream.stream_id,
            };
          });

          setSidebarChannels(channels);

          // URL'den gelen kanal varsa onu seç, yoksa ilk kanalı seç
          if (location.state?.channel) {
            const channelFromState = channels.find(ch => ch.id === location.state.channel.id);
            if (channelFromState) {
              setSelectedChannel(channelFromState);
            } else if (channels.length > 0) {
              setSelectedChannel(channels[0]);
            }
          } else if (channels.length > 0) {
            setSelectedChannel(channels[0]);
          }
        }
      } catch (err) {
        console.error('Streams load error:', err);
        setError('Kanallar yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, [credentials, selectedCategory, location.state]);

  // EPG verilerini yükle (sessizce, hata durumunda boş array) - Sadece Xtreme Code için
  useEffect(() => {
    if (sourceType !== 'xtreme' || !credentials || !selectedChannel?.streamId) return;

    const loadEpg = async () => {
      try {
        const epgData = await getEpg(
          credentials.serverUrl,
          credentials.username,
          credentials.password,
          selectedChannel.streamId
        );

        if (Array.isArray(epgData) && epgData.length > 0) {
          const epgPrograms: Program[] = epgData.map((epg: any) => ({
            time: epg.start || '',
            title: epg.title || '',
            description: epg.description || '',
            type: epg.category || '',
            isCurrent: epg.now_playing === 'true' || epg.now_playing === true,
          }));
          setPrograms(epgPrograms);
        } else {
          setPrograms([]);
        }
      } catch (err) {
        // EPG hatası kritik değil, sessizce boş array kullan
        setPrograms([]);
      }
    };

    loadEpg();
  }, [credentials, selectedChannel]);

  // Video volume'u ayarla
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Video oynatma
  useEffect(() => {
    if (videoRef.current && selectedChannel?.streamUrl) {
      const video = videoRef.current;
      let hls: Hls | null = null;
      
      // Video volume'u ayarla
      video.volume = volume;
      video.muted = isMuted;
      
      // HLS stream kontrolü - M3U URL'leri de HLS olabilir
      const isHLS = selectedChannel.streamUrl.endsWith('.m3u8') || 
                    selectedChannel.streamUrl.includes('m3u8') ||
                    selectedChannel.streamUrl.includes('m3u') ||
                    sourceType === 'm3u'; // M3U playlist'lerden gelen URL'ler genellikle HLS
      
      if (isHLS && Hls.isSupported()) {
        // HLS.js kullan
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        
        hls.loadSource(selectedChannel.streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed, ready to play');
          // Video yüklendiğinde otomatik oynat
          setIsPlaying(true);
          video.play().catch(err => {
            console.error('Video play error:', err);
            setError('Video oynatılamadı. Lütfen tekrar deneyin.');
          });
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Fatal network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Fatal media error, trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                console.error('Fatal error, destroying HLS instance');
                hls?.destroy();
                // HLS başarısız olursa normal video olarak dene
                video.src = selectedChannel.streamUrl;
                video.load();
                video.play().catch(() => {
                  setError('Video oynatılamadı. Lütfen tekrar deneyin.');
                });
                break;
            }
          }
        });
      } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS desteği (Safari)
        video.src = selectedChannel.streamUrl;
        video.load();
        // Video yüklendiğinde otomatik oynat
        video.addEventListener('loadedmetadata', () => {
          setIsPlaying(true);
          video.play().catch(err => {
            console.error('Video play error:', err);
            setError('Video oynatılamadı. Lütfen tekrar deneyin.');
          });
        });
      } else {
        // Normal video (MP4, WebM, vb.) veya HLS desteklenmiyorsa
        if (video.src !== selectedChannel.streamUrl) {
          // Önce mevcut HLS instance'ı temizle
          if (hls) {
            hls.destroy();
            hls = null;
          }
          
          video.src = '';
          video.load();
          video.src = selectedChannel.streamUrl;
          video.load();
        }
        
        // Video yüklendiğinde otomatik oynat
        video.addEventListener('loadedmetadata', () => {
          setIsPlaying(true);
          video.play().catch(err => {
            console.error('Video play error:', err);
            setError('Video oynatılamadı. Lütfen tekrar deneyin.');
          });
        }, { once: true });
      }
      
      // Cleanup
      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [selectedChannel, isPlaying]);

  const filteredSidebarChannels = sidebarChannels.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = clampedVolume;
      videoRef.current.muted = clampedVolume === 0;
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isMuted || volume === 0) {
        // Unmute - önceki ses seviyesine geri dön veya %50
        const newVolume = volume > 0 ? volume : 0.5;
        setVolume(newVolume);
        setIsMuted(false);
        videoRef.current.volume = newVolume;
        videoRef.current.muted = false;
      } else {
        // Mute
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    }
  };

  const handleVolumeButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Dışarı tıklanınca slider'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumeSlider]);

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        // Safari
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).mozRequestFullScreen) {
        // Firefox
        (videoRef.current as any).mozRequestFullScreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        // IE/Edge
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  const handleBack = () => {
    navigate('/channels');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedChannel(null);
  };

  if (error && !credentials) {
    return (
      <div className="bg-[#f6f8f8] dark:bg-[#11211e] font-display text-slate-900 dark:text-white min-h-screen flex items-center justify-center">
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

  if (isLoading && !selectedChannel) {
    return (
      <div className="bg-[#f6f8f8] dark:bg-[#11211e] font-display text-slate-900 dark:text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentChannel = selectedChannel || {
    id: '1',
    name: 'Kanal Seçilmedi',
    logo: '',
    status: 'offline' as const,
    currentProgram: '',
    category: '',
  };

  return (
    <div className="bg-[#f6f8f8] dark:bg-[#11211e] font-display text-slate-900 dark:text-white h-screen flex flex-col overflow-hidden w-full">
      {/* Header Section */}
      <header className="shrink-0 border-b border-[#293836] bg-[#11211e] z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[#19e6c4] to-emerald-600 shadow-[0_0_15px_rgba(25,230,196,0.3)] hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-black font-bold">arrow_back</span>
            </button>
            <div className="size-6 text-primary hidden sm:block">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
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
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all active:scale-95 ${
                selectedCategory === 'all'
                  ? 'bg-[#19e6c4] shadow-[0_0_10px_rgba(25,230,196,0.2)]'
                  : 'bg-[#1a2c29] border border-[#293836] hover:bg-[#243834] hover:border-gray-600'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${selectedCategory === 'all' ? 'text-black' : 'text-gray-400'}`}>
                apps
              </span>
              <span className={`text-sm font-medium ${selectedCategory === 'all' ? 'text-black font-semibold' : 'text-gray-300'}`}>
                Tümü
              </span>
            </button>
            {categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() => handleCategoryChange(category.category_id)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-all active:scale-95 ${
                  selectedCategory === category.category_id
                    ? 'bg-[#19e6c4] shadow-[0_0_10px_rgba(25,230,196,0.2)]'
                    : 'bg-[#1a2c29] border border-[#293836] hover:bg-[#243834] hover:border-gray-600'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    selectedCategory === category.category_id ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  live_tv
                </span>
                <span
                  className={`text-sm font-medium ${
                    selectedCategory === category.category_id
                      ? 'text-black font-semibold'
                      : 'text-gray-300'
                  }`}
                >
                  {category.category_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-0 lg:p-6 lg:pt-2 min-h-0">
        {/* Video Player Section (Left) */}
        <div className="lg:col-span-9 flex flex-col h-full min-h-0">
          {/* Player Container - Sabit boyut, scroll'dan etkilenmez */}
          <div ref={playerContainerRef} className="bg-black relative w-full h-[600px] lg:h-[700px] shrink-0 rounded-none lg:rounded-2xl overflow-hidden group shadow-2xl">
            {selectedChannel?.streamUrl ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain"
                controls={false}
                playsInline
                preload="auto"
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => {
                  // Video hatalarını sessizce yok say (stream URL sorunları normal olabilir)
                  setError('Video oynatılamadı. Lütfen başka bir kanal deneyin.');
                }}
              />
            ) : (
              <>
                {/* Video Image Placeholder */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{
                    backgroundImage: currentChannel.logo
                      ? `url("${currentChannel.logo}")`
                      : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBnSo10WMVdDCXcW-fCsR8p1t1a2EcAbA8wmm2hWZLHZ6dMa_R2UArLsW7rdgS-aI40n7r3ANxc2njTnrqWf2Zdb6idHxxgeYVzVPiwSUKvoUsMhx84B-sdbEJDfMsw-qtzMPA7dBl3U6SJJN5NQYrUmWzhOW_5dbmZ_BJytMHVb936teut4k09bIOOP4jLl4mveZpYfLFcTEwrhNottmdLdjHnhBfQS6xsRTUjQyCB5OteQ8UpKBuJBsvocpFK97HjZCizsR2uYIg")',
                  }}
                ></div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
              </>
            )}

            {/* Center Play Button */}
            {!selectedChannel?.streamUrl && (
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
            )}

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
                  <div 
                    ref={volumeSliderRef}
                    className="flex items-center gap-2 group/volume ml-2 relative"
                  >
                    <button 
                      onClick={handleMuteToggle}
                      className="text-white hover:text-[#19e6c4] transition-colors"
                      title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                    >
                      <span className="material-symbols-outlined">
                        {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                      </span>
                    </button>
                    <button
                      onClick={handleVolumeButtonClick}
                      className="text-white hover:text-[#19e6c4] transition-colors flex items-center gap-1 text-sm"
                      title="Ses Seviyesi"
                    >
                      <span className="text-xs font-medium">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {showVolumeSlider ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {showVolumeSlider && (
                      <div 
                        className="absolute bottom-full left-0 mb-2 bg-black/95 backdrop-blur-md rounded-lg p-4 border border-white/20 z-50 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              const newVolume = parseFloat(e.target.value);
                              handleVolumeChange(newVolume);
                            }}
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #19e6c4 0%, #19e6c4 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                            }}
                          />
                          <div className="text-white text-sm font-medium min-w-[3rem] text-center">
                            {Math.round((isMuted ? 0 : volume) * 100)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium border border-white/10 rounded px-2 py-1 bg-black/20">
                    HD <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                  <button 
                    onClick={handleFullscreen}
                    className="text-white hover:text-[#19e6c4] transition-colors"
                  >
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Information Area - Sadece kanal adı ve çözünürlük */}
          <div className="shrink-0 p-5 lg:px-0">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{currentChannel.name}</h2>
              <span className="bg-[#19e6c4]/20 text-[#19e6c4] px-2 py-0.5 rounded text-xs font-bold border border-[#19e6c4]/20">
                1080p
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Channel List (Right) */}
        <div className="lg:col-span-3 flex flex-col h-[500px] lg:h-full bg-[#1a2c29] lg:rounded-2xl border-t lg:border border-[#293836] overflow-hidden min-h-0">
          {/* Sidebar Header / Search */}
          <div className="shrink-0 p-4 border-b border-[#293836] bg-[#1a2c29]/95 backdrop-blur z-10">
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

          {/* List Container - Sadece bu kısım scroll edilebilir */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSidebarChannels.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Kanal bulunamadı</div>
            ) : (
              filteredSidebarChannels.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleChannelClick(ch)}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer relative overflow-hidden transition-all ${
                    ch.id === currentChannel.id
                      ? 'bg-[#243834] border-l-4 border-[#19e6c4]'
                      : 'hover:bg-white/5 border-l-4 border-transparent hover:border-white/20'
                  }`}
                >
                  {ch.id === currentChannel.id && (
                    <div className="absolute inset-0 bg-[#19e6c4]/5 pointer-events-none"></div>
                  )}
                  <div
                    className={`relative size-10 shrink-0 rounded overflow-hidden flex items-center justify-center p-1 ${
                      ch.id === currentChannel.id ? 'bg-white/10' : 'bg-white/5'
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
                          ch.id === currentChannel.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {ch.name}
                      </h4>
                      {ch.id === currentChannel.id && (
                        <span className="size-1.5 rounded-full bg-[#19e6c4] animate-pulse shadow-[0_0_8px_#19e6c4]"></span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate ${
                        ch.id === currentChannel.id
                          ? 'text-[#19e6c4]'
                          : 'text-gray-500 group-hover:text-gray-400'
                      }`}
                    >
                      {ch.currentProgram}
                    </p>
                  </div>
                  {ch.id === currentChannel.id && (
                    <div className="opacity-100 transition-opacity z-10">
                      <span className="material-symbols-outlined text-[#19e6c4] text-[20px]">equalizer</span>
                    </div>
                  )}
                  {ch.status === 'live' && ch.id !== currentChannel.id && (
                    <span className="text-red-500 text-[10px] border border-red-500/30 bg-red-500/10 px-1 rounded">
                      LIVE
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer Status */}
          <div className="shrink-0 p-3 bg-[#243834] border-t border-[#293836] flex justify-between items-center text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500"></div>
              <span>Online: {sidebarChannels.length} Kanal</span>
            </div>
            <span>v2.4.1</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;
