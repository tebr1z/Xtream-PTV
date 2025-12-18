import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const supportSchema = new mongoose.Schema({
  supportId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase(), // 12 karakterlik benzersiz ID
    index: true, // unique zaten index oluşturur, burada sadece belirtiyoruz
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'bug_report', 'xtreme_code', 'm3u', 'account', 'technical', 'feature_request', 'other'],
    default: 'general',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  lang: {
    type: String,
    required: true,
    enum: ['tr', 'en', 'ru', 'az'],
    default: 'az',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  adminReplies: {
    type: [{
      message: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  userReplies: {
    type: [{
      message: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// updatedAt'i otomatik güncelle
supportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index'ler (supportId zaten unique ile index'lenmiş, tekrar eklemiyoruz)
supportSchema.index({ email: 1 });
supportSchema.index({ status: 1 });
supportSchema.index({ createdAt: -1 });

const Support = mongoose.models.Support || mongoose.model('Support', supportSchema);

export default Support;

