const loadUrlBtn = document.getElementById('loadUrl');
const specUrlInput = document.getElementById('specUrl');
const fileInput = document.getElementById('fileInput');

async function renderFromUrl(url) {
  if (window.SwaggerUIBundle) {
    SwaggerUIBundle({
      url,
      dom_id: '#swaggerUi',
      presets: [SwaggerUIBundle.presets.apis],
      layout: 'BaseLayout'
    });
  }
  if (window.Redoc) {
    document.getElementById('redoc').innerHTML = '';
    Redoc.init(url, {}, document.getElementById('redoc'));
  }
}

loadUrlBtn.addEventListener('click', async () => {
  const url = specUrlInput.value.trim();
  if (!url) return alert('Enter URL');
  try {
    const res = await fetch(`/fetch-spec?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const spec = await res.json();
    const blob = new Blob([JSON.stringify(spec)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    renderFromUrl(blobUrl);
  } catch (err) {
    alert('Could not load spec: ' + err.message);
  }
});

fileInput.addEventListener('change', async (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const form = new FormData();
  form.append('openapi', f);
  try {
    const resp = await fetch('/upload', { method: 'POST', body: form });
    const json = await resp.json();
    if (!json.url) throw new Error(json.error || 'Upload failed');
    renderFromUrl(json.url);
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
});