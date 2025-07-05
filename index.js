const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정: hsrdata.com만 허용
app.use(cors({
  origin: 'https://hsrdata.com'
}));

// 환경변수 SEOUL_API_KEYS 에서 키 배열 추출 후 랜덤 선택
function getRandomApiKey() {
  const keys = (process.env.SEOUL_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) return null;
  const key = keys[Math.floor(Math.random() * keys.length)];
  return key;
}

app.get('/subway', async (req, res) => {
  const line = req.query.line || '1호선';
  const apiKey = getRandomApiKey();

  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;

  console.log(`[API 호출] key: ${apiKey}, url: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`서울시 API 오류: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[API 오류]', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중 http://localhost:${PORT} (포트 ${PORT})`);
});
