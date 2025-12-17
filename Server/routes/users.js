import express from 'express';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Tüm kullanıcıları getir (sadece admin)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search filter
    const searchFilter = search
      ? {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(searchFilter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchFilter);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar yüklenirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcı role'ünü güncelle (sadece admin)
 */
router.put('/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir role giriniz (admin veya user).'
      });
    }

    // Kendi role'ünü değiştirmeyi engelle
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Kendi role\'ünüzü değiştiremezsiniz.'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      message: 'Role başarıyla güncellendi.',
      user
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Role güncellenirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcıyı sil (sadece admin)
 */
router.delete('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Kendini silmeyi engelle
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi silemezsiniz.'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcıyı aktif/pasif yap (sadece admin)
 */
router.put('/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Kendini pasif yapmayı engelle
    if (userId === req.user.userId && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi pasif yapamazsınız.'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      message: `Kullanıcı ${isActive ? 'aktif' : 'pasif'} yapıldı.`,
      user
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Durum güncellenirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcıya Xtreme Code hesabı ekle (sadece admin)
 * NOT: Bu route, /:userId route'undan ÖNCE tanımlanmalı (spesifik route'lar önce gelmeli)
 */
router.post('/:userId/xtreme-code', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { serverUrl, tvName, username, password, apiEndpoint } = req.body;

    console.log('POST /api/users/:userId/xtreme-code - userId:', userId);
    console.log('Request body:', { serverUrl, tvName, username, password: '***', apiEndpoint });

    if (!serverUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Sunucu URL, kullanıcı adı ve şifre gereklidir.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    console.log('User found:', user.username);

    const newAccount = {
      id: `admin_xtreme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      serverUrl,
      tvName: tvName || 'Admin Tarafından Eklenen',
      username,
      password,
      apiEndpoint: apiEndpoint || '/player_api.php',
      addedBy: req.user.userId,
      addedAt: new Date()
    };

    if (!user.adminXtremeCodeAccounts) {
      user.adminXtremeCodeAccounts = [];
    }
    user.adminXtremeCodeAccounts.push(newAccount);
    
    // Xtreme Code eklendiğinde otomatik olarak IPTV paketi de ata
    if (!user.assignedPackage || !user.assignedPackage.name) {
      user.assignedPackage = {
        name: tvName || 'IPTV Paketi',
        endDate: 'Sınırsız',
        quality: 'HD / Full HD',
        channelCount: '-',
        status: 'Aktif',
        assignedBy: req.user.userId,
        assignedAt: new Date()
      };
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Xtreme Code hesabı başarıyla eklendi ve IPTV paketi atandı.',
      account: newAccount,
      package: user.assignedPackage
    });
  } catch (error) {
    console.error('Add Xtreme Code error:', error);
    res.status(500).json({
      success: false,
      message: 'Xtreme Code hesabı eklenirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcıya IPTV paketi ata (sadece admin)
 */
router.put('/:userId/package', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, endDate, quality, channelCount, status } = req.body;

    console.log('PUT /api/users/:userId/package - userId:', userId);
    console.log('Request body:', { name, endDate, quality, channelCount, status });

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Paket adı gereklidir.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    console.log('User found:', user.username);

    user.assignedPackage = {
      name,
      endDate: endDate || 'Sınırsız',
      quality: quality || 'HD',
      channelCount: channelCount || '-',
      status: status || 'Aktif',
      assignedBy: req.user.userId,
      assignedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'IPTV paketi başarıyla atandı.',
      package: user.assignedPackage
    });
  } catch (error) {
    console.error('Assign package error:', error);
    res.status(500).json({
      success: false,
      message: 'IPTV paketi atanırken hata oluştu.'
    });
  }
});

/**
 * Kullanıcının Xtreme Code hesabını düzenle (sadece admin)
 */
router.put('/:userId/xtreme-code/:accountId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, accountId } = req.params;
    const { serverUrl, tvName, username, password, apiEndpoint } = req.body;

    if (!serverUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Sunucu URL, kullanıcı adı ve şifre gereklidir.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    if (!user.adminXtremeCodeAccounts || user.adminXtremeCodeAccounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Xtreme Code hesabı bulunamadı.'
      });
    }

    const accountIndex = user.adminXtremeCodeAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Xtreme Code hesabı bulunamadı.'
      });
    }

    // Hesabı güncelle
    user.adminXtremeCodeAccounts[accountIndex] = {
      ...user.adminXtremeCodeAccounts[accountIndex],
      serverUrl,
      tvName: tvName || user.adminXtremeCodeAccounts[accountIndex].tvName,
      username,
      password,
      apiEndpoint: apiEndpoint || user.adminXtremeCodeAccounts[accountIndex].apiEndpoint
    };

    await user.save();

    res.json({
      success: true,
      message: 'Xtreme Code hesabı başarıyla güncellendi.',
      account: user.adminXtremeCodeAccounts[accountIndex]
    });
  } catch (error) {
    console.error('Update Xtreme Code error:', error);
    res.status(500).json({
      success: false,
      message: 'Xtreme Code hesabı güncellenirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcının Xtreme Code hesabını sil (sadece admin)
 */
router.delete('/:userId/xtreme-code/:accountId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, accountId } = req.params;

    console.log('DELETE /api/users/:userId/xtreme-code/:accountId - userId:', userId, 'accountId:', accountId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    if (!user.adminXtremeCodeAccounts || user.adminXtremeCodeAccounts.length === 0) {
      console.log('No adminXtremeCodeAccounts found for user');
      return res.status(404).json({
        success: false,
        message: 'Xtreme Code hesabı bulunamadı.'
      });
    }

    console.log('User adminXtremeCodeAccounts:', JSON.stringify(user.adminXtremeCodeAccounts.map(acc => ({ id: acc.id, tvName: acc.tvName })), null, 2));

    const accountIndex = user.adminXtremeCodeAccounts.findIndex(acc => {
      const accId = String(acc.id || acc._id || '');
      const searchId = String(accountId || '');
      return accId === searchId;
    });

    console.log('Account index found:', accountIndex);

    if (accountIndex === -1) {
      console.log('Account not found. Available IDs:', user.adminXtremeCodeAccounts.map(acc => String(acc.id || acc._id || '')));
      return res.status(404).json({
        success: false,
        message: 'Xtreme Code hesabı bulunamadı.',
        debug: {
          accountId,
          availableIds: user.adminXtremeCodeAccounts.map(acc => String(acc.id || acc._id || ''))
        }
      });
    }

    // Hesabı sil
    user.adminXtremeCodeAccounts.splice(accountIndex, 1);
    await user.save();
    
    console.log('Account deleted successfully');

    res.json({
      success: true,
      message: 'Xtreme Code hesabı başarıyla silindi.'
    });
  } catch (error) {
    console.error('Delete Xtreme Code error:', error);
    res.status(500).json({
      success: false,
      message: 'Xtreme Code hesabı silinirken hata oluştu.'
    });
  }
});

/**
 * Kullanıcı bilgilerini getir (kendi bilgilerini görebilir veya admin herkesi görebilir)
 * NOT: Bu route EN SONA taşındı çünkü spesifik route'lar (/:userId/xtreme-code, /:userId/package) önce gelmeli
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kullanıcı sadece kendi bilgilerini görebilir veya admin herkesi görebilir
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok.'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri yüklenirken hata oluştu.'
    });
  }
});

export default router;

