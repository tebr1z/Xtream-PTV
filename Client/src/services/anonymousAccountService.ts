/**
 * Kayıtsız kullanıcı hesaplarını backend'e gönder
 */

/**
 * Kullanıcı login olmuş mu kontrol et
 */
const isUserLoggedIn = (): boolean => {
  try {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  } catch {
    return false;
  }
};

/**
 * Xtreme Code hesabını backend'e gönder (sadece login olmayan kullanıcılar için)
 */
export const sendXtremeCodeAccount = async (account: any): Promise<void> => {
  // Eğer kullanıcı login olmuşsa gönderme (kayıtlı kullanıcı)
  if (isUserLoggedIn()) {
    return;
  }

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    await fetch(`${backendUrl}/api/accounts/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accounts: [account],
        type: 'xtreme'
      }),
    });
  } catch (err) {
    // Hata olsa bile sessizce devam et (kullanıcı deneyimini bozmamak için)
    console.error('Send Xtreme Code account error:', err);
  }
};

/**
 * M3U hesabını backend'e gönder (sadece login olmayan kullanıcılar için)
 */
export const sendM3UAccount = async (account: any): Promise<void> => {
  // Eğer kullanıcı login olmuşsa gönderme (kayıtlı kullanıcı)
  if (isUserLoggedIn()) {
    return;
  }

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    await fetch(`${backendUrl}/api/accounts/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accounts: [account],
        type: 'm3u'
      }),
    });
  } catch (err) {
    // Hata olsa bile sessizce devam et (kullanıcı deneyimini bozmamak için)
    console.error('Send M3U account error:', err);
  }
};

