import express from 'express';
import mongoose from 'mongoose';
import { sendSupportMail, sendSupportConfirmationMail, sendSupportReplyMail, sendUserReplyMail, verifyMailConfig } from '../services/mailService.js';
import Support from '../models/Support.js';

const router = express.Router();

// SMTP sağlık kontrolü
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await verifyMailConfig();
    if (isHealthy) {
      res.json({ success: true, message: 'SMTP bağlantısı başarılı' });
    } else {
      res.status(500).json({ success: false, message: 'SMTP bağlantısı başarısız' });
    }
  } catch (error) {
    console.error('SMTP health check error:', error);
    res.status(500).json({ success: false, message: 'SMTP bağlantısı başarısız' });
  }
});

// Destek formu mail gönderimi ve kayıt oluşturma
router.post('/', async (req, res) => {
  try {
    const { name, email, category, subject, message, lang } = req.body || {};

    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar doldurulmalıdır.',
      });
    }

    // MongoDB bağlantı kontrolü
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected, skipping support ticket creation');
    }

    // Destek talebini veritabanına kaydet
    let supportTicket = null;
    try {
      supportTicket = await Support.create({
        name,
        email,
        category: category || 'general',
        subject,
        message,
        lang: lang || 'az',
        status: 'pending',
      });
    } catch (dbError) {
      console.error('Failed to create support ticket in database:', dbError);
      // Veritabanı hatası olsa bile mail göndermeye devam et
    }

    const supportId = supportTicket?.supportId || 'N/A';
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    // Lang prefix'li URL oluştur (örn: /az/support/ABC123)
    const supportLink = `${baseUrl}/${lang || 'az'}/support/${supportId}`;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Mail sunucusu yapılandırılmamış. Lütfen yönetici ile iletişime geçin.',
      });
    }

    // Admin'e destek talebi maili gönder (supportId ve link ile)
    await sendSupportMail({ 
      name, 
      email, 
      subject, 
      message, 
      lang,
      supportId,
      supportLink,
    });

    // Kullanıcıya teşekkür/onay maili gönder (supportId ve link ile)
    try {
      await sendSupportConfirmationMail({ 
        name, 
        email, 
        lang,
        supportId,
        supportLink,
      });
    } catch (userMailError) {
      // Kullanıcı maili başarısız olsa bile admin maili gönderildi, sadece log'la
      console.warn('User confirmation mail failed (admin mail sent):', userMailError);
    }

    res.json({
      success: true,
      message: 'Destek talebiniz başarıyla gönderildi.',
      supportId: supportId,
      supportLink: supportLink,
    });
  } catch (error) {
    console.error('Support mail send error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talebi gönderilirken bir hata oluştu.',
    });
  }
});

// Kullanıcının ticket'larını email'e göre getir
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email gereklidir.',
      });
    }

    // MongoDB bağlantı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
        tickets: [],
      });
    }

    const tickets = await Support.find({ email: email.toLowerCase().trim() })
      .sort({ updatedAt: -1 })
      .lean();

    // adminNotes field'ını kaldır
    const cleanTickets = tickets.map(ticket => {
      const clean = { ...ticket };
      delete clean.adminNotes;
      return clean;
    });

    res.json({
      success: true,
      tickets: cleanTickets,
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Ticket\'lar yüklenirken bir hata oluştu.',
      tickets: [],
    });
  }
});

// Tüm destek taleplerini getir (Admin only)
router.get('/', async (req, res) => {
  try {
    // Basit admin kontrolü - production'da JWT token ile yapılmalı
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // MongoDB bağlantı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
        tickets: [],
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await Support.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Support.countDocuments(query);

    // adminNotes field'ını kaldır (chat gibi çalışması için, sadece adminReplies kullan)
    const cleanTickets = tickets.map(ticket => {
      const clean = { ...ticket };
      delete clean.adminNotes;
      return clean;
    });

    res.json({
      success: true,
      tickets: cleanTickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talepleri getirilirken bir hata oluştu.',
    });
  }
});

// Tek bir destek talebini getir (supportId ile)
router.get('/:supportId', async (req, res) => {
  try {
    const { supportId } = req.params;

    // MongoDB bağlantı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
      });
    }

    const ticket = await Support.findOne({ supportId }).lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Destek talebi bulunamadı.',
      });
    }

    // adminNotes field'ını kaldır (chat gibi çalışması için, sadece adminReplies kullan)
    const cleanTicket = { ...ticket };
    delete cleanTicket.adminNotes;

    res.json({
      success: true,
      ticket: cleanTicket,
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talebi getirilirken bir hata oluştu.',
    });
  }
});

