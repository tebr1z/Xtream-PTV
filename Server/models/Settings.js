import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  footer: {
    companyName: {
      type: String,
      default: 'IPTV Manager',
      required: true
    },
    copyrightYear: {
      type: String,
      default: '2023 - 2026',
      required: true
    },
    version: {
      type: String,
      default: 'V 2.1.0 (Beta)',
      required: true
    },
    description: {
      type: String,
      default: 'Professional IPTV Management Platform',
      required: false
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    contactInfo: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' }
    }
  },
  site: {
    name: {
      type: String,
      default: 'StreamHub',
      required: true
    },
    tagline: {
      type: String,
      default: 'IPTV Management Platform',
      required: false
    }
  }
}, {
  timestamps: true
});

// Tek bir settings document olacak şekilde
SettingsSchema.statics.getSettings = async function() {
  try {
    // MongoDB bağlantısı kontrolü
    if (mongoose.connection.readyState !== 1) {
      // MongoDB bağlı değilse default değerleri döndür
      return {
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
      };
    }

    let settings = await this.findOne();
    if (!settings) {
      settings = await this.create({});
    }
    return settings;
  } catch (error) {
    console.error('Settings.getSettings error:', error);
    // Hata durumunda default değerleri döndür
    return {
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
    };
  }
};

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;

