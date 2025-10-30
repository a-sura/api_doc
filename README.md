# OpenAPI Documentation Generator

A beautiful, responsive documentation generator for OpenAPI/Swagger specifications. Supports both JSON and YAML formats with live preview capabilities.

## Features

- 📝 Supports OpenAPI 3.0+ and Swagger 2.0
- 🎨 Beautiful, responsive UI with syntax highlighting
- 📊 Interactive endpoint explorer
- 🔍 Search functionality
- 📱 Mobile-friendly design
- ⚡ Fast and lightweight
- 🎯 Try It Out feature for testing endpoints

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

Runs with nodemon for auto-restart on file changes.

### Generate Documentation

1. **Via Web Interface**: 
   - Navigate to `http://localhost:3000`
   - Upload your OpenAPI spec file (JSON or YAML)
   - View the generated documentation instantly

2. **Via API**:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d @your-openapi-spec.json
```

3. **Via Command Line**:
```bash
node cli.js path/to/your-spec.yaml
```

## Project Structure

```
openapi-doc-generator/
├── src/
│   ├── server.js          # Express server
│   ├── parser.js          # OpenAPI spec parser
│   ├── generator.js       # HTML documentation generator
│   └── templates/
│       └── doc-template.html  # Documentation template
├── public/
│   ├── css/
│   │   └── styles.css     # Styling
│   └── js/
│       └── app.js         # Frontend JavaScript
├── uploads/               # Temporary file uploads
├── cli.js                 # Command-line interface
├── package.json
└── README.md
```

## API Endpoints

### `GET /`
Home page with upload interface

### `POST /api/generate`
Generate documentation from OpenAPI spec
- **Body**: JSON OpenAPI specification
- **Response**: HTML documentation

### `POST /api/upload`
Upload and generate documentation from file
- **Form Data**: `spec` (file)
- **Response**: HTML documentation

## Example OpenAPI Spec

```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: A sample API for demonstration
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Successful response
```

## Configuration

Edit `src/server.js` to configure:
- Port number (default: 3000)
- Upload limits (default: 10MB)
- CORS settings

## Dependencies

- **express**: Web framework
- **js-yaml**: YAML parser
- **multer**: File upload handling
- **marked**: Markdown rendering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Export to PDF
- [ ] Multiple theme support
- [ ] Authentication examples
- [ ] Code generation for different languages
- [ ] Postman collection export
- [ ] Docker support

## Author

Created with ❤️ for the API documentation community
