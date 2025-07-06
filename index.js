// index.js 중 /subway 핸들러 부분만 발췌

const DEFAULT_TIMEOUT = 3000; // 3초

// fetch에 타임아웃 적용
async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

app.get('/subway', async (req, res) => {
  const line = req.query.line || '1호선';
  const cacheKey = `subway:${line}`;

  // 캐시 체크 생략...

  // 여러 키 순환하며 시도
  const keys = apiKeys; // 앞에서 split 해서 만든 배열
  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = getNextApiKey();  // 이전에 구현한 순차 선택
    const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/30/${encodeURIComponent(line)}`;
    
    try {
      const response = await fetchWithTimeout(url, DEFAULT_TIMEOUT);
      if (!response.ok) {
        lastError = new Error(`서울시 API 오류: ${response.status}`);
        continue;  // 다음 키로 재시도
      }
      const data = await response.json();
      cache.set(cacheKey, data);
      return res.json(data);
    } catch (err) {
      lastError = err;
      // ETIMEDOUT 또는 AbortError 예상 → 다음 키로 계속
    }
  }

  // 모든 키로 시도했으나 실패
  console.error('모든 키로 호출 실패:', lastError);
  res.status(502).json({ error: lastError.message });
});
