const express = require('express');
const cors = require('cors');
const compression = require('compression');
const NodeCache = require('node-cache');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CORS: hsrdata.com만 허용
app.use(cors({ origin: 'https://hsrdata.com' }));

// 2. GZIP 압축
app.use(compression());

// 3. 캐시 설정 (5초 TTL)
const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 });

function getRandomApiKey() {
  const keys = (process.env.SEOUL_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  return keys.length ? keys[Math.floor(Math.random() * keys.length)] : null;
}

app.get('/', (req, res) => res.send('✅ 서버 정상 작동 중!'));

app.get('/subway', async (req, res) => {
  const line = req.query.line || '1호선';
  const cacheKey = `subway:${line}`;

  // 4. 캐시 조회
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const apiKey = getRandomApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키 누락' });
  }

  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }
    const data = await response.json();

    // 5. 캐시에 저장
    cache.set(cacheKey, data);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 포트 ${PORT}`);
});
