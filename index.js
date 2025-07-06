const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 미들웨어 설정
app.use(cors({
  origin: (origin, callback) => {
    // origin이 없으면(같은 서버 내 호출 등) 허용
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS policy: No access from ' + origin));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// OPTIONS(preflight) 자동 응답
app.options('*', cors());

// JSON 바디 파싱 (필요 시)
app.use(express.json());

// API 키 랜덤 선택 함수
function getRandomApiKey() {
  const keys = (process.env.SEOUL_API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  if (!keys.length) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

// 루트 경로: 작동 확인용
app.get('/', (req, res) => {
  res
    .status(200)
    .header('Content-Type', 'application/json')
    .json({ status: 'OK', message: '서버 정상 작동 중!' });
});

// /subway 경로: 지하철 실시간 정보 프록시
app.get('/subway', async (req, res) => {
  res.header('Content-Type', 'application/json');

  const line = req.query.line || '1호선';
  const apiKey = getRandomApiKey();
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;
  console.log(`[API 호출] ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text().catch(()=>'');
      return res
        .status(response.status)
        .json({ error: `서울시 API 오류 ${response.status}`, detail: text });
    }
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('API 호출 실패:', err);
    return res
      .status(502)
      .json({ error: '프록시 서버 오류', detail: err.message });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
