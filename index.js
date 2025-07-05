const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/subway', async (req, res) => {
  const line = req.query.line || '1호선';
  const apiKey = process.env.SEOUL_API_KEY || '여기에_서울시_API_키_입력';

  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send('서울시 API 요청 실패');
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).send('프록시 서버 오류: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중 http://localhost:${PORT}`);
});
