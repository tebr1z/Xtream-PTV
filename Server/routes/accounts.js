import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Geçici olarak memory'de sakla (production'da database kullanılmalı)
// Bu sadece kayıtsız kullanıcıların hesaplarını saklamak için
let anonymousAccounts = [];

/**
 * Anonim kullanıcı hesaplarını kaydet
 */
router.post('/anonymous', async (req, res) => {
  try {
    const { accounts, type } = req.body; // type: 'xtreme' | 'm3u'
    
    // IP adresini daha iyi yakala
    let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || 'unknown';
    
    // IPv6 localhost'u IPv4'e çevir
    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
      clientIp = '127.0.0.1 (Localhost)';
    } else if (clientIp.startsWith('::ffff:')) {
      // IPv4-mapped IPv6 adresini temizle
      clientIp = clientIp.replace('::ffff:', '');
    }
    
    // Eğer x-forwarded-for varsa ilk IP'yi al (proxy arkasındaysa)
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    
    if (!accounts || !Array.isArray(accounts)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri formatı.'
      });
    }

    // Mevcut kayıtları kontrol et ve güncelle
    accounts.forEach(account => {
      const existingIndex = anonymousAccounts.findIndex(
        a => a.id === account.id && a.type === type && a.ip === clientIp
      );

      const accountData = {
        ...account,
        type,
        ip: clientIp,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex > -1) {
        anonymousAccounts[existingIndex] = accountData;
      } else {
        anonymousAccounts.push(accountData);
      }
    });

    res.json({
      success: true,
      message: 'Hesaplar başarıyla kaydedildi.',
      count: accounts.length
    });
  } catch (error) {
    console.error('Save anonymous accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesaplar kaydedilirken hata oluştu.'
    });
  }
});

/**
 * Tüm anonim hesapları getir (sadece admin)
 */
router.get('/anonymous', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, ip } = req.query;
    
    let filteredAccounts = [...anonymousAccounts];

    // Filtreleme
    if (type) {
      filteredAccounts = filteredAccounts.filter(a => a.type === type);
    }

    if (ip) {
      filteredAccounts = filteredAccounts.filter(a => 
        a.ip && a.ip.includes(ip)
      );
    }

    // Tarihe göre sırala (en yeni önce)
    filteredAccounts.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.submittedAt || 0);
      const dateB = new Date(b.updatedAt || b.submittedAt || 0);
      return dateB - dateA;
    });

    res.json({
      success: true,
      accounts: filteredAccounts,
      total: filteredAccounts.length
    });
  } catch (error) {
    console.error('Get anonymous accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesaplar yüklenirken hata oluştu.'
    });
  }
});

/**
 * Anonim hesabı sil (sadece admin)
 */
router.delete('/anonymous/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = anonymousAccounts.length;
    anonymousAccounts = anonymousAccounts.filter(a => a.id !== id);

    if (anonymousAccounts.length < initialLength) {
      res.json({
        success: true,
        message: 'Hesap başarıyla silindi.'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Hesap bulunamadı.'
      });
    }
  } catch (error) {
    console.error('Delete anonymous account error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesap silinirken hata oluştu.'
    });
  }
});

export default router;

