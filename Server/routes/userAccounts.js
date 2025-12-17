import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Kullanıcının Xtreme Code ve M3U hesaplarını kaydet/güncelle
 */
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { xtremeCodeAccounts, m3uAccounts } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    // Xtreme Code hesaplarını güncelle
    if (xtremeCodeAccounts && Array.isArray(xtremeCodeAccounts)) {
      // Mevcut hesapları ID'ye göre birleştir (backend'deki mevcut hesapları koru)
      const existingXtremeMap = new Map(
        (user.xtremeCodeAccounts || []).map(acc => [acc.id, acc])
      );

      // Yeni hesapları ekle veya güncelle
      xtremeCodeAccounts.forEach(account => {
        if (account.id) {
          existingXtremeMap.set(account.id, {
            ...account,
            lastUsed: account.lastUsed || new Date().toISOString(),
            createdAt: account.createdAt || existingXtremeMap.get(account.id)?.createdAt || new Date().toISOString()
          });
        } else {
          // ID yoksa yeni hesap olarak ekle
          const newAccount = {
            ...account,
            id: `xtreme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
          };
          existingXtremeMap.set(newAccount.id, newAccount);
        }
      });

      user.xtremeCodeAccounts = Array.from(existingXtremeMap.values());
    }

    // M3U hesaplarını güncelle
    if (m3uAccounts && Array.isArray(m3uAccounts)) {
      // Mevcut hesapları ID'ye göre birleştir (backend'deki mevcut hesapları koru)
      const existingM3UMap = new Map(
        (user.m3uAccounts || []).map(acc => [acc.id, acc])
      );

      // Yeni hesapları ekle veya güncelle
      m3uAccounts.forEach(account => {
        if (account.id) {
          existingM3UMap.set(account.id, {
            ...account,
            lastUsed: account.lastUsed || new Date().toISOString(),
            createdAt: account.createdAt || existingM3UMap.get(account.id)?.createdAt || new Date().toISOString()
          });
        } else {
          // ID yoksa yeni hesap olarak ekle
          const newAccount = {
            ...account,
            id: `m3u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
          };
          existingM3UMap.set(newAccount.id, newAccount);
        }
      });

      user.m3uAccounts = Array.from(existingM3UMap.values());
    }

    await user.save();

    res.json({
      success: true,
      message: 'Hesaplar başarıyla senkronize edildi.',
      xtremeCodeAccounts: user.xtremeCodeAccounts,
      m3uAccounts: user.m3uAccounts
    });
  } catch (error) {
    console.error('Sync accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesaplar senkronize edilirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcının hesaplarını getir
 */
router.get('/my-accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('xtremeCodeAccounts m3uAccounts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      xtremeCodeAccounts: user.xtremeCodeAccounts || [],
      m3uAccounts: user.m3uAccounts || []
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesaplar yüklenirken hata oluştu.'
    });
  }
});

export default router;

