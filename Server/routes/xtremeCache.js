import express from 'express';
import axios from 'axios';
import XtremeCodeCache from '../models/XtremeCodeCache.js';

const router = express.Router();

// Cache süresi (dakika cinsinden)
const CACHE_DURATION = 5; // 5 dakika

/**
 * Xtreme Code API'ye istek at (proxy)
 * Not: Burada mümkün olduğunca HATA FIRLATMAMAYA çalışıyoruz,
 * başarısız durumlarda null döndürüp üst seviyede sessizce fallback yapıyoruz.
 */
const fetchXtremeCodeAPI = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 saniye timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      validateStatus: () => true // Tüm status kodlarını kabul et
    });

    // 200 dışı durumlarda hata fırlatmak yerine null döndür
    if (response.status !== 200) {
      console.warn('fetchXtremeCodeAPI non-200 status:', response.status);
      return null;
    }

    let data = response.data;

    // Eğer string ise parse et
    if (typeof data === 'string') {
      if (!data || data.trim().length <= 2) {
        console.warn('fetchXtremeCodeAPI empty response');
        return null;
      }
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn('fetchXtremeCodeAPI JSON parse error:', e.message);
        return null;
      }
    }

    // IP FORBIDDEN kontrolü
    if (data && typeof data === 'object') {
      const dataString = JSON.stringify(data).toLowerCase();
      if (dataString.includes('forbidden') || dataString.includes('ip forbidden')) {
        console.warn('fetchXtremeCodeAPI IP FORBIDDEN');
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error('fetchXtremeCodeAPI unexpected error:', error.message || error);
    return null;
  }
};

/**
 * Endpoint'leri dene ve çalışanı bul
 * Not: Burada da HATA FIRLATMIYORUZ, eğer hiçbir endpoint çalışmazsa null döneriz.
 */
