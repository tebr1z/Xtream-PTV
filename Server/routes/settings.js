import express from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tüm kullanıcılar için settings'i getir (public)
router.get('/', async (req, res) => {
  try {
    // MongoDB bağlantısı kontrolü
    if (mongoose.connection.readyState !== 1) {
      // MongoDB bağlı değilse default değerleri döndür
      return res.json({
        success: true,
        settings: {
          footer: {
            companyName: 'IPTV Manager',
            copyrightYear: '2023 - 2026',
            version: 'V 1.1.0 (Beta)',
            description: 'Professional IPTV Management Platform',
            socialLinks: {
              facebook: '',
              twitter: '',
              instagram: '',
              linkedin: '',
              youtube: ''
            },
            contactInfo: {
              email: '',
              phone: '',
              address: ''
            }
          },
          site: {
            name: 'StreamHub',
            tagline: 'IPTV Management Platform'
          }
        }
      });
    }

    const settings = await Settings.getSettings();
    res.json({
      success: true,
      settings: {
        footer: settings.footer || {
          companyName: 'IPTV Manager',
          copyrightYear: '2023 - 2026',
          version: 'V 2.1.0 (Beta)',
          description: 'Professional IPTV Management Platform',
          socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
          },
          contactInfo: {
            email: '',
            phone: '',
            address: ''
          }
        },
        site: settings.site || {
          name: 'StreamHub',
          tagline: 'IPTV Management Platform'
        }
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    // Hata durumunda default değerleri döndür
    res.json({
      success: true,
      settings: {
        footer: {
          companyName: 'IPTV Manager',
          copyrightYear: '2023 - 2026',
          version: 'V 2.1.0 (Beta)',
          description: 'Professional IPTV Management Platform',
          socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
          },
          contactInfo: {
            email: '',
            phone: '',
            address: ''
          }
        },
        site: {
          name: 'StreamHub',
          tagline: 'IPTV Management Platform'
        }
      }
    });
  }
});

// Admin için settings'i güncelle
router.put('/', authenticateToken, async (req, res) => {
  try {
    // Admin kontrolü
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkisiz erişim'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gereklidir'
      });
    }

    // MongoDB bağlantısı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Veritabanı bağlantısı yok. Ayarlar kaydedilemiyor.'
      });
    }

    const { footer, site } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (footer) {
      if (footer.companyName !== undefined) settings.footer.companyName = footer.companyName;
      if (footer.copyrightYear !== undefined) settings.footer.copyrightYear = footer.copyrightYear;
      if (footer.version !== undefined) settings.footer.version = footer.version;
      if (footer.description !== undefined) settings.footer.description = footer.description;
      
      if (footer.socialLinks) {
        if (footer.socialLinks.facebook !== undefined) {
          settings.footer.socialLinks.facebook = footer.socialLinks.facebook || '';
        }
        if (footer.socialLinks.twitter !== undefined) {
          settings.footer.socialLinks.twitter = footer.socialLinks.twitter || '';
        }
        if (footer.socialLinks.instagram !== undefined) {
          settings.footer.socialLinks.instagram = footer.socialLinks.instagram || '';
        }
        if (footer.socialLinks.linkedin !== undefined) {
          settings.footer.socialLinks.linkedin = footer.socialLinks.linkedin || '';
        }
        if (footer.socialLinks.youtube !== undefined) {
          settings.footer.socialLinks.youtube = footer.socialLinks.youtube || '';
        }
      }
      
      if (footer.contactInfo) {
        if (footer.contactInfo.email !== undefined) {
          settings.footer.contactInfo.email = footer.contactInfo.email || '';
        }
        if (footer.contactInfo.phone !== undefined) {
          settings.footer.contactInfo.phone = footer.contactInfo.phone || '';
        }
        if (footer.contactInfo.address !== undefined) {
          settings.footer.contactInfo.address = footer.contactInfo.address || '';
        }
      }
    }

    if (site) {
      if (site.name) settings.site.name = site.name;
      if (site.tagline) settings.site.tagline = site.tagline;
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi',
      settings: {
        footer: settings.footer,
        site: settings.site
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar güncellenirken bir hata oluştu'
    });
  }
});

export default router;