// Destek talebini güncelle (Admin only - status, adminNotes)
router.put('/:supportId', async (req, res) => {
  try {
    const { supportId } = req.params;
    const { status, adminNotes } = req.body;

    // Basit admin kontrolü
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // MongoDB bağlantı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
      });
    }

    // Önce mevcut ticket'ı al (mail göndermek için)
    const oldTicket = await Support.findOne({ supportId }).lean();

    if (!oldTicket) {
      return res.status(404).json({
        success: false,
        message: 'Destek talebi bulunamadı.',
      });
    }

    // MongoDB update işlemi için query oluştur
    const updateQuery = {};
    let shouldSendMail = false;
    let newNotes = null; // newNotes'u daha geniş scope'ta tanımla
    
    // $set ve $push için ayrı objeler oluştur
    const setData = {};
    const pushData = {};
    
    if (status) {
      setData.status = status;
    }
    
    // Eğer adminNotes varsa ve doluysa (yeni admin cevabı)
    if (adminNotes !== undefined) {
      newNotes = adminNotes && adminNotes.trim();
      
      // Eğer yeni notlar varsa, adminReplies array'ine ekle (yeni mesaj olarak)
      // ESKİ MESAJI DEĞİŞTİRME, SADECE YENİ MESAJ EKLE
      if (newNotes) {
        // Yeni admin cevabını array'e ekle (yeni mesaj olarak)
        // MongoDB $push için doğru format - object olarak ekle
        pushData['adminReplies'] = {
          message: newNotes,
          createdAt: new Date(),
        };
        
        // adminNotes'u GÜNCELLEME, sadece yeni mesaj ekle (chat gibi)
        
        shouldSendMail = true;
        
        // Status belirtilmemişse, otomatik olarak "resolved" yap (cevaplandı)
        if (!status) {
          setData.status = 'resolved';
        }
      }
    }

    // Update query'yi oluştur
    if (Object.keys(setData).length > 0) {
      updateQuery.$set = setData;
    }
    if (Object.keys(pushData).length > 0) {
      updateQuery.$push = pushData;
      // Eğer adminReplies array'i yoksa, önce oluştur
      if (!updateQuery.$set) {
        updateQuery.$set = {};
      }
      // adminReplies array'inin var olduğundan emin ol (eğer yoksa boş array oluştur)
      // Bu gerekli değil çünkü schema'da default: [] var, ama yine de emin olalım
    }

    // Eğer update query boşsa, sadece updatedAt'i güncelle
    if (Object.keys(updateQuery).length === 0) {
      updateQuery.$set = { updatedAt: new Date() };
    } else {
      // updatedAt'i her zaman güncelle
      if (!updateQuery.$set) {
        updateQuery.$set = {};
      }
      updateQuery.$set.updatedAt = new Date();
    }

    // MongoDB update işlemini yap
    let ticket;
    try {
      ticket = await Support.findOneAndUpdate(
        { supportId },
        updateQuery,
        { new: true }
      ).lean();
    } catch (updateError) {
      console.error('❌ MongoDB update error:', updateError);
      throw updateError;
    }

    // Eğer admin cevap verdi ise kullanıcıya mail gönder
    if (shouldSendMail) {
      try {
        const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
        const supportLink = `${baseUrl}/${ticket.lang || 'az'}/support/${supportId}`;

        await sendSupportReplyMail({
          name: ticket.name,
          email: ticket.email,
          subject: ticket.subject,
          supportId: ticket.supportId,
          adminReply: adminNotes && adminNotes.trim(),
          lang: ticket.lang,
          supportLink,
        });
      } catch (mailError) {
        console.error('❌ Failed to send support reply email:', mailError);
        // Mail hatası olsa bile ticket güncellendi, sadece log'la
      }
    }

    // Ticket'ı tekrar yükle (userReplies dahil tüm verilerle)
    const finalTicket = await Support.findOne({ supportId }).lean();

    // adminNotes field'ını kaldır (chat gibi çalışması için, sadece adminReplies kullan)
    if (finalTicket) {
      delete finalTicket.adminNotes;
    }
    if (ticket) {
      delete ticket.adminNotes;
    }

    res.json({
      success: true,
      ticket: finalTicket || ticket,
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talebi güncellenirken bir hata oluştu.',
    });
  }
});

// Kullanıcı cevabı ekle (Public - sadece ticket ID ile)
router.post('/:supportId/reply', async (req, res) => {
  try {
    const { supportId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mesaj boş olamaz.',
      });
    }

    // MongoDB bağlantı kontrolü
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
      });
    }

    // Ticket'ı bul
    const ticket = await Support.findOne({ supportId }).lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Destek talebi bulunamadı.',
      });
    }

    // Eğer ticket "closed" ise cevap verilemez
    if (ticket.status === 'closed') {
      return res.status(403).json({
        success: false,
        message: 'Bu destek talebi kapatılmış. Yeni cevap eklenemez.',
      });
    }

    // Kullanıcı cevabını ekle ve status'u "in_progress" yap
    const updatedTicket = await Support.findOneAndUpdate(
      { supportId },
      {
        $push: {
          userReplies: {
            message: message.trim(),
            createdAt: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
          status: 'in_progress', // Müşteri cevap verdiğinde "işleniyor" olarak işaretle
        },
      },
      { new: true }
    ).lean();

    // Admin'e mail gönder
    try {
      const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
      const supportLink = `${baseUrl}/${ticket.lang || 'az'}/support/${supportId}`;

      await sendUserReplyMail({
        ticketId: ticket.supportId,
        userName: ticket.name,
        userEmail: ticket.email,
        userMessage: message.trim(),
        ticketSubject: ticket.subject,
        supportLink,
      });
    } catch (mailError) {
      console.error('Failed to send user reply email to admin:', mailError);
      // Mail hatası olsa bile cevap eklendi, sadece log'la
    }

    res.json({
      success: true,
      ticket: updatedTicket,
      message: 'Cevabınız başarıyla gönderildi.',
    });
  } catch (error) {
    console.error('Add user reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Cevap eklenirken bir hata oluştu.',
    });
  }
});

export default router;


