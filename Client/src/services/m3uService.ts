// M3U Playlist Service

export type M3UCredentials = {
  url: string;
  username?: string;
  password?: string;
  name?: string; // Playlist adı
  id?: string; // Hesap ID'si
  createdAt?: string; // Oluşturulma tarihi
  lastUsed?: string; // Son kullanım tarihi
  channelCount?: number; // Kanal sayısı
};

export type M3UResponse = {
  success: boolean;
  message?: string;
  channels?: any[];
};

/**
 * M3U playlist yükler
 */
export const loadM3UPlaylist = async (credentials: M3UCredentials): Promise<M3UResponse> => {
  try {
    let url = credentials.url;
    
    // Basic auth ekle (varsa)
    if (credentials.username && credentials.password) {
      const urlObj = new URL(url);
      urlObj.username = credentials.username;
      urlObj.password = credentials.password;
      url = urlObj.toString();
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();
    const channels = parseM3U(text);

    return {
      success: true,
      channels: channels,
      message: `${channels.length} kanal bulundu`,
    };
  } catch (error: any) {
    console.error('M3U load error:', error);
    return {
      success: false,
      message: error.message || 'Playlist yüklenirken hata oluştu',
    };
  }
};

/**
 * M3U formatını parse eder
 */
const parseM3U = (text: string): any[] => {
  const channels: any[] = [];
  const lines = text.split('\n');
  
  let currentChannel: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Channel info line
      const info = parseExtInf(line);
      currentChannel = {
        id: `channel_${channels.length + 1}`,
        stream_id: `channel_${channels.length + 1}`,
        name: info.title || `Kanal ${channels.length + 1}`,
        stream_icon: info.logo || '',
        category_id: info.group || 'Genel',
        category_name: info.group || 'Genel',
        streamUrl: '',
        url: '',
        group: info.group || 'Genel',
        logo: info.logo || '',
      };
    } else if (line && !line.startsWith('#') && currentChannel) {
      // URL line
      currentChannel.url = line;
      currentChannel.streamUrl = line;
      channels.push(currentChannel);
      currentChannel = null;
    }
  }
  
  return channels;
};

/**
 * #EXTINF satırını parse eder
 */
const parseExtInf = (line: string): { title?: string; logo?: string; group?: string } => {
  const info: { title?: string; logo?: string; group?: string } = {};
  
  // #EXTINF:-1 tvg-id="..." tvg-name="..." tvg-logo="..." group-title="...",Title
  const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
  const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
  const groupTitleMatch = line.match(/group-title="([^"]*)"/);
  const titleMatch = line.match(/,(.+)$/);
  
  if (tvgNameMatch) {
    info.title = tvgNameMatch[1];
  } else if (titleMatch) {
    info.title = titleMatch[1].trim();
  }
  
  if (tvgLogoMatch) {
    info.logo = tvgLogoMatch[1];
  }
  
  if (groupTitleMatch) {
    info.group = groupTitleMatch[1];
  }
  
  return info;
};

/**
 * Kayıtlı M3U hesaplarını getirir
 */
export const getSavedM3UAccounts = (): M3UCredentials[] => {
  try {
    const saved = localStorage.getItem('m3uAccounts');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error('getSavedM3UAccounts error:', error);
    return [];
  }
};

/**
 * Yeni M3U hesabı kaydeder veya günceller
 */
export const saveM3UAccount = (account: M3UCredentials): void => {
  try {
    const accounts = getSavedM3UAccounts();
    const now = new Date().toISOString();
    
    if (account.id) {
      // Güncelleme
      const index = accounts.findIndex(a => a.id === account.id);
      if (index !== -1) {
        accounts[index] = {
          ...account,
          lastUsed: now
        };
      }
    } else {
      // Yeni ekleme
      const newAccount: M3UCredentials = {
        ...account,
        id: `m3u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        lastUsed: now,
        name: account.name || `M3U Playlist ${accounts.length + 1}`
      };
      accounts.push(newAccount);
    }
    
    localStorage.setItem('m3uAccounts', JSON.stringify(accounts));
  } catch (error) {
    console.error('saveM3UAccount error:', error);
  }
};

/**
 * M3U hesabını siler
 */
export const deleteM3UAccount = (accountId: string): void => {
  try {
    const accounts = getSavedM3UAccounts();
    const filtered = accounts.filter(a => a.id !== accountId);
    localStorage.setItem('m3uAccounts', JSON.stringify(filtered));
  } catch (error) {
    console.error('deleteM3UAccount error:', error);
  }
};

/**
 * M3U hesabını günceller
 */
export const updateM3UAccount = (accountId: string, updates: Partial<M3UCredentials>): void => {
  try {
    const accounts = getSavedM3UAccounts();
    const index = accounts.findIndex(a => a.id === accountId);
    if (index !== -1) {
      accounts[index] = {
        ...accounts[index],
        ...updates,
        id: accountId // ID'yi koru
      };
      localStorage.setItem('m3uAccounts', JSON.stringify(accounts));
    }
  } catch (error) {
    console.error('updateM3UAccount error:', error);
  }
};

/**
 * Aktif M3U hesabını ayarlar
 */
export const setActiveM3UAccount = (account: M3UCredentials, channels?: any[]): void => {
  try {
    // Aktif hesabı kaydet
    localStorage.setItem('m3uCredentials', JSON.stringify(account));
    if (channels) {
      localStorage.setItem('m3uChannels', JSON.stringify(channels));
    }
    localStorage.setItem('m3uLoaded', 'true');
    
    // Son kullanım tarihini güncelle
    if (account.id) {
      updateM3UAccount(account.id, { 
        lastUsed: new Date().toISOString(),
        channelCount: channels?.length 
      });
    }
  } catch (error) {
    console.error('setActiveM3UAccount error:', error);
  }
};

/**
 * M3U kanallarından kategorileri çıkarır
 */
export const getM3UCategories = (channels: any[]): any[] => {
  const categoryMap = new Map<string, string>();
  
  channels.forEach(channel => {
    const categoryName = channel.category_name || channel.group || 'Genel';
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, categoryName);
    }
  });
  
  return Array.from(categoryMap.entries()).map(([category_name, category_id]) => ({
    category_id,
    category_name,
    parent_id: 0
  }));
};

/**
 * M3U kanallarını kategoriye göre filtreler
 */
export const getM3UChannelsByCategory = (channels: any[], categoryId?: string): any[] => {
  if (!categoryId || categoryId === 'all' || categoryId === 'Tümü') {
    return channels;
  }
  
  return channels.filter(channel => {
    const channelCategory = channel.category_name || channel.group || 'Genel';
    return channelCategory === categoryId;
  });
};
