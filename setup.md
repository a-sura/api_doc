# Setup Guide

## Quick Start (No Installation Required)

The easiest way to use this tool is to simply open `public/index.html` in your browser. It works completely offline with no server required!

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Production deployment:**
```bash
vercel --prod
```

Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy to Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Deploy:**
```bash
netlify deploy
```

4. **Production deployment:**
```bash
netlify deploy --prod
```

### Option 3: GitHub Pages

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/openapi-doc-generator.git
git push -u origin main
```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: `main` branch, `/public` folder
   - Save

Your site will be at: `https://yourusername.github.io/openapi-doc-generator/`

### Option 4: Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
```
http://localhost:3000
```

## File Structure

```
openapi-doc-generator/
├── api/
│   └── generate.js        # Serverless function (optional)
├── public/
│   └── index.html         # Main app (works standalone)
├── examples/
│   └── petstore-api.yaml  # Sample spec
├── vercel.json            # Vercel config
├── netlify.toml           # Netlify config
└── package.json
```

## Environment Variables

No environment variables required! The app works completely client-side.

## Troubleshooting

### Issue: Serverless function timeout

**Solution:** The client-side version in `public/index.html` doesn't have this limitation. Use it instead.

### Issue: File too large

**Solution:** The client-side app processes files in the browser with no size limit (within browser memory constraints).

### Issue: CORS errors

**Solution:** 
- Use the standalone `public/index.html` file
- Or deploy to Vercel/Netlify which handle CORS automatically

### Issue: YAML not parsing

**Solution:** Make sure the YAML library is loaded from CDN (it's already included in the HTML).

## Performance Tips

1. **Use client-side version** for fastest performance
2. **Large specs**: The browser handles them efficiently
3. **Multiple users**: Deploy to Vercel/Netlify for free CDN and edge functions

## Updates

To update your deployment:

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**GitHub Pages:**
```bash
git add .
git commit -m "Update"
git push
```

## Support

For issues:
1. Check browser console for errors
2. Verify OpenAPI spec is valid
3. Try the example spec first
4. Open an issue on GitHub
