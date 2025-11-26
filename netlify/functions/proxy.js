const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  try {
    // Prefer explicit backend URL env, then pod id, then VITE_API_BASE_URL if provided
    const backendUrl = process.env.RUNPOD_BACKEND_URL || process.env.RUNPOD_BACKEND_POD_ID || process.env.VITE_API_BASE_URL;
    if (!backendUrl) {
      return { statusCode: 500, body: JSON.stringify({ error: 'RUNPOD_BACKEND_URL not set' }) };
    }

    // build target URL
    // allow full URL in RUNPOD_BACKEND_URL, or pod id in RUNPOD_BACKEND_POD_ID
    let targetBase = backendUrl;
    if (!/^https?:\/\//.test(targetBase)) {
      // assume pod id, build proxy.runpod.net URL
      targetBase = `https://${backendUrl}-8000.proxy.runpod.net`;
    }

    const path = event.path.replace(/^\/api/, '');
    const url = targetBase + path + (event.rawQueryString ? `?${event.rawQueryString}` : '');

    const headers = {};
    // forward selected headers from client
    for (const [k, v] of Object.entries(event.headers || {})) {
      if (['cookie', 'authorization', 'content-type', 'accept'].includes(k.toLowerCase())) {
        headers[k] = v;
      }
    }

    const fetchOptions = {
      method: event.httpMethod,
      headers,
      redirect: 'manual'
    };

    if (event.body) {
      fetchOptions.body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
    }

    const resp = await fetch(url, fetchOptions);

    // collect response headers
    const respHeaders = {};
    resp.headers.forEach((value, name) => {
      // pass-through CORS and Set-Cookie
      if (name.toLowerCase() === 'set-cookie') {
        // node-fetch concatenates multiple set-cookie into single header separated by commas; Netlify supports array
        const existing = respHeaders['set-cookie'] || [];
        existing.push(value);
        respHeaders['set-cookie'] = existing;
      } else {
        respHeaders[name] = value;
      }
    });

    const bodyBuffer = await resp.arrayBuffer();
    const isText = resp.headers.get('content-type') && resp.headers.get('content-type').includes('application/json');
    const body = isText ? Buffer.from(bodyBuffer).toString('utf8') : bodyBuffer.toString('base64');

    // ensure CORS allows front-end origin and credentials
    respHeaders['access-control-allow-origin'] = process.env.FRONTEND_URL || process.env.VITE_API_BASE_URL || 'https://hotspod.online';
    respHeaders['access-control-allow-credentials'] = 'true';

    return {
      statusCode: resp.status,
      headers: respHeaders,
      body: body,
      isBase64Encoded: !isText,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
