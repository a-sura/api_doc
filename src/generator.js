const { marked } = require('marked');

/**
 * Generate HTML documentation from parsed OpenAPI spec
 */
function generateDocumentation(spec) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(spec.info.title)} - API Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
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
        .param-type { color: #888; font-size: 0.9em; }
        .required { color: #f93e3e; font-size: 0.85em; font-weight: bold; }
        .response-code { display: inline-block; padding: 4px 8px; background: #f8f9fa; border-radius: 4px; font-family: 'Courier New', monospace; font-weight: 600; margin-right: 10px; }
        .response-code.success { background: #d4edda; color: #155724; }
        .response-code.error { background: #f8d7da; color: #721c24; }
        .code-block { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9em; }
        .deprecated { opacity: 0.6; text-decoration: line-through; }
        .tag-badge { display: inline-block; padding: 4px 12px; background: #e7f3ff; color: #667eea; border-radius: 12px; font-size: 0.85em; margin-right: 8px; }
        .search-box { margin-bottom: 20px; }
        .search-box input { width: 100%; padding: 12px 20px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 1em; }
        .search-box input:focus { outline: none; border-color: #667eea; }
        @media (max-width: 768px) {
            .header h1 { font-size: 1.8em; }
            .endpoint-header { flex-direction: column; align-items: flex-start; }
            .param-table { font-size: 0.9em; }
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

        ${generateInfoSection(spec)}
        ${generateServersSection(spec)}
        
        <div class="search-box">
            <input type="text" id="search" placeholder="Search endpoints..." onkeyup="filterEndpoints()">
        </div>

        <div class="endpoints">
            ${generateEndpoints(spec)}
        </div>
    </div>

    <script>
        function toggleEndpoint(element) {
            element.classList.toggle('active');
        }

        function filterEndpoints() {
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const endpoints = document.querySelectorAll('.endpoint');
            
            endpoints.forEach(endpoint => {
                const text = endpoint.textContent.toLowerCase();
                endpoint.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>
  `;

  return html;
}

function generateInfoSection(spec) {
  if (!spec.info.contact && !spec.info.license) return '';

  let html = '<div class="info-section"><h2>API Information</h2>';
  
  if (spec.info.contact) {
    html += '<div class="section"><div class="section-title">Contact</div>';
    if (spec.info.contact.name) html += `<p><strong>Name:</strong> ${escapeHtml(spec.info.contact.name)}</p>`;
    if (spec.info.contact.email) html += `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(spec.info.contact.email)}">${escapeHtml(spec.info.contact.email)}</a></p>`;
    if (spec.info.contact.url) html += `<p><strong>URL:</strong> <a href="${escapeHtml(spec.info.contact.url)}" target="_blank">${escapeHtml(spec.info.contact.url)}</a></p>`;
    html += '</div>';
  }

  if (spec.info.license) {
    html += '<div class="section"><div class="section-title">License</div>';
    html += `<p>${escapeHtml(spec.info.license.name)}`;
    if (spec.info.license.url) html += ` (<a href="${escapeHtml(spec.info.license.url)}" target="_blank">View License</a>)`;
    html += '</p></div>';
  }

  html += '</div>';
  return html;
}

function generateServersSection(spec) {
  if (!spec.servers || spec.servers.length === 0) return '';

  let html = '<div class="info-section"><h2>Base URLs</h2><div class="servers">';
  
  spec.servers.forEach(server => {
    html += `<div class="server-item">
      <strong>${escapeHtml(server.url)}</strong>
      ${server.description ? `<br><small>${escapeHtml(server.description)}</small>` : ''}
    </div>`;
  });

  html += '</div></div>';
  return html;
}

function generateEndpoints(spec) {
  let html = '';

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (method === 'parameters') continue;

      const deprecated = operation.deprecated ? 'deprecated' : '';
      
      html += `
        <div class="endpoint ${deprecated}" onclick="toggleEndpoint(this)">
          <div class="endpoint-header">
            <span class="method ${method}">${method}</span>
            <span class="path">${escapeHtml(path)}</span>
            ${operation.tags ? operation.tags.map(tag => `<span class="tag-badge">${escapeHtml(tag)}</span>`).join('') : ''}
          </div>
          <div class="endpoint-body">
            ${operation.summary ? `<p><strong>${escapeHtml(operation.summary)}</strong></p>` : ''}
            ${operation.description ? `<p>${escapeHtml(operation.description)}</p>` : ''}
            ${generateParameters(operation, methods)}
            ${generateRequestBody(operation)}
            ${generateResponses(operation)}
          </div>
        </div>
      `;
    }
  }

  return html;
}

function generateParameters(operation, pathItem) {
  const params = [...(pathItem.parameters || []), ...(operation.parameters || [])];
  
  if (params.length === 0) return '';

  let html = '<div class="section"><div class="section-title">Parameters</div>';
  html += '<table class="param-table"><thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Description</th></tr></thead><tbody>';

  params.forEach(param => {
    html += `<tr>
      <td><span class="param-name">${escapeHtml(param.name)}</span> ${param.required ? '<span class="required">required</span>' : ''}</td>
      <td>${escapeHtml(param.in)}</td>
      <td><span class="param-type">${getParamType(param)}</span></td>
      <td>${escapeHtml(param.description || '')}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  return html;
}

function generateRequestBody(operation) {
  if (!operation.requestBody) return '';

  let html = '<div class="section"><div class="section-title">Request Body</div>';
  
  if (operation.requestBody.description) {
    html += `<p>${escapeHtml(operation.requestBody.description)}</p>`;
  }

  if (operation.requestBody.content) {
    for (const [contentType, content] of Object.entries(operation.requestBody.content)) {
      html += `<p><strong>Content-Type:</strong> <code>${escapeHtml(contentType)}</code></p>`;
      
      if (content.schema) {
        html += `<div class="code-block">${escapeHtml(JSON.stringify(content.schema, null, 2))}</div>`;
      }
    }
  }

  html += '</div>';
  return html;
}

function generateResponses(operation) {
  if (!operation.responses || Object.keys(operation.responses).length === 0) return '';

  let html = '<div class="section"><div class="section-title">Responses</div>';

  for (const [code, response] of Object.entries(operation.responses)) {
    const statusClass = code.startsWith('2') ? 'success' : (code.startsWith('4') || code.startsWith('5') ? 'error' : '');
    
    html += `<div style="margin-bottom: 15px;">
      <span class="response-code ${statusClass}">${code}</span>
      <span>${escapeHtml(response.description || '')}</span>
    `;

    if (response.content) {
      for (const [contentType, content] of Object.entries(response.content)) {
        html += `<p style="margin-top: 10px;"><strong>Content-Type:</strong> <code>${escapeHtml(contentType)}</code></p>`;
        
        if (content.schema) {
          html += `<div class="code-block">${escapeHtml(JSON.stringify(content.schema, null, 2))}</div>`;
        }
      }
    }

    html += '</div>';
  }

  html += '</div>';
  return html;
}

function getParamType(param) {
  if (param.schema && param.schema.type) {
    return param.schema.type;
  }
  return param.type || 'string';
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  generateDocumentation
};
