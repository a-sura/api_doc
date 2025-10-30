const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseSpec } = require('./parser');
const { generateDocumentation } = require('./generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.json' || ext === '.yaml' || ext === '.yml') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and YAML files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Generate documentation from JSON body
app.post('/api/generate', async (req, res) => {
  try {
    const spec = req.body;
    const parsed = await parseSpec(spec, 'json');
    const html = generateDocumentation(parsed);
    res.send(html);
  } catch (error) {
    console.error('Error generating documentation:', error);
    res.status(400).json({
      error: 'Failed to generate documentation',
      message: error.message
    });
  }
});

// Upload and generate documentation
app.post('/api/upload', upload.single('spec'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const format = ext === '.json' ? 'json' : 'yaml';

    const parsed = await parseSpec(fileContent, format);
    const html = generateDocumentation(parsed);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.send(html);
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(400).json({
      error: 'Failed to process file',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OpenAPI Documentation Generator running on http://localhost:${PORT}`);
  console.log(`📝 Upload your OpenAPI spec to generate documentation`);
});
