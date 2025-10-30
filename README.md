# OpenAPI Documentation Generator

A beautiful, serverless documentation generator for OpenAPI/Swagger specifications. Supports both JSON and YAML formats with live preview capabilities.

## Features

- 📝 Supports OpenAPI 3.0+ and Swagger 2.0
- 🎨 Beautiful, responsive UI with syntax highlighting
- 📊 Interactive endpoint explorer
- 🔍 Search functionality
- 📱 Mobile-friendly design
- ⚡ Fast and lightweight
- ☁️ Serverless deployment ready (Vercel, Netlify, AWS Lambda)
- 🎯 Client-side processing (no server required)

## Quick Start

### Option 1: Use Client-Side Version (No Server)

Simply open `public/index.html` in your browser - it works completely offline!

### Option 2: Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Option 3: Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Option 4: Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
openapi-doc-generator/
├── api/
│   └── generate.js        # Serverless function for Vercel/Netlify
├── public/
│   └── index.html         # Standalone client-side app
├── src/
│   ├── parser.js          # OpenAPI spec parser
│   └── generator.js       # HTML documentation generator
├── examples/
│   └── petstore-api.yaml  # Sample OpenAPI spec
├── vercel.json            # Vercel configuration
├── netlify.toml           # Netlify configuration
├── package.json
└── README.md
```

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

Or use CLI:
```bash
vercel --prod
```

### Netlify

1. Push to GitHub
2. Connect to Netlify
3. Deploy automatically

Or use CLI:
```bash
netlify deploy --prod
```

### AWS Lambda

Use the serverless function in `api/generate.js` with API Gateway.

## Client-Side Usage

The application works entirely in the browser without a backend:

1. Open `public/index.html`
2. Upload or paste your OpenAPI specification
3. Documentation is generated instantly in your browser

## API Endpoint (Optional)

If deployed as serverless function:

```bash
POST /api/generate
Content-Type: application/json

{
  "openapi": "3.0.0",
  "info": {...},
  "paths": {...}
}
```

## Example OpenAPI Spec

```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Successful response
```

## Configuration

### Vercel
Edit `vercel.json` for custom domains and settings.

### Netlify
Edit `netlify.toml` for build settings and redirects.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Dependencies

Minimal dependencies for fast cold starts:
- **js-yaml**: YAML parser (browser-compatible)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Serverless Function Crashes
- Check function timeout limits (increase if needed)
- Verify file size limits (max 10MB for most providers)
- Check memory allocation

### CORS Issues
- Vercel/Netlify handle CORS automatically
- For custom deployments, ensure CORS headers are set

## Roadmap

- [x] Client-side processing
- [x] Serverless deployment
- [ ] Export to PDF
- [ ] Multiple theme support
- [ ] Code generation for different languages
- [ ] Postman collection export

## Author

Created with ❤️ for the API documentation community
