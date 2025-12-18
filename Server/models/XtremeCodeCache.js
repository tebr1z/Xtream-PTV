import mongoose from 'mongoose';

const xtremeCodeCacheSchema = new mongoose.Schema({
  // Cache key: serverUrl + username + password kombinasyonu
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  serverUrl: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  apiEndpoint: {
    type: String,
    default: '/api.php'
  },
  // Categories cache
  categories: {
    type: Array,
    default: []
  },
  categoriesCachedAt: {
    type: Date,
    default: null
  },
  // Streams cache (category bazlı)
  streams: {
    type: Map,
    of: {
      data: Array,
      cachedAt: Date
    },
    default: {}
  },
  // Cache süresi (dakika cinsinden)
  cacheDuration: {
    type: Number,
    default: 5 // 5 dakika default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Cache key oluştur
xtremeCodeCacheSchema.statics.generateCacheKey = function(serverUrl, username, password) {
  return `${serverUrl}|${username}|${password}`;
};

// Cache'i kontrol et ve getir
xtremeCodeCacheSchema.statics.getCache = async function(serverUrl, username, password, type = 'categories', categoryId = null) {
  try {
    // MongoDB bağlantısı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return null; // MongoDB bağlı değilse cache yok
    }
    
    const cacheKey = this.generateCacheKey(serverUrl, username, password);
    const cache = await this.findOne({ cacheKey });
    
    if (!cache) {
      return null; // Cache yok
    }
    
    const now = new Date();
    const cacheDurationMs = cache.cacheDuration * 60 * 1000; // dakika -> ms
    
    if (type === 'categories') {
      // Categories cache kontrolü
      if (!cache.categoriesCachedAt) {
        return null; // Cache var ama data yok
      }
      
      const cacheAge = now - cache.categoriesCachedAt;
      if (cacheAge > cacheDurationMs) {
        // Cache süresi dolmuş
        return null;
      }
      
      return {
        data: cache.categories,
        apiEndpoint: cache.apiEndpoint,
        cachedAt: cache.categoriesCachedAt
      };
    } else if (type === 'streams') {
      // Streams cache kontrolü
      if (!categoryId) {
        categoryId = 'all';
      }
      
      const streamCache = cache.streams && cache.streams[categoryId];
      if (!streamCache || !streamCache.cachedAt) {
        return null; // Cache var ama data yok
      }
      
      const cacheAge = now - new Date(streamCache.cachedAt);
      if (cacheAge > cacheDurationMs) {
        // Cache süresi dolmuş
        return null;
      }
      
      return {
        data: streamCache.data,
        apiEndpoint: cache.apiEndpoint,
        cachedAt: streamCache.cachedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('XtremeCodeCache.getCache error:', error);
    return null;
  }
};

// Cache'e kaydet
xtremeCodeCacheSchema.statics.setCache = async function(serverUrl, username, password, data, type = 'categories', categoryId = null, apiEndpoint = '/api.php') {
  try {
    // MongoDB bağlantısı kontrolü
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected, skipping cache save');
      return null; // MongoDB bağlı değilse cache kaydetme
    }
    
    const cacheKey = this.generateCacheKey(serverUrl, username, password);
    let cache = await this.findOne({ cacheKey });
    
    const now = new Date();
    
    if (!cache) {
      // Yeni cache oluştur
      cache = new this({
        cacheKey,
        serverUrl,
        username,
        password,
        apiEndpoint,
        cacheDuration: 5 // 5 dakika default
      });
    } else {
      // Mevcut cache'i güncelle
      cache.apiEndpoint = apiEndpoint;
      cache.updatedAt = now;
    }
    
    if (type === 'categories') {
      cache.categories = Array.isArray(data) ? data : [];
      cache.categoriesCachedAt = now;
    } else if (type === 'streams') {
      if (!categoryId) {
        categoryId = 'all';
      }
      
      // Streams Object'i oluştur veya güncelle
      if (!cache.streams || typeof cache.streams !== 'object') {
        cache.streams = {};
      }
      
      cache.streams[categoryId] = {
        data: Array.isArray(data) ? data : [],
        cachedAt: now
      };
    }
    
    await cache.save();
    return cache;
  } catch (error) {
    console.error('XtremeCodeCache.setCache error:', error);
    throw error;
  }
};

// Eski cache'leri temizle (30 günden eski)
xtremeCodeCacheSchema.statics.cleanOldCache = async function() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await this.deleteMany({
      updatedAt: { $lt: thirtyDaysAgo }
    });
    
    console.log(`Cleaned ${result.deletedCount} old cache entries`);
    return result;
  } catch (error) {
    console.error('XtremeCodeCache.cleanOldCache error:', error);
    return null;
  }
};

const XtremeCodeCache = mongoose.models.XtremeCodeCache || mongoose.model('XtremeCodeCache', xtremeCodeCacheSchema);

export default XtremeCodeCache;

