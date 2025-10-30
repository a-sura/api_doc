const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const UPLOADS = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('openapi'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const href = `/uploads/${req.file.filename}`;
  res.json({ url: href });
});

app.use('/uploads', express.static(UPLOADS));

app.get('/fetch-spec', async (req, res) => {
  const specUrl = req.query.url;
  if (!specUrl) return res.status(400).json({ error: 'url query param required' });
  try {
    const resp = await fetch(specUrl);
    if (!resp.ok) return res.status(400).json({ error: 'failed to fetch spec' });
    const text = await resp.text();
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (e) {
      const parsed = yaml.parse(text);
      return res.json(parsed);
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OpenAPI preview running: http://localhost:${PORT}`));
