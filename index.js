const express = require('express');
const cors = require('cors');
const compression = require('compression');
const NodeCache = require('node-cache');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정: hsrdata.com만 허용
app.use(cors({ origin: 'https://hsrdata.com' }));

// GZIP 압축
app.use(compression());

// 캐시 (5초 TTL)
const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 });

// API 키 순차 선택
const apiKeys = (process.env.SEOUL_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
let keyIndex = 0;
function getNextApiKey() {
  if (apiKeys.length === 0) return null;
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return key;
}

// 헬스체크 라우트
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// timeout 적용된 fetch
async function fetchWithTimeout(url, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// 지하철 실시간 정보 API
app.get('/subway', async (req, res) => {
  const line = req.query.line || '1호선';
  const cacheKey = `subway:${line}`;

  // 캐시 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // 키 순환 재시도
  let lastError;
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = getNextApiKey();
    if (!apiKey) break;

    const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      cache.set(cacheKey, data);
      return res.json(data);
    } catch (err) {
      lastError = err;
    }
  }

  res.status(502).json({ error: lastError?.message || 'Unknown error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
