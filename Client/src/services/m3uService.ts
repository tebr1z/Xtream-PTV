// M3U Playlist Service

export type M3UCredentials = {
  url: string;
  username?: string;
  password?: string;
};

export type M3UResponse = {
  success: boolean;
  message?: string;
  data?: any;
  channels?: M3UChannel[];
};

export type M3UChannel = {
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
};

/**
 * M3U playlist'i yükler ve parse eder
 * @param credentials - M3U bağlantı bilgileri
 * @returns Parse edilmiş playlist verisi
 */
export const loadM3UPlaylist = async (
  credentials: M3UCredentials
): Promise<M3UResponse> => {
  try {
    // URL'yi hazırla (username ve password varsa ekle)
    let playlistUrl = credentials.url;
    
    if (credentials.username && credentials.password) {
      const urlObj = new URL(credentials.url);
      urlObj.username = credentials.username;
      urlObj.password = credentials.password;
      playlistUrl = urlObj.toString();
    }

    // M3U playlist'i fetch et
    const response = await fetch(playlistUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const channels = parseM3U(text);

    return {
      success: true,
      message: 'Playlist başarıyla yüklendi',
      channels: channels,
      data: {
        url: credentials.url,
        channelCount: channels.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Playlist yüklenirken hata oluştu',
    };
  }
};

/**
 * M3U formatındaki metni parse eder
 * @param m3uText - M3U formatındaki metin
 * @returns Parse edilmiş kanal listesi
 */
export const parseM3U = (m3uText: string): M3UChannel[] => {
  const channels: M3UChannel[] = [];
  const lines = m3uText.split('\n');
  
  let currentChannel: Partial<M3UChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // M3U başlığı
    if (line === '#EXTM3U') {
      continue;
    }

    // Kanal bilgisi satırı (#EXTINF)
    if (line.startsWith('#EXTINF:')) {
      const info = parseExtInf(line);
      currentChannel = {
        name: info.name,
        tvgId: info.tvgId,
        tvgName: info.tvgName,
        logo: info.logo,
        group: info.group,
      };
    }
    // URL satırı
    else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.url = line;
      channels.push(currentChannel as M3UChannel);
      currentChannel = {};
    }
  }

  return channels;
};

/**
 * #EXTINF satırını parse eder
 * @param extInfLine - #EXTINF satırı
 * @returns Parse edilmiş bilgiler
 */
const parseExtInf = (extInfLine: string) => {
  const info: {
    name: string;
    tvgId?: string;
    tvgName?: string;
    logo?: string;
    group?: string;
  } = {
    name: '',
  };

  // Format: #EXTINF:-1 tvg-id="..." tvg-name="..." tvg-logo="..." group-title="...",Channel Name
  const attributesMatch = extInfLine.match(/^#EXTINF:(-?\d+)\s+(.+)$/);
  
  if (attributesMatch) {
    const attributes = attributesMatch[2];
    
    // tvg-id
    const tvgIdMatch = attributes.match(/tvg-id="([^"]+)"/);
    if (tvgIdMatch) info.tvgId = tvgIdMatch[1];
    
    // tvg-name
    const tvgNameMatch = attributes.match(/tvg-name="([^"]+)"/);
    if (tvgNameMatch) info.tvgName = tvgNameMatch[1];
    
    // tvg-logo
    const logoMatch = attributes.match(/tvg-logo="([^"]+)"/);
    if (logoMatch) info.logo = logoMatch[1];
    
    // group-title
    const groupMatch = attributes.match(/group-title="([^"]+)"/);
    if (groupMatch) info.group = groupMatch[1];
    
    // Channel name (son kısım, virgülden sonra)
    const nameMatch = attributes.match(/,\s*(.+)$/);
    if (nameMatch) {
      info.name = nameMatch[1].trim();
    }
  }

  return info;
};

/**
 * M3U playlist'i dosya olarak indirir
 * @param channels - Kanal listesi
 * @param filename - Dosya adı
 */
export const downloadM3U = (channels: M3UChannel[], filename: string = 'playlist.m3u') => {
  let m3uContent = '#EXTM3U\n';
  
  channels.forEach(channel => {
    m3uContent += `#EXTINF:-1`;
    if (channel.tvgId) m3uContent += ` tvg-id="${channel.tvgId}"`;
    if (channel.tvgName) m3uContent += ` tvg-name="${channel.tvgName}"`;
    if (channel.logo) m3uContent += ` tvg-logo="${channel.logo}"`;
    if (channel.group) m3uContent += ` group-title="${channel.group}"`;
    m3uContent += `,${channel.name}\n`;
    m3uContent += `${channel.url}\n`;
  });

  const blob = new Blob([m3uContent], { type: 'application/vnd.apple.mpegurl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

