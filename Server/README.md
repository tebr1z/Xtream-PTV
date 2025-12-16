# IPTV Proxy Server

Bu server, CORS hatasını aşmak için Xtreme Code API isteklerini proxy eder.

## Kurulum

```bash
cd Server
npm install
```

## Çalıştırma

```bash
# Development mode (otomatik yeniden başlatma)
npm run dev

# Production mode
npm start
```

Server `http://localhost:3001` adresinde çalışacaktır.

## Kullanım

Proxy endpoint: `http://localhost:3001/api/xtreme?url=<TARGET_URL>`

Örnek:
```
http://localhost:3001/api/xtreme?url=http://teammedia.pw:25461/player_api.php?username=xxx&password=yyy&action=get_live_categories
```

## Notlar

- Server çalışırken frontend'den API çağrıları otomatik olarak bu proxy üzerinden yapılacaktır.
- Production'da `VITE_PROXY_URL` environment variable'ını ayarlayın.

