// Xtreme Code API Service

export type XtremeCodeCredentials = {
  serverUrl: string;
  tvName: string;
  username: string;
  password: string;
  apiEndpoint?: string;
};

export type XtremeCodeResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

/**
 * Backend proxy üzerinden fetch yapar
 */
const fetchWithProxy = async (url: string): Promise<Response> => {
  try {
    const backendProxyUrl = (import.meta as any).env?.VITE_PROXY_URL || 'http://localhost:3001';
    const proxyUrl = `${backendProxyUrl}/api/xtreme?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.error('fetchWithProxy error:', error);
    throw error;
  }
};

/**
 * Xtreme Code API'ye bağlantı kurar
 */
export const connectXtremeCode = async (
  credentials: XtremeCodeCredentials
): Promise<XtremeCodeResponse> => {
  try {
    const baseUrl = credentials.serverUrl.endsWith('/') 
      ? credentials.serverUrl.slice(0, -1) 
      : credentials.serverUrl;
    
    // Endpoint'leri dene - önce /api.php (en yaygın)
    const endpoints = ['/api.php', '/player_api.php', '/portal.php'];
    
    console.log('Trying endpoints in order:', endpoints);
    
    for (const endpoint of endpoints) {
      try {
        const apiUrl = `${baseUrl}${endpoint}?username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}&action=get_live_categories`;
        
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetchWithProxy(apiUrl);
        const responseText = await response.text();
        
        console.log(`Response status for ${endpoint}:`, response.status);
        
        if (response.status === 404 || response.status === 403) {
          // Bu endpoint çalışmadı (404 veya IP FORBIDDEN), bir sonrakini dene
          console.log(`${endpoint} returned ${response.status}, trying next endpoint...`);
          continue;
        }
        
        if (response.status === 200 && responseText && responseText.trim().length > 2) {
          try {
            console.log(`Parsing response for ${endpoint}, responseText length:`, responseText.length);
            console.log(`Response text preview:`, responseText.substring(0, 100));
            
            // Boş veya çok kısa response kontrolü
            if (!responseText || responseText.trim().length <= 2 || responseText.trim() === '{}' || responseText.trim() === '[]') {
              console.log(`${endpoint} returned empty or invalid response, trying next endpoint...`);
              continue;
            }
            
            const data = JSON.parse(responseText);
            console.log(`Parsed data for ${endpoint}:`, typeof data, Array.isArray(data) ? 'array' : 'object', data);
            
            // Backend'den gelen error kontrolü
            if (data && typeof data === 'object' && 'error' in data) {
              // Backend'den hata geldi, bir sonrakini dene
              console.log(`${endpoint} returned error in response, trying next endpoint...`);
              continue;
            }
            
            // IP FORBIDDEN veya benzeri hata kontrolü
            if (data && typeof data === 'object') {
              // 'IP FORBIDDEN' veya 'result: false' gibi hataları kontrol et
              const dataString = JSON.stringify(data).toLowerCase();
              if (dataString.includes('forbidden') || dataString.includes('ip forbidden') || 
                  (data.result === false) || (data['0'] && data['0'].toString().toLowerCase().includes('forbidden'))) {
                console.log(`${endpoint} returned IP FORBIDDEN or error, trying next endpoint...`);
                continue;
              }
            }
            
            // Response format kontrolü
            let categories = [];
            if (Array.isArray(data)) {
              categories = data;
              console.log(`${endpoint} returned array with ${categories.length} categories`);
            } else if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result)) {
              categories = data.result;
              console.log(`${endpoint} returned object with result array, ${categories.length} categories`);
            } else {
              console.log(`${endpoint} returned unexpected format:`, Object.keys(data || {}));
            }
            
            // Eğer kategoriler boşsa veya data geçersizse, bir sonrakini dene
            if (categories.length === 0) {
              console.log(`${endpoint} returned empty categories, trying next endpoint...`);
              continue;
            }
            
            // Başarılı endpoint'i kaydet
            console.log(`✅ ${endpoint} is working! Saving and returning success.`);
            const credsWithEndpoint = {
              ...credentials,
              apiEndpoint: endpoint
            };
            localStorage.setItem('xtremeCodeCredentials', JSON.stringify(credsWithEndpoint));
            
            return {
              success: true,
              message: 'Bağlantı başarılı',
              data: {
                server: credentials.serverUrl,
                tvName: credentials.tvName,
                username: credentials.username,
                apiEndpoint: endpoint,
                categories: categories
              }
            };
          } catch (e) {
            // JSON parse hatası, bir sonrakini dene
            console.error(`JSON parse error for ${endpoint}:`, e);
            continue;
          }
        }
      } catch (error) {
        // Bu endpoint başarısız, bir sonrakini dene
        continue;
      }
    }
    
    return {
      success: false,
      message: 'API endpoint bulunamadı. Tüm endpoint formatları denendi.'
    };
  } catch (error) {
    console.error('Connection error:', error);
    return {
      success: false,
      message: 'Bağlantı hatası oluştu'
    };
  }
};

/**
 * Canlı kategorileri getirir
 */
export const getLiveCategories = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<any[]> => {
  try {
    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    
    // Endpoint'leri dene - önce kaydedilmiş, sonra /api.php
    const stored = localStorage.getItem('xtremeCodeCredentials');
    const endpoints = ['/api.php', '/player_api.php', '/portal.php'];
    let savedEndpoint: string | null = null;
    
    if (stored) {
      try {
        const creds = JSON.parse(stored);
        if (creds.apiEndpoint && endpoints.includes(creds.apiEndpoint)) {
          savedEndpoint = creds.apiEndpoint;
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Endpoint sıralaması: önce kaydedilmiş, sonra /api.php
    const endpointList = savedEndpoint 
      ? [savedEndpoint, ...endpoints.filter(e => e !== savedEndpoint)]
      : endpoints;
    
    for (const endpoint of endpointList) {
      try {
        const apiUrl = `${baseUrl}${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_categories`;
        
        const response = await fetchWithProxy(apiUrl);
        const responseText = await response.text();
        
        if (response.status === 404) {
          // Bu endpoint çalışmadı, bir sonrakini dene
          continue;
        }
        
        if (response.status === 200 && responseText) {
          try {
            const data = JSON.parse(responseText);
            
            // Başarılı endpoint'i kaydet
            if (stored) {
              try {
                const creds = JSON.parse(stored);
                creds.apiEndpoint = endpoint;
                localStorage.setItem('xtremeCodeCredentials', JSON.stringify(creds));
              } catch (e) {
                // Ignore
              }
            }
            
            // Xtreme Code API format kontrolü
            if (Array.isArray(data)) {
              return data;
            }
            
            if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result)) {
              return data.result;
            }
            
            return [];
          } catch (e) {
            // JSON parse hatası, bir sonrakini dene
            continue;
          }
        }
      } catch (error) {
        // Bu endpoint başarısız, bir sonrakini dene
        continue;
      }
    }
    
    throw new Error('Kategoriler alınamadı');
  } catch (error) {
    console.error('getLiveCategories error:', error);
    throw error;
  }
};

/**
 * Canlı kanalları getirir
 */
export const getLiveStreams = async (
  serverUrl: string,
  username: string,
  password: string,
  categoryId?: string
): Promise<any[]> => {
  try {
    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    
    // Endpoint'leri dene - önce kaydedilmiş, sonra /api.php
    const stored = localStorage.getItem('xtremeCodeCredentials');
    const endpoints = ['/api.php', '/player_api.php', '/portal.php'];
    let savedEndpoint: string | null = null;
    
    if (stored) {
      try {
        const creds = JSON.parse(stored);
        if (creds.apiEndpoint && endpoints.includes(creds.apiEndpoint)) {
          savedEndpoint = creds.apiEndpoint;
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Endpoint sıralaması: önce kaydedilmiş, sonra /api.php
    const endpointList = savedEndpoint 
      ? [savedEndpoint, ...endpoints.filter(e => e !== savedEndpoint)]
      : endpoints;
    
    for (const endpoint of endpointList) {
      try {
        let apiUrl = `${baseUrl}${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_streams`;
        
        if (categoryId && categoryId !== 'all' && categoryId !== 'Tümü') {
          apiUrl += `&category_id=${encodeURIComponent(categoryId)}`;
        }
        
        const response = await fetchWithProxy(apiUrl);
        const responseText = await response.text();
        
        if (response.status === 404) {
          // Bu endpoint çalışmadı, bir sonrakini dene
          continue;
        }
        
        if (response.status === 200 && responseText) {
          try {
            const data = JSON.parse(responseText);
            
            // Backend'den gelen error kontrolü
            if (data && typeof data === 'object' && 'error' in data) {
              // Backend'den hata geldi, bir sonrakini dene
              continue;
            }
            
            // Başarılı endpoint'i kaydet
            if (stored) {
              try {
                const creds = JSON.parse(stored);
                creds.apiEndpoint = endpoint;
                localStorage.setItem('xtremeCodeCredentials', JSON.stringify(creds));
              } catch (e) {
                // Ignore
              }
            }
            
            // Xtreme Code API format kontrolü
            if (Array.isArray(data)) {
              return data;
            }
            
            if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result)) {
              return data.result;
            }
            
            return [];
          } catch (e) {
            // JSON parse hatası, bir sonrakini dene
            continue;
          }
        }
      } catch (error) {
        // Bu endpoint başarısız, bir sonrakini dene
        continue;
      }
    }
    
    throw new Error('Kanallar alınamadı');
  } catch (error) {
    console.error('getLiveStreams error:', error);
    throw error;
  }
};

/**
 * EPG verilerini getirir
 */
export const getEpg = async (
  serverUrl: string,
  username: string,
  password: string,
  streamId?: string
): Promise<any[]> => {
  try {
    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    
    const stored = localStorage.getItem('xtremeCodeCredentials');
    let endpoint = '/api.php';
    
    if (stored) {
      try {
        const creds = JSON.parse(stored);
        if (creds.apiEndpoint) {
          endpoint = creds.apiEndpoint;
        }
      } catch (e) {
        // Ignore
      }
    }
    
    let apiUrl = `${baseUrl}${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_short_epg`;
    
    if (streamId) {
      apiUrl += `&stream_id=${encodeURIComponent(streamId)}`;
    }
    
    const response = await fetchWithProxy(apiUrl);
    
    if (response.status === 404 || !response.ok) {
      return []; // EPG desteği olmayan sunucular için sessizce boş döndür
    }
    
    const responseText = await response.text();
    if (!responseText) {
      return [];
    }
    
    const data = JSON.parse(responseText);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object' && 'epg_listings' in data) {
      return data.epg_listings || [];
    }
    
    return [];
  } catch (error) {
    // EPG hatası kritik değil
    return [];
  }
};
