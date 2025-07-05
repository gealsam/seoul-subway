const fetch = require('node-fetch');

exports.handler = async (event) => {
  const line = event.queryStringParameters?.line || '1호선';
  const apiKey = '79495874757275673939587442634a';
  const url = `https://swopenapi.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/1/20/${encodeURIComponent(line)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};