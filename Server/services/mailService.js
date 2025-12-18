import nodemailer from 'nodemailer';

let transporter = null;

export const getMailTransporter = () => {
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // 465 için true, 587 için false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Port 587 için STARTTLS ayarları
    ...(port === 587 && {
      requireTLS: true,
      tls: {
        rejectUnauthorized: false, // Self-signed sertifikalar için
      },
    }),
    // Port 465 için SSL ayarları
    ...(port === 465 && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  });

  return transporter;
};

export const sendSupportMail = async ({ name, email, subject, message, lang, supportId, supportLink }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }

  const langCode = (lang || 'az').split('-')[0];
  const supported = ['tr', 'en', 'ru', 'az'];
  const finalLang = supported.includes(langCode) ? langCode : 'en';

  const subjectMap = {
    tr: 'Yeni destek talebi',
    en: 'New support request',
    ru: 'Новый запрос в поддержку',
    az: 'Yeni dəstək sorğusu',
  };

  const introMap = {
    tr: 'Yeni bir destek talebi aldınız.',
    en: 'You have received a new support request.',
    ru: 'Вы получили новый запрос в поддержку.',
    az: 'Yeni bir dəstək sorğusu aldınız.',
  };

  const footerMap = {
    tr: 'Bu e-posta IPTV Manager destek formu üzerinden otomatik olarak gönderilmiştir.',
    en: 'This email was sent automatically from the IPTV Manager support form.',
    ru: 'Это письмо было отправлено автоматически из формы поддержки IPTV Manager.',
    az: 'Bu e-poçt IPTV Manager dəstək formasından avtomatik olaraq göndərilib.',
  };

  const mailSubject = subjectMap[finalLang];
  const introText = introMap[finalLang];
  const footerText = footerMap[finalLang];

  // Dil bazlı etiketler (tek dil - çift dil yok)
  const labels = {
    tr: {
      name: 'İsim',
      email: 'E-posta',
      subject: 'Konu',
      message: 'Mesaj',
    },
    en: {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
    },
    ru: {
      name: 'Имя',
      email: 'Электронная почта',
      subject: 'Тема',
      message: 'Сообщение',
    },
    az: {
      name: 'Ad',
      email: 'E-poçt',
      subject: 'Mövzu',
      message: 'Mesaj',
    },
  };

  const label = labels[finalLang] || labels.en;

  const toEmail = process.env.SUPPORT_TO_EMAIL || process.env.SMTP_USER;

  // HTML şablon
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="${finalLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 50px 40px 40px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0; color: #19e6c4; font-size: 32px; font-weight: 800; letter-spacing: -1px;">StreamHub</h1>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; opacity: 0.95;">Support Request</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 30px; color: #333333; font-size: 18px; line-height: 1.7; font-weight: 500;">${introText}</p>
              
              ${supportId && supportId !== 'N/A' ? `
              <div style="margin: 0 0 30px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; border: 2px solid #f59e0b; text-align: center;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">${finalLang === 'tr' ? 'Destek Talebi ID' : finalLang === 'en' ? 'Support Ticket ID' : finalLang === 'ru' ? 'ID запроса в поддержку' : 'Dəstək Sorğusu ID'}</p>
                <p style="margin: 0; color: #78350f; font-size: 24px; font-weight: 800; letter-spacing: 2px; font-family: monospace;">${supportId}</p>
              </div>
              ` : ''}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border-radius: 10px; padding: 30px; border: 2px solid #19e6c4;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                    <strong style="color: #19e6c4; font-size: 15px; display: block; margin-bottom: 5px;">${label.name}</strong>
                    <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                    <strong style="color: #19e6c4; font-size: 15px; display: block; margin-bottom: 5px;">${label.email}</strong>
                    <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5;">
                    <strong style="color: #19e6c4; font-size: 15px; display: block; margin-bottom: 5px;">${label.subject}</strong>
                    <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${subject}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: #19e6c4; font-size: 15px; display: block; margin-bottom: 10px;">${label.message}</strong>
                    <div style="color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">${message.replace(/\n/g, '<br>')}</div>
                  </td>
                </tr>
              </table>
              
              ${supportLink && supportLink !== 'N/A' ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${supportLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(25, 230, 196, 0.3);">${finalLang === 'tr' ? 'Destek Talebini Görüntüle' : finalLang === 'en' ? 'View Support Ticket' : finalLang === 'ru' ? 'Просмотреть запрос' : 'Dəstək Sorğusunu Görüntülə'}</a>
              </div>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 40px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">${footerText}</p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} StreamHub - IPTV Manager. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text versiyonu (spam filtreleri için)
  const textVersion = `
${introText}

${label.name}: ${name}
${label.email}: ${email}
${label.subject}: ${subject}

${label.message}:
${message}

---------
${footerText}
  `.trim();

  const mailOptions = {
    from: `"StreamHub Support" <${process.env.SMTP_USER}>`,
    to: toEmail,
    replyTo: email,
    subject: mailSubject,
    text: textVersion,
    html: htmlTemplate,
    // Spam önleme için headers
    headers: {
      'X-Mailer': 'StreamHub Support System',
      'X-Priority': '1',
      'Importance': 'high',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  };

  const t = getMailTransporter();
  await t.sendMail(mailOptions);
};

/**
 * Kullanıcıya teşekkür maili gönder (destek formu için)
 */
export const sendSupportConfirmationMail = async ({ name, email, lang, supportId, supportLink }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }

  const langCode = (lang || 'az').split('-')[0];
  const supported = ['tr', 'en', 'ru', 'az'];
  const finalLang = supported.includes(langCode) ? langCode : 'en';

  const subjectMap = {
    tr: 'Destek talebiniz alındı - IPTV Manager',
    en: 'Your support request has been received - IPTV Manager',
    ru: 'Ваш запрос в поддержку получен - IPTV Manager',
    az: 'Dəstək sorğunuz qəbul edildi - IPTV Manager',
  };

  const greetingMap = {
    tr: `Merhaba ${name},`,
    en: `Hello ${name},`,
    ru: `Здравствуйте ${name},`,
    az: `Salam ${name},`,
  };

  const bodyMap = {
    tr: `Destek talebiniz başarıyla alındı. En kısa sürede size geri dönüş yapacağız.

Talebinizle ilgili herhangi bir güncelleme olduğunda size e-posta ile bildirim göndereceğiz.

Teşekkür ederiz.`,
    en: `Your support request has been successfully received. We will get back to you as soon as possible.

We will notify you by email if there are any updates regarding your request.

Thank you.`,
    ru: `Ваш запрос в поддержку успешно получен. Мы свяжемся с вами в ближайшее время.

Мы уведомим вас по электронной почте, если появятся какие-либо обновления по вашему запросу.

Спасибо.`,
    az: `Dəstək sorğunuz uğurla qəbul edildi. Mümkün qədər tez sizinlə əlaqə saxlayacağıq.

Sorğunuzla bağlı hər hansı yeniləmə olduqda sizə e-poçt ilə bildiriş göndərəcəyik.

Təşəkkür edirik.`,
  };

  const footerMap = {
    tr: 'Bu e-posta IPTV Manager destek sistemi tarafından otomatik olarak gönderilmiştir.',
    en: 'This email was sent automatically by the IPTV Manager support system.',
    ru: 'Это письмо было отправлено автоматически системой поддержки IPTV Manager.',
    az: 'Bu e-poçt IPTV Manager dəstək sistemi tərəfindən avtomatik olaraq göndərilib.',
  };

  const mailSubject = subjectMap[finalLang];
  const greeting = greetingMap[finalLang];
  const bodyText = bodyMap[finalLang];
  const footerText = footerMap[finalLang];

  // HTML şablon
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="${finalLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 50px 40px 40px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0; color: #19e6c4; font-size: 32px; font-weight: 800; letter-spacing: -1px;">StreamHub</h1>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; opacity: 0.95;">Support Confirmation</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">${greeting}</p>
              
              ${supportId && supportId !== 'N/A' ? `
              <div style="margin: 0 0 30px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; border: 2px solid #f59e0b; text-align: center;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">${finalLang === 'tr' ? 'Destek Talebi ID' : finalLang === 'en' ? 'Support Ticket ID' : finalLang === 'ru' ? 'ID запроса в поддержку' : 'Dəstək Sorğusu ID'}</p>
                <p style="margin: 0; color: #78350f; font-size: 24px; font-weight: 800; letter-spacing: 2px; font-family: monospace;">${supportId}</p>
              </div>
              ` : ''}
              
              <div style="margin: 30px 0; padding: 35px; background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border-left: 5px solid #19e6c4; border-radius: 10px; box-shadow: 0 2px 8px rgba(25, 230, 196, 0.1);">
                <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.9; white-space: pre-wrap;">${bodyText.replace(/\n/g, '<br>')}</p>
              </div>

              ${supportLink && supportLink !== 'N/A' ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${supportLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(25, 230, 196, 0.3);">${finalLang === 'tr' ? 'Destek Talebini İzle' : finalLang === 'en' ? 'Track Support Ticket' : finalLang === 'ru' ? 'Отслеживать запрос' : 'Dəstək Sorğusunu İzlə'}</a>
              </div>
              ` : ''}

              <div style="margin: 40px 0 30px; padding: 25px; background-color: #f9fafb; border-radius: 10px; text-align: center; border: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
                  <span style="color: #19e6c4; font-size: 18px; margin-right: 8px;">💡</span>
                  <strong style="color: #19e6c4;">${finalLang === 'tr' ? 'İpucu:' : finalLang === 'en' ? 'Tip:' : finalLang === 'ru' ? 'Совет:' : 'Məsləhət:'}</strong> ${supportLink && supportLink !== 'N/A' ? (finalLang === 'tr' ? 'Destek talebinizin durumunu yukarıdaki linkten takip edebilirsiniz.' : finalLang === 'en' ? 'You can track the status of your support request using the link above.' : finalLang === 'ru' ? 'Вы можете отслеживать статус вашего запроса, используя ссылку выше.' : 'Dəstək sorğunuzun statusunu yuxarıdakı linkdən izləyə bilərsiniz.') : (finalLang === 'tr' ? 'Destek talebinizle ilgili güncellemeleri e-posta kutunuzda kontrol etmeyi unutmayın.' : finalLang === 'en' ? 'Don\'t forget to check your email inbox for updates regarding your support request.' : finalLang === 'ru' ? 'Не забудьте проверить свою электронную почту на наличие обновлений по вашему запросу в поддержку.' : 'Dəstək sorğunuzla bağlı yeniləmələri e-poçt qutunuzda yoxlamağı unutmayın.')}
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">${footerText}</p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} StreamHub - IPTV Manager. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text versiyonu
  const textVersion = `
${greeting}

${bodyText}

---------
${footerText}
  `.trim();

  const mailOptions = {
    from: `"StreamHub Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: mailSubject,
    text: textVersion,
    html: htmlTemplate,
    // Spam önleme için headers
    headers: {
      'X-Mailer': 'StreamHub Support System',
      'X-Priority': '1',
      'Importance': 'high',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  };

  const t = getMailTransporter();
  await t.sendMail(mailOptions);
};

/**
 * Kullanıcıya yönetici cevabı maili gönder
 */
export const sendSupportReplyMail = async ({ name, email, subject, supportId, adminReply, lang, supportLink }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }

  const langCode = (lang || 'az').split('-')[0];
  const supported = ['tr', 'en', 'ru', 'az'];
  const finalLang = supported.includes(langCode) ? langCode : 'en';

  const subjectMap = {
    tr: 'Cevap Verildi - Destek Talebiniz #' + supportId,
    en: 'Reply Received - Your Support Ticket #' + supportId,
    ru: 'Ответ получен - Ваш запрос в поддержку #' + supportId,
    az: 'Cavab Verildi - Dəstək Sorğunuz #' + supportId,
  };

  const greetingMap = {
    tr: `Merhaba ${name},`,
    en: `Hello ${name},`,
    ru: `Здравствуйте, ${name},`,
    az: `Salam ${name},`,
  };

  const introMap = {
    tr: `Destek talebinize yönetici tarafından cevap verildi. Aşağıda yöneticinin cevabını bulabilirsiniz.`,
    en: `An administrator has responded to your support request. You can find the administrator's reply below.`,
    ru: `Администратор ответил на ваш запрос в поддержку. Вы можете найти ответ администратора ниже.`,
    az: `Dəstək sorğunuza idarəçi tərəfindən cavab verildi. Aşağıda idarəçinin cavabını tapa bilərsiniz.`,
  };

  const replyLabelMap = {
    tr: 'Yönetici Cevabı',
    en: 'Administrator Reply',
    ru: 'Ответ администратора',
    az: 'İdarəçi Cavabı',
  };

  const footerMap = {
    tr: 'Bu e-posta IPTV Manager destek sistemi tarafından otomatik olarak gönderilmiştir.',
    en: 'This email was sent automatically by the IPTV Manager support system.',
    ru: 'Это письмо было отправлено автоматически системой поддержки IPTV Manager.',
    az: 'Bu e-poçt IPTV Manager dəstək sistemi tərəfindən avtomatik olaraq göndərilib.',
  };

  const mailSubject = subjectMap[finalLang];
  const greeting = greetingMap[finalLang];
  const introText = introMap[finalLang];
  const replyLabel = replyLabelMap[finalLang];
  const footerText = footerMap[finalLang];

  // HTML şablon
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="${finalLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 50px 40px 40px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0; color: #19e6c4; font-size: 32px; font-weight: 800; letter-spacing: -1px;">StreamHub</h1>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; opacity: 0.95;">Support Reply</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">${greeting}</p>
              
              ${supportId && supportId !== 'N/A' ? `
              <div style="margin: 0 0 30px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; border: 2px solid #f59e0b; text-align: center;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">${finalLang === 'tr' ? 'Destek Talebi ID' : finalLang === 'en' ? 'Support Ticket ID' : finalLang === 'ru' ? 'ID запроса в поддержку' : 'Dəstək Sorğusu ID'}</p>
                <p style="margin: 0; color: #78350f; font-size: 24px; font-weight: 800; letter-spacing: 2px; font-family: monospace;">${supportId}</p>
              </div>
              ` : ''}
              
              <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border-left: 5px solid #19e6c4; border-radius: 10px; box-shadow: 0 2px 8px rgba(25, 230, 196, 0.1);">
                <p style="margin: 0 0 15px; color: #1f2937; font-size: 16px; line-height: 1.9; font-weight: 600;">${introText}</p>
                <p style="margin: 0 0 10px; color: #19e6c4; font-size: 14px; font-weight: 600;">${replyLabel}:</p>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${adminReply.replace(/\n/g, '<br>')}</p>
              </div>

              ${supportLink && supportLink !== 'N/A' ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${supportLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(25, 230, 196, 0.3);">${finalLang === 'tr' ? 'Destek Talebini Görüntüle' : finalLang === 'en' ? 'View Support Ticket' : finalLang === 'ru' ? 'Просмотреть запрос' : 'Dəstək Sorğusunu Görüntülə'}</a>
              </div>
              ` : ''}

              <div style="margin: 40px 0 30px; padding: 25px; background-color: #f9fafb; border-radius: 10px; text-align: center; border: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
                  <span style="color: #19e6c4; font-size: 18px; margin-right: 8px;">💡</span>
                  <strong style="color: #19e6c4;">${finalLang === 'tr' ? 'İpucu:' : finalLang === 'en' ? 'Tip:' : finalLang === 'ru' ? 'Совет:' : 'Məsləhət:'}</strong> ${finalLang === 'tr' ? 'Sorularınız için yukarıdaki linkten destek talebinizi görüntüleyebilirsiniz.' : finalLang === 'en' ? 'You can view your support ticket using the link above for any questions.' : finalLang === 'ru' ? 'Вы можете просмотреть свой запрос в поддержку, используя ссылку выше, если у вас есть вопросы.' : 'Suallarınız üçün yuxarıdakı linkdən dəstək sorğunuzu görüntüləyə bilərsiniz.'}
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 40px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">${footerText}</p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} StreamHub - IPTV Manager. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text versiyonu
  const textVersion = `
${greeting}

${introText}

${replyLabel}:
${adminReply}

---------
${footerText}
  `.trim();

  const mailOptions = {
    from: `"StreamHub Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: mailSubject,
    text: textVersion,
    html: htmlTemplate,
    headers: {
      'X-Mailer': 'StreamHub Support System',
      'X-Priority': '1',
      'Importance': 'high',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  };

  const t = getMailTransporter();
  await t.sendMail(mailOptions);
};

// Kullanıcı cevabı admin'e gönder
export const sendUserReplyMail = async ({ ticketId, userName, userEmail, userMessage, ticketSubject, supportLink }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }

  const subjectMap = {
    tr: `Kullanıcı Cevabı - #${ticketId}`,
    en: `User Reply - #${ticketId}`,
    ru: `Ответ пользователя - #${ticketId}`,
    az: `İstifadəçi Cavabı - #${ticketId}`,
  };

  const mailSubject = subjectMap['en']; // Admin'e her zaman İngilizce gönderilebilir veya dil algılanabilir

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 50px 40px 40px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0; color: #19e6c4; font-size: 32px; font-weight: 800; letter-spacing: -1px;">StreamHub</h1>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; opacity: 0.95;">User Reply</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 18px; line-height: 1.7; font-weight: 500;">Hello Admin,</p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">A user has replied to support ticket <strong>#${ticketId}</strong>.</p>

              <div style="margin: 30px 0; padding: 25px; background-color: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px; color: #4b5563; font-size: 14px; font-weight: 600;">Ticket Information:</p>
                <p style="margin: 0 0 5px; color: #333333; font-size: 14px;"><strong>Ticket ID:</strong> #${ticketId}</p>
                <p style="margin: 0 0 5px; color: #333333; font-size: 14px;"><strong>Subject:</strong> ${ticketSubject}</p>
                <p style="margin: 0 0 5px; color: #333333; font-size: 14px;"><strong>User:</strong> ${userName} (${userEmail})</p>
              </div>

              <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border-left: 4px solid #19e6c4; border-radius: 6px;">
                <p style="margin: 0 0 10px; color: #19e6c4; font-size: 15px; font-weight: 600;">User Reply:</p>
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${userMessage.replace(/\n/g, '<br>')}</p>
              </div>

              ${supportLink && supportLink !== 'N/A' ? `
              <div style="margin: 30px 0; text-align: center;">
                <a href="${supportLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(25, 230, 196, 0.3);">View Ticket</a>
              </div>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">This email was sent automatically by the IPTV Manager support system.</p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} StreamHub - IPTV Manager. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textVersion = `
Hello Admin,

A user has replied to support ticket #${ticketId}.

Ticket Information:
- Ticket ID: #${ticketId}
- Subject: ${ticketSubject}
- User: ${userName} (${userEmail})

User Reply:
${userMessage}

${supportLink && supportLink !== 'N/A' ? `View Ticket: ${supportLink}` : ''}

---------
This email was sent automatically by the IPTV Manager support system.
  `.trim();

  const mailOptions = {
    from: `"IPTV Manager Support" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Admin'e gönder
    subject: mailSubject,
    text: textVersion,
    html: htmlTemplate,
    headers: {
      'X-Mailer': 'IPTV Manager Support System',
      'X-Priority': '1',
      'Importance': 'high',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  };

  const t = getMailTransporter();
  await t.sendMail(mailOptions);
};

export const verifyMailConfig = async () => {
  try {
    const t = getMailTransporter();
    await t.verify();
    return true;
  } catch (e) {
    return false;
  }
};

export const sendVerificationEmail = async ({ name, email, verificationLink, lang }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }

  const langCode = (lang || 'az').split('-')[0];
  const supported = ['tr', 'en', 'ru', 'az'];
  const finalLang = supported.includes(langCode) ? langCode : 'en';

  const subjectMap = {
    tr: 'Email Adresinizi Doğrulayın - StreamHub',
    en: 'Verify Your Email Address - StreamHub',
    ru: 'Подтвердите ваш адрес электронной почты - StreamHub',
    az: 'Email Ünvanınızı Təsdiqləyin - StreamHub',
  };

  const greetingMap = {
    tr: `Merhaba ${name},`,
    en: `Hello ${name},`,
    ru: `Здравствуйте, ${name},`,
    az: `Salam ${name},`,
  };

  const introMap = {
    tr: `StreamHub'a hoş geldiniz! Hesabınızı aktifleştirmek için email adresinizi doğrulamanız gerekiyor.`,
    en: `Welcome to StreamHub! You need to verify your email address to activate your account.`,
    ru: `Добро пожаловать в StreamHub! Вам нужно подтвердить ваш адрес электронной почты, чтобы активировать ваш аккаунт.`,
    az: `StreamHub-a xoş gəlmisiniz! Hesabınızı aktivləşdirmək üçün email ünvanınızı təsdiqləməlisiniz.`,
  };

  const buttonTextMap = {
    tr: 'Email Adresimi Doğrula',
    en: 'Verify Email Address',
    ru: 'Подтвердить адрес электронной почты',
    az: 'Email Ünvanını Təsdiqlə',
  };

  const footerMap = {
    tr: 'Bu e-posta StreamHub kayıt sistemi tarafından otomatik olarak gönderilmiştir.',
    en: 'This email was sent automatically by the StreamHub registration system.',
    ru: 'Это письмо было отправлено автоматически системой регистрации StreamHub.',
    az: 'Bu e-poçt StreamHub qeydiyyat sistemi tərəfindən avtomatik olaraq göndərilib.',
  };

  const mailSubject = subjectMap[finalLang];
  const greeting = greetingMap[finalLang];
  const introText = introMap[finalLang];
  const buttonText = buttonTextMap[finalLang];
  const footerText = footerMap[finalLang];

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="${finalLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 50px 40px 40px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0; color: #19e6c4; font-size: 32px; font-weight: 800; letter-spacing: -1px;">StreamHub</h1>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; opacity: 0.95;">${mailSubject}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">${greeting}</p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">${introText}</p>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(25, 230, 196, 0.3);">${buttonText}</a>
              </div>

              <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 10px; border-left: 4px solid #19e6c4;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
                  <strong style="color: #19e6c4;">${finalLang === 'tr' ? 'Not:' : finalLang === 'en' ? 'Note:' : finalLang === 'ru' ? 'Примечание:' : 'Qeyd:'}</strong> ${finalLang === 'tr' ? 'Eğer butona tıklayamıyorsanız, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:' : finalLang === 'en' ? 'If you cannot click the button, copy and paste the link below into your browser:' : finalLang === 'ru' ? 'Если вы не можете нажать кнопку, скопируйте и вставьте ссылку ниже в ваш браузер:' : 'Əgər düyməyə klikləyə bilmirsinizsə, aşağıdakı linki brauzerinizə kopyalayıb yapışdırın:'}
                </p>
                <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px; word-break: break-all; font-family: monospace;">${verificationLink}</p>
              </div>

              <div style="margin: 40px 0 30px; padding: 25px; background-color: #fef3c7; border-radius: 10px; text-align: center; border: 1px solid #fbbf24;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.7;">
                  <span style="color: #f59e0b; font-size: 18px; margin-right: 8px;">⏰</span>
                  <strong>${finalLang === 'tr' ? 'Önemli:' : finalLang === 'en' ? 'Important:' : finalLang === 'ru' ? 'Важно:' : 'Vacibdir:'}</strong> ${finalLang === 'tr' ? 'Bu link 24 saat içinde geçerliliğini yitirecektir.' : finalLang === 'en' ? 'This link will expire within 24 hours.' : finalLang === 'ru' ? 'Эта ссылка истечет в течение 24 часов.' : 'Bu link 24 saat ərzində etibarlılığını itirəcək.'}
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">${footerText}</p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} StreamHub - IPTV Manager. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textVersion = `
${greeting}

${introText}

${buttonText}: ${verificationLink}

${finalLang === 'tr' ? 'Not: Bu link 24 saat içinde geçerliliğini yitirecektir.' : finalLang === 'en' ? 'Note: This link will expire within 24 hours.' : finalLang === 'ru' ? 'Примечание: Эта ссылка истечет в течение 24 часов.' : 'Qeyd: Bu link 24 saat ərzində etibarlılığını itirəcək.'}

---------
${footerText}
  `.trim();

  const mailOptions = {
    from: `"StreamHub" <${process.env.SMTP_USER}>`,
    to: email,
    subject: mailSubject,
    text: textVersion,
    html: htmlTemplate,
    headers: {
      'X-Mailer': 'StreamHub Registration System',
      'X-Priority': '1',
      'Importance': 'high',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  };

  const t = getMailTransporter();
  await t.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async ({ name, email, resetLink, lang }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }

  const langCode = (lang || 'az').split('-')[0];
  const supported = ['tr', 'en', 'ru', 'az'];
  const finalLang = supported.includes(langCode) ? langCode : 'en';

  const subjectMap = {
    tr: 'Şifre Sıfırlama - StreamHub',
    en: 'Password Reset - StreamHub',
    ru: 'Сброс пароля - StreamHub',
    az: 'Şifrə Sıfırlama - StreamHub',
  };

  const greetingMap = {
    tr: `Merhaba ${name},`,
    en: `Hello ${name},`,
    ru: `Здравствуйте, ${name},`,
    az: `Salam ${name},`,
  };

  const introMap = {
    tr: `Şifre sıfırlama talebiniz alındı. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.`,
    en: `We received a password reset request. You can set a new password by clicking the button below.`,
    ru: `Мы получили запрос на сброс пароля. Вы можете установить новый пароль, нажав кнопку ниже.`,
    az: `Şifrə sıfırlama sorğunuz qəbul edildi. Aşağıdakı düyməyə klikləyərək yeni şifrənizi təyin edə bilərsiniz.`,
  };

  const buttonTextMap = {
    tr: 'Şifremi Sıfırla',
    en: 'Reset Password',
    ru: 'Сбросить пароль',
    az: 'Şifrəmi Sıfırla',
  };

  const warningMap = {
    tr: 'Eğer bu talebi siz yapmadıysanız, bu email\'i görmezden gelebilirsiniz. Şifreniz değişmeyecektir.',
    en: 'If you did not make this request, you can ignore this email. Your password will not be changed.',
    ru: 'Если вы не делали этот запрос, вы можете проигнорировать это письмо. Ваш пароль не будет изменен.',
    az: 'Əgər bu sorğunu siz etməmisinizsə, bu e-poçtu görməzdən gələ bilərsiniz. Şifrəniz dəyişməyəcək.',
  };

  const footerMap = {
    tr: 'Bu e-posta StreamHub şifre sıfırlama sistemi tarafından otomatik olarak gönderilmiştir.',
    en: 'This email was sent automatically by the StreamHub password reset system.',
    ru: 'Это письмо было отправлено автоматически системой сброса пароля StreamHub.',
    az: 'Bu e-poçt StreamHub şifrə sıfırlama sistemi tərəfindən avtomatik olaraq göndərilib.',
  };

  const mailSubject = subjectMap[finalLang];
  const greeting = greetingMap[finalLang];
  const introText = introMap[finalLang];
  const buttonText = buttonTextMap[finalLang];
  const warningText = warningMap[finalLang];
  const footerText = footerMap[finalLang];

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="${finalLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 50px 40px 40px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; padding: 20px 30px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0; color: #19e6c4; font-size: 32px; font-weight: 800; letter-spacing: -1px;">StreamHub</h1>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500; opacity: 0.95;">${mailSubject}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">${greeting}</p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">${introText}</p>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #19e6c4 0%, #14b89d 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(25, 230, 196, 0.3);">${buttonText}</a>
              </div>

              <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 10px; border-left: 4px solid #19e6c4;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
                  <strong style="color: #19e6c4;">${finalLang === 'tr' ? 'Not:' : finalLang === 'en' ? 'Note:' : finalLang === 'ru' ? 'Примечание:' : 'Qeyd:'}</strong> ${finalLang === 'tr' ? 'Eğer butona tıklayamıyorsanız, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:' : finalLang === 'en' ? 'If you cannot click the button, copy and paste the link below into your browser:' : finalLang === 'ru' ? 'Если вы не можете нажать кнопку, скопируйте и вставьте ссылку ниже в ваш браузер:' : 'Əgər düyməyə klikləyə bilmirsinizsə, aşağıdakı linki brauzerinizə kopyalayıb yapışdırın:'}
                </p>
                <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px; word-break: break-all; font-family: monospace;">${resetLink}</p>
              </div>

              <div style="margin: 40px 0 30px; padding: 25px; background-color: #fef3c7; border-radius: 10px; text-align: center; border: 1px solid #fbbf24;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.7;">
                  <span style="color: #f59e0b; font-size: 18px; margin-right: 8px;">⚠️</span>
                  <strong>${finalLang === 'tr' ? 'Güvenlik:' : finalLang === 'en' ? 'Security:' : finalLang === 'ru' ? 'Безопасность:' : 'Təhlükəsizlik:'}</strong> ${warningText}
                </p>
              </div>

              <div style="margin: 30px 0; padding: 20px; background-color: #fee2e2; border-radius: 10px; text-align: center; border: 1px solid #ef4444;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.7;">
                  <span style="color: #ef4444; font-size: 18px; margin-right: 8px;">⏰</span>
                  <strong>${finalLang === 'tr' ? 'Önemli:' : finalLang === 'en' ? 'Important:' : finalLang === 'ru' ? 'Важно:' : 'Vacibdir:'}</strong> ${finalLang === 'tr' ? 'Bu link 1 saat içinde geçerliliğini yitirecektir.' : finalLang === 'en' ? 'This link will expire within 1 hour.' : finalLang === 'ru' ? 'Эта ссылка истечет в течение 1 часа.' : 'Bu link 1 saat ərzində etibarlılığını itirəcək.'}
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">${footerText}</p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} StreamHub - IPTV Manager. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textVersion = `
${greeting}

${introText}

${buttonText}: ${resetLink}

${finalLang === 'tr' ? 'Not: Bu link 1 saat içinde geçerliliğini yitirecektir.' : finalLang === 'en' ? 'Note: This link will expire within 1 hour.' : finalLang === 'ru' ? 'Примечание: Эта ссылка истечет в течение 1 часа.' : 'Qeyd: Bu link 1 saat ərzində etibarlılığını itirəcək.'}

${warningText}

---------
${footerText}
  `.trim();

  const mailOptions = {
    from: `"StreamHub" <${process.env.SMTP_USER}>`,
    to: email,
    subject: mailSubject,
    text: textVersion,
    html: htmlTemplate,
    headers: {
      'X-Mailer': 'StreamHub Password Reset System',
      'X-Priority': '1',
      'Importance': 'high',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  };

  const t = getMailTransporter();
  await t.sendMail(mailOptions);
};

