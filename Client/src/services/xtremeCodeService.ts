// Xtreme Code API Service

export type XtremeCodeCredentials = {
  serverUrl: string;
  port: string;
  username: string;
  password: string;
};

export type XtremeCodeResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

/**
 * Xtreme Code API'ye bağlantı kurar
 * @param credentials - Giriş bilgileri
 * @returns API yanıtı
 */
export const connectXtremeCode = async (
  credentials: XtremeCodeCredentials
): Promise<XtremeCodeResponse> => {
  try {
    // API endpoint'inizi buraya ekleyin
    // Örnek: const apiUrl = `${credentials.serverUrl}:${credentials.port}/player_api.php`;
    
    // Şimdilik simüle ediyoruz
    // Gerçek implementasyon için:
    /*
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        action: 'get_live_categories', // veya başka bir action
      }),
    });

    if (!response.ok) {
      throw new Error('Bağlantı hatası');
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
    */

    // Simüle edilmiş başarılı yanıt
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Bağlantı başarılı',
      data: {
        server: credentials.serverUrl,
        port: credentials.port,
        username: credentials.username,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Bağlantı hatası oluştu',
    };
  }
};

/**
 * Xtreme Code API'den canlı kategorileri getirir
 */
export const getLiveCategories = async (baseUrl: string) => {
  try {
    const response = await fetch(`${baseUrl}/player_api.php?username=&password=&action=get_live_categories`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Kategoriler alınırken hata:', error);
    throw error;
  }
};

/**
 * Xtreme Code API'den canlı kanalları getirir
 */
export const getLiveStreams = async (baseUrl: string, categoryId?: string) => {
  try {
    const url = categoryId
      ? `${baseUrl}/player_api.php?username=&password=&action=get_live_streams&category_id=${categoryId}`
      : `${baseUrl}/player_api.php?username=&password=&action=get_live_streams`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Kanallar alınırken hata:', error);
    throw error;
  }
};
