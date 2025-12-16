import jwt from 'jsonwebtoken';

// JWT secret - production'da environment variable'dan alınmalı
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Token doğrulama middleware'i
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Token bulunamadı. Lütfen giriş yapın.' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: 'Token geçersiz veya süresi dolmuş.' 
      });
    }
    req.user = user;
    next();
  });
};

/**
 * Admin role kontrolü middleware'i
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Giriş yapılmamış.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir.' 
    });
  }

  next();
};

