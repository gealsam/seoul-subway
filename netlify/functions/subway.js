// netlify/functions/subway.js
const fetch = require('node-fetch');

// 인증키 한 개만 넣으세요
const API_KEY = '여기에_서울시_인증키_입력';

const lines = ['1', '2', '3'];

exports.handler = async () => {
  try {
    const promises = lines.map(line => {
      const url = `https://swopenapi.seoul.go.kr/api/subway/${API_KEY}/json/realtimePosition/0/100/${line}`;
      return fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return res.json();
        })
        .then(data => [line, data.realtimePosition?.row || []]);
    });

    const results = await Promise.all(promises);
    const allData = Object.fromEntries(results);

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
