const fetch = require('node-fetch');

exports.handler = async (event) => {
  const line = event.queryStringParameters.line || '1호선';
  const apiKey = '79495874757275673939587442634a'; // 본인 API키로 교체 가능
  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/1/5/${encodeURIComponent(line)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `API 요청 실패: ${response.statusText}` }),
      };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
