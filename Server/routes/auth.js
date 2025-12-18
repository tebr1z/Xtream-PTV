import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Register endpoint
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar doldurulmalıdır.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 8 karakter olmalıdır.'
      });
    }

    // Email zaten kullanılıyor mu kontrol et (1 email = 1 hesap)
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor. Her email adresi ile sadece bir kez kayıt olunabilir.'
      });
    }

    // Username zaten kullanılıyor mu kontrol et
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor.'
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Email verification token oluştur
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 saat geçerli

    // Yeni kullanıcı oluştur (emailVerified: false ile)
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user', // Yeni kayıtlar user role ile başlar
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: verificationTokenExpiry
    });

    await newUser.save();

    // Email verification link'i oluştur (dinamik domain)
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

    // Email gönder
    try {
      await sendVerificationEmail({
        name: username,
        email: email,
        verificationLink,
        lang: 'az' // Varsayılan dil, frontend'den gelebilir
      });
    } catch (mailError) {
      console.error('Verification email send error:', mailError);
      // Email gönderilemese bile kullanıcı kaydedildi, sadece log'la
    }

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı. Lütfen email adresinizi doğrulayın.',
      emailSent: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        emailVerified: false
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu.'
    });
  }
});

/**
 * Login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı/email ve şifre gereklidir.'
      });
    }

    // Kullanıcıyı bul (username veya email ile)
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı/email veya şifre hatalı.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmış.'
      });
    }

    // Email verification kontrolü (Admin için atla)
    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Email adresinizi doğrulamanız gerekiyor. Lütfen email kutunuzu kontrol edin.',
        emailVerified: false
      });
    }

    // Password kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı/email veya şifre hatalı.'
      });
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      // Kullanıcının kayıtlı hesaplarını da gönder
      xtremeCodeAccounts: user.xtremeCodeAccounts || [],
      m3uAccounts: user.m3uAccounts || []
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu.'
    });
  }
});

/**
 * Me endpoint - Kullanıcı bilgilerini getir
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token bulunamadı.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(401).json({
      success: false,
      message: 'Token geçersiz.'
    });
  }
});

/**
 * Email verification endpoint
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama token\'ı bulunamadı.'
      });
    }

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: new Date() } // Token süresi dolmamış olmalı
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş doğrulama token\'ı.'
      });
    }

    // Email'i doğrula
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email doğrulama sırasında bir hata oluştu.'
    });
  }
});

/**
 * Resend verification email endpoint
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email adresi gereklidir.'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email adresiniz zaten doğrulanmış.'
      });
    }

    // Günlük email gönderme limiti kontrolü (maksimum 2 email/gün)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastSentDate = user.emailVerificationLastSentDate 
      ? new Date(user.emailVerificationLastSentDate)
      : null;
    
    if (lastSentDate) {
      lastSentDate.setHours(0, 0, 0, 0);
    }

    // Eğer bugün email gönderilmişse ve limit aşılmışsa
    if (lastSentDate && lastSentDate.getTime() === today.getTime()) {
      if (user.emailVerificationSentCount >= 2) {
        return res.status(429).json({
          success: false,
          message: 'Günlük email gönderme limitine ulaştınız. Lütfen yarın tekrar deneyin. (Maksimum 2 email/gün)'
        });
      }
    } else {
      // Yeni gün, sayacı sıfırla
      user.emailVerificationSentCount = 0;
    }

    // Yeni token oluştur
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiry = verificationTokenExpiry;
    user.emailVerificationSentCount += 1;
    user.emailVerificationLastSentDate = new Date();
    await user.save();

    // Email gönder
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail({
        name: user.username,
        email: user.email,
        verificationLink,
        lang: 'az'
      });

      res.json({
        success: true,
        message: 'Doğrulama email\'i tekrar gönderildi. Lütfen email kutunuzu kontrol edin.',
        remainingCount: 2 - user.emailVerificationSentCount
      });
    } catch (mailError) {
      console.error('Resend verification email error:', mailError);
      res.status(500).json({
        success: false,
        message: 'Email gönderilirken bir hata oluştu.'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Doğrulama email\'i gönderilirken bir hata oluştu.'
    });
  }
});

/**
 * Forgot password endpoint - Password reset email gönder
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email adresi gereklidir.'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Güvenlik: Kullanıcı var mı yok mu bilgisini verme (timing attack önleme)
    if (!user) {
      // Kullanıcı yoksa bile başarılı mesajı döndür (güvenlik)
      return res.json({
        success: true,
        message: 'Eğer bu email adresi ile kayıtlı bir hesap varsa, şifre sıfırlama linki email adresinize gönderildi.'
      });
    }

    // Password reset token oluştur
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Email gönder
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({
        name: user.username,
        email: user.email,
        resetLink,
        lang: 'az'
      });

      res.json({
        success: true,
        message: 'Eğer bu email adresi ile kayıtlı bir hesap varsa, şifre sıfırlama linki email adresinize gönderildi.'
      });
    } catch (mailError) {
      console.error('Password reset email send error:', mailError);
      res.status(500).json({
        success: false,
        message: 'Email gönderilirken bir hata oluştu.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlama isteği işlenirken bir hata oluştu.'
    });
  }
});

/**
 * Reset password endpoint - Token ile şifre sıfırla
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre gereklidir.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 8 karakter olmalıdır.'
      });
    }

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpiry: { $gt: new Date() } // Token süresi dolmamış olmalı
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş şifre sıfırlama token\'ı.'
      });
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle ve token'ları temizle
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlama sırasında bir hata oluştu.'
    });
  }
});

export default router;