const findWorkingEndpoint = async (baseUrl, username, password, action) => {
  const endpoints = ['/api.php', '/player_api.php', '/portal.php'];
  
  for (const endpoint of endpoints) {
    const apiUrl = `${baseUrl}${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;
    const data = await fetchXtremeCodeAPI(apiUrl);
    
    // Eğer data null ise bu endpoint çalışmıyor, bir sonrakine geç
    if (!data) {
      continue;
    }

    // Başarılı response kontrolü
    if (Array.isArray(data) && data.length > 0) {
      return { endpoint, data };
    }
    
    if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result) && data.result.length > 0) {
      return { endpoint, data: data.result };
    }
  }
  
  // Hiçbir endpoint çalışmadı
  return null;
};

/**
 * GET /api/xtreme-cache/categories
 * Kategorileri cache'den getir veya API'den çek
 */
router.get('/categories', async (req, res) => {
  try {
    const { serverUrl, username, password } = req.query;
    
    if (!serverUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'serverUrl, username ve password parametreleri gerekli'
      });
    }
    
    // Cache'den kontrol et (MongoDB bağlıysa)
    let cached = null;
    try {
      cached = await XtremeCodeCache.getCache(serverUrl, username, password, 'categories');
    } catch (cacheError) {
      console.warn('Cache check error (continuing without cache):', cacheError.message);
    }
    
    if (cached) {
      console.log('✅ Categories served from cache');
      return res.json({
        success: true,
        data: cached.data,
        apiEndpoint: cached.apiEndpoint,
        cached: true,
        cachedAt: cached.cachedAt
      });
    }
    
    // Cache yok veya süresi dolmuş, API'den çek
    console.log('🔄 Fetching categories from API...');
    
    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    const result = await findWorkingEndpoint(baseUrl, username, password, 'get_live_categories');

    // Hiçbir endpoint çalışmadıysa API'yi patlatmadan güzel bir mesaj döndür
    if (!result) {
      console.warn('No working endpoint found for categories');
      return res.status(200).json({
        success: false,
        message: 'Kategori listesi alınamadı. Xtreme Code sunucusu endpoint/erişim hatası veriyor.'
      });
    }

    const { endpoint, data } = result;
    
    // Cache'e kaydet (MongoDB bağlıysa)
    try {
      await XtremeCodeCache.setCache(serverUrl, username, password, data, 'categories', null, endpoint);
      console.log('✅ Categories fetched and cached');
    } catch (cacheError) {
      console.warn('Cache save error (continuing without cache):', cacheError.message);
    }
    
    res.json({
      success: true,
      data: data,
      apiEndpoint: endpoint,
      cached: false,
      cachedAt: new Date()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kategoriler alınamadı'
    });
  }
});

/**
 * GET /api/xtreme-cache/streams
 * Kanalları cache'den getir veya API'den çek
 */
router.get('/streams', async (req, res) => {
  try {
    const { serverUrl, username, password, categoryId } = req.query;
    
    if (!serverUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'serverUrl, username ve password parametreleri gerekli'
      });
    }
    
    // Cache'den kontrol et (MongoDB bağlıysa)
    let cached = null;
    try {
      cached = await XtremeCodeCache.getCache(serverUrl, username, password, 'streams', categoryId || 'all');
    } catch (cacheError) {
      console.warn('Cache check error (continuing without cache):', cacheError.message);
    }
    
    if (cached) {
      console.log('✅ Streams served from cache');
      return res.json({
        success: true,
        data: cached.data,
        apiEndpoint: cached.apiEndpoint,
        cached: true,
        cachedAt: cached.cachedAt
      });
    }
    
    // Cache yok veya süresi dolmuş, API'den çek
    console.log('🔄 Fetching streams from API...');
    
    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    
    // Önce cache'den endpoint'i al (yoksa direkt deneme yap)
    const cacheKey = XtremeCodeCache.generateCacheKey(serverUrl, username, password);
    const existingCache = await XtremeCodeCache.findOne({ cacheKey }).catch(() => null);
    let endpoint = existingCache?.apiEndpoint || '/api.php';
    
    // Önce mevcut endpoint ile dene
    let data = null;
    try {
      let apiUrl = `${baseUrl}${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_streams`;
      
      if (categoryId && categoryId !== 'all' && categoryId !== 'Tümü') {
        apiUrl += `&category_id=${encodeURIComponent(categoryId)}`;
      }
      
      data = await fetchXtremeCodeAPI(apiUrl);
    } catch {
      data = null;
    }

    // Mevcut endpoint başarısızsa endpoint arama fonksiyonuna düş
    if (!data) {
      const result = await findWorkingEndpoint(baseUrl, username, password, 'get_live_streams');

      if (!result) {
        console.warn('No working endpoint found for streams');
        return res.status(200).json({
          success: false,
          message: 'Kanal listesi alınamadı. Xtreme Code sunucusu endpoint/erişim hatası veriyor.'
        });
      }

      endpoint = result.endpoint;
      data = result.data;
    }

    let streams = [];
    if (Array.isArray(data)) {
      streams = data;
    } else if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result)) {
      streams = data.result;
    }
    
    // Cache'e kaydet (MongoDB bağlıysa)
    try {
      await XtremeCodeCache.setCache(serverUrl, username, password, streams, 'streams', categoryId || 'all', endpoint);
      console.log('✅ Streams fetched and cached');
    } catch (cacheError) {
      console.warn('Cache save error (continuing without cache):', cacheError.message);
    }
    
    res.json({
      success: true,
      data: streams,
      apiEndpoint: endpoint,
      cached: false,
      cachedAt: new Date()
    });
  } catch (error) {
    console.error('Get streams error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kanallar alınamadı'
    });
  }
});

/**
 * DELETE /api/xtreme-cache/:cacheKey
 * Belirli bir cache'i sil (admin only - opsiyonel)
 */
router.delete('/:cacheKey', async (req, res) => {
  try {
    const { cacheKey } = req.params;
    const decodedCacheKey = decodeURIComponent(cacheKey);
    
    const result = await XtremeCodeCache.deleteOne({ cacheKey: decodedCacheKey });
    
    if (result.deletedCount > 0) {
      res.json({
        success: true,
        message: 'Cache başarıyla silindi'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Cache bulunamadı'
      });
    }
  } catch (error) {
    console.error('Delete cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Cache silinirken hata oluştu'
    });
  }
});

/**
 * POST /api/xtreme-cache/clean
 * Eski cache'leri temizle (admin only - opsiyonel)
 */
router.post('/clean', async (req, res) => {
  try {
    const result = await XtremeCodeCache.cleanOldCache();
    
    res.json({
      success: true,
      message: 'Eski cache\'ler temizlendi',
      deletedCount: result?.deletedCount || 0
    });
  } catch (error) {
    console.error('Clean cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Cache temizlenirken hata oluştu'
    });
  }
});

export default router;

