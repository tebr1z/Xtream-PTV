import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user' // Yeni kayıtlar user role ile başlar
  },
  xtremeCodeAccounts: {
    type: [{
      id: String,
      serverUrl: String,
      tvName: String,
      username: String,
      password: String,
      apiEndpoint: String,
      createdAt: Date,
      lastUsed: Date
    }],
    default: []
  },
  m3uAccounts: {
    type: [{
      id: String,
      url: String,
      name: String,
      username: String,
      password: String,
      createdAt: Date,
      lastUsed: Date,
      channelCount: Number
    }],
    default: []
  },
  assignedPackage: {
    name: String,
    endDate: String,
    quality: String,
    channelCount: String,
    status: String,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date
  },
  adminXtremeCodeAccounts: {
    type: [{
      id: String,
      serverUrl: String,
      tvName: String,
      username: String,
      password: String,
      apiEndpoint: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      addedAt: Date
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Password hash için (bcrypt kullanılacak)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

