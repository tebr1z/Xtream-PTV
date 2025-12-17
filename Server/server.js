import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import accountRoutes from './routes/accounts.js';
import userAccountRoutes from './routes/userAccounts.js';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iptv-manager';

// MongoDB bağlantısı (opsiyonel - bağlantı hatası server'ı durdurmaz)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı');
  })
  .catch((error) => {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    console.log('⚠️  MongoDB bağlantısı olmadan devam ediliyor...');
  });

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json());

// Trust proxy for IP address
app.set('trust proxy', true);

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Account routes (anonymous accounts)
app.use('/api/accounts', accountRoutes);

// User account routes (logged in users)
app.use('/api/user-accounts', userAccountRoutes);

// Xtreme Code API Proxy endpoint
app.get('/api/xtreme', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ 
        error: 'Missing or invalid url parameter' 
      });
    }
    
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).json({ 
        error: 'Invalid URL format' 
      });
    }
    
    // Xtreme Code API'ye istek yap
    const response = await axios.get(targetUrl, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IPTV-Proxy/1.0',
      },
      validateStatus: () => true, // Tüm status kodlarını kabul et
    });
    
    // 404 durumu
    if (response.status === 404) {
      return res.status(404).json({
        error: 'API endpoint not found',
        message: 'Endpoint bulunamadı',
        requestedUrl: targetUrl
      });
    }
    
    // Başarılı response (200-299)
    if (response.status >= 200 && response.status < 300) {
      // Response data'yı kontrol et ve döndür
      let responseData = response.data;
      
      // Eğer string ise parse et
      if (typeof responseData === 'string' && responseData.trim() !== '') {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {
          return res.status(500).json({ 
            error: 'Invalid JSON response',
            raw: responseData.substring(0, 200)
          });
        }
      }
      
      // IP FORBIDDEN veya hata kontrolü
      if (responseData && typeof responseData === 'object') {
        const dataString = JSON.stringify(responseData).toLowerCase();
        if (dataString.includes('forbidden') || dataString.includes('ip forbidden') || 
            (responseData.result === false) || 
            (responseData['0'] && responseData['0'].toString().toLowerCase().includes('forbidden'))) {
          return res.status(403).json({
            error: 'IP FORBIDDEN',
            message: 'IP adresi engellendi',
            requestedUrl: targetUrl
          });
        }
      }
      
      // Xtreme Code API özel format kontrolü
      // Bazı sunucular { result: [...] } formatında döner
      if (responseData && typeof responseData === 'object') {
        // Eğer 'result' key'i varsa ve array ise, onu döndür
        if ('result' in responseData && Array.isArray(responseData.result)) {
          return res.status(200).json(responseData.result);
        }
        // Eğer direkt array ise döndür
        if (Array.isArray(responseData)) {
          return res.status(200).json(responseData);
        }
        // Diğer durumlarda direkt döndür
        return res.status(200).json(responseData);
      }
      
      return res.status(200).json(responseData);
    }
    
    // Diğer hata durumları
    return res.status(response.status).json({
      error: `HTTP ${response.status}`,
      message: 'Sunucu hatası'
    });
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 IPTV Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`👥 User routes: http://localhost:${PORT}/api/users`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});
