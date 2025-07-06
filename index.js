const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정: 특정 도메인만 허용 (여기선 hsrdata.com)
app.use(cors({
  origin: 'https://hsrdata.com'  // 필요 시 * 로 변경 가능
}));

// API 키 랜덤 선택 함수
function getRandomApiKey() {
  const keys = (process.env.SEOUL_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

// 루트 경로 응답 (확인용)
app.get('/', (req, res) => {
  res.send('✅ 서버 정상 작동 중!');
});

// /subway 경로: 서울시 지하철 실시간 정보 프록시
app.get('/subway', async (req, res) => {
  const line = req.query.line || '1호선';
  const apiKey = getRandomApiKey();

  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;
  console.log(`[API 호출] ${url}`);

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API 호출 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
