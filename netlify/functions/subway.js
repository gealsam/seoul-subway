// netlify/functions/subway.js
const fetch = require('node-fetch');

// 여러 개 API 키 배열 (실제 키로 교체하세요)
const apiKeys = [
  '5745764b77727567313232516f564446',
  '4e63676b7872756734336b53786e56',
  '6c67726e4f72756735345646536175',
  '664655507a72756739397970515749',
  '79495874757275673939587442634a',
];

let currentKeyIndex = 0;
function getNextApiKey() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

// 서울 지하철 노선 번호 배열 (필요시 추가)
const lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '공항철도', '신분당선', '수인분당선'];

exports.handler = async (event) => {
  try {
    const allData = {};

    // 노선별 API 호출 (순차 호출)
    for (const line of lines) {
      const apiKey = getNextApiKey();
      const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/100/${line}`;

      const res = await fetch(url);

      if (!res.ok) {
        return {
          statusCode: res.status,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: `API 호출 실패: ${res.statusText} (라인: ${line})` }),
        };
      }

      const data = await res.json();

      allData[line] = data.realtimePosition?.row || [];
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(allData),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
