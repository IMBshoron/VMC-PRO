const https = require('https');

exports.handler = async (event, context) => {
  const { targetUrl } = event.queryStringParameters;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing targetUrl parameter' }),
    };
  }

  // Determine which API key to use based on the URL
  let apiKey = '';
  let finalUrl = targetUrl;

  if (targetUrl.includes('serpapi.com')) {
    apiKey = process.env.SERPAPI_KEY;
    // Append or replace api_key if not present or needs to be injected
    if (!targetUrl.includes('api_key=')) {
      finalUrl += (targetUrl.includes('?') ? '&' : '?') + 'api_key=' + apiKey;
    }
  } else if (targetUrl.includes('gravatar.com')) {
    // Gravatar usually doesn't need a key for basic avatars but sometimes does for API
    apiKey = process.env.GRAVATAR_KEY;
  }

  return new Promise((resolve, reject) => {
    https.get(finalUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': res.headers['content-type'] || 'application/json',
          },
          body: data,
        });
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      });
    });
  });
};
