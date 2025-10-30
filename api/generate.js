// Serverless function compatible with Vercel, Netlify, AWS Lambda
const yaml = require('js-yaml');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let spec;

    // Parse request body
    if (typeof req.body === 'string') {
      try {
        spec = JSON.parse(req.body);
      } catch {
        spec = yaml.load(req.body);
      }
    } else {
      spec = req.body;
    }

    // Validate basic structure
    if (!spec.openapi && !spec.swagger) {
      throw new Error('Invalid OpenAPI/Swagger specification: missing version field');
    }

    if (!spec.info) {
      throw new Error('Invalid OpenAPI/Swagger specification: missing info field');
    }

    if (!spec.paths) {
      throw new Error('Invalid OpenAPI/Swagger specification: missing paths field');
    }

    // Normalize spec
    const normalized = normalizeSpec(spec);

    // Generate HTML
    const html = generateDocumentation(normalized);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    return res.status(400).json({
      error: 'Failed to generate documentation',
      message: error.message
    });
  }
};

function normalizeSpec(spec) {
  const normalized = {
    version: spec.openapi || spec.swagger,
    info: spec.info,
    servers: spec.servers || [],
    paths: {},
    components: spec.components || spec.definitions || {},
    security: spec.security || [],
    tags: spec.tags || []
  };

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    normalized.paths[path] = {};
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
    
    for (const method of methods) {
      if (pathItem[method]) {
        normalized.paths[path][method] = {
          summary: pathItem[method].summary || '',
          description: pathItem[method].description || '',
          operationId: pathItem[method].operationId || '',
          tags: pathItem[method].tags || [],
          parameters: pathItem[method].parameters || [],
          requestBody: pathItem[method].requestBody || null,
          responses: pathItem[method].responses || {},
          security: pathItem[method].security || [],
          deprecated: pathItem[method].deprecated || false
        };
      }
    }

    if (pathItem.parameters) {
      normalized.paths[path].parameters = pathItem.parameters;
    }
  }

  return normalized;
}

function generateDocumentation(spec) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(spec.info.title)} - API Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header .version { opacity: 0.9; font-size: 1.1em; }
        .header .description { margin-top: 15px; opacity: 0.95; }
        .info-section { background: white; padding: 25px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .info-section h2 { color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .servers { display: grid; gap: 10px; }
        .server-item { background: #f8f9fa; padding: 10px 15px; border-radius: 4px; border-left: 3px solid #667eea; }
        .endpoints { margin-top: 30px; }
        .endpoint { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .endpoint-header { padding: 20px; cursor: pointer; display: flex; align-items: center; gap: 15px; transition: background 0.2s; }
        .endpoint-header:hover { background: #f8f9fa; }
        .method { padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 0.85em; text-transform: uppercase; color: white; }
        .method.get { background: #61affe; }
        .method.post { background: #49cc90; }
        .method.put { background: #fca130; }
        .method.delete { background: #f93e3e; }
        .method.patch { background: #50e3c2; }
        .path { font-family: 'Courier New', monospace; font-size: 1.1em; flex: 1; color: #3b4151; }
        .endpoint-body { padding: 0 20px 20px; display: none; }
        .endpoint.active .endpoint-body { display: block; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: 600; color: #667eea; margin-bottom: 10px; font-size: 1.1em; }
        .param-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .param-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; }
        .param-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
        .param-name { font-family: 'Courier New', monospace; color: #667eea; font-weight: 500; }
        .required { color: #f93e3e; font-size: 0.85em; font-weight: bold; }
        .response-code { display: inline-block; padding: 4px 8px; background: #f8f9fa; border-radius: 4px; font-family: 'Courier New', monospace; font-weight: 600; margin-right: 10px; }
        .response-code.success { background: #d4edda; color: #155724; }
        .response-code.error { background: #f8d7da; color: #721c24; }
        .code-block { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9em; }
        .tag-badge { display: inline-block; padding: 4px 12px; background: #e7f3ff; color: #667eea; border-radius: 12px; font-size: 0.85em; margin-right: 8px; }
        .search-box { margin-bottom: 20px; }
        .search-box input { width: 100%; padding: 12px 20px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 1em; }
        @media (max-width: 768px) {
            .header h1 { font-size: 1.8em; }
            .endpoint-header { flex-direction: column; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(spec.info.title)}</h1>
            <div class="version">Version ${escapeHtml(spec.info.version)}</div>
            ${spec.info.description ? `<div class="description">${escapeHtml(spec.info.description)}</div>` : ''}
        </div>
        ${generateServersSection(spec)}
        <div class="search-box">
            <input type="text" id="search" placeholder="Search endpoints..." onkeyup="filterEndpoints()">
        </div>
        <div class="endpoints">
            ${generateEndpoints(spec)}
        </div>
    </div>
    <script>
        function toggleEndpoint(el) { el.classList.toggle('active'); }
        function filterEndpoints() {
            const term = document.getElementById('search').value.toLowerCase();
            document.querySelectorAll('.endpoint').forEach(ep => {
                ep.style.display = ep.textContent.toLowerCase().includes(term) ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>`;
}

function generateServersSection(spec) {
  if (!spec.servers || spec.servers.length === 0) return '';
  let html = '<div class="info-section"><h2>Base URLs</h2><div class="servers">';
  spec.servers.forEach(server => {
    html += `<div class="server-item"><strong>${escapeHtml(server.url)}</strong>${server.description ? `<br><small>${escapeHtml(server.description)}</small>` : ''}</div>`;
  });
  return html + '</div></div>';
}

function generateEndpoints(spec) {
  let html = '';
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (method === 'parameters') continue;
      html += `<div class="endpoint" onclick="toggleEndpoint(this)">
        <div class="endpoint-header">
          <span class="method ${method}">${method}</span>
          <span class="path">${escapeHtml(path)}</span>
          ${operation.tags ? operation.tags.map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('') : ''}
        </div>
        <div class="endpoint-body">
          ${operation.summary ? `<p><strong>${escapeHtml(operation.summary)}</strong></p>` : ''}
          ${operation.description ? `<p>${escapeHtml(operation.description)}</p>` : ''}
          ${generateParameters(operation, methods)}
          ${generateResponses(operation)}
        </div>
      </div>`;
    }
  }
  return html;
}

function generateParameters(operation, pathItem) {
  const params = [...(pathItem.parameters || []), ...(operation.parameters || [])];
  if (params.length === 0) return '';
  let html = '<div class="section"><div class="section-title">Parameters</div><table class="param-table"><thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Description</th></tr></thead><tbody>';
  params.forEach(p => {
    html += `<tr><td><span class="param-name">${escapeHtml(p.name)}</span> ${p.required ? '<span class="required">required</span>' : ''}</td><td>${escapeHtml(p.in)}</td><td>${getParamType(p)}</td><td>${escapeHtml(p.description || '')}</td></tr>`;
  });
  return html + '</tbody></table></div>';
}

function generateResponses(operation) {
  if (!operation.responses) return '';
  let html = '<div class="section"><div class="section-title">Responses</div>';
  for (const [code, response] of Object.entries(operation.responses)) {
    const cls = code.startsWith('2') ? 'success' : 'error';
    html += `<div><span class="response-code ${cls}">${code}</span><span>${escapeHtml(response.description || '')}</span></div>`;
  }
  return html + '</div>';
}

function getParamType(param) {
  return (param.schema && param.schema.type) || param.type || 'string';
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
