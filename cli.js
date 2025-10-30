#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseSpec } = require('./src/parser');
const { generateDocumentation } = require('./src/generator');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node cli.js <path-to-openapi-spec> [output-file]');
    console.log('');
    console.log('Examples:');
    console.log('  node cli.js api-spec.yaml');
    console.log('  node cli.js api-spec.json output.html');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || 'api-documentation.html';

  try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Error: File not found: ${inputFile}`);
      process.exit(1);
    }

    console.log(`📖 Reading specification from: ${inputFile}`);
    const content = fs.readFileSync(inputFile, 'utf8');
    
    // Determine format from file extension
    const ext = path.extname(inputFile).toLowerCase();
    const format = ext === '.json' ? 'json' : 'yaml';

    console.log(`🔍 Parsing ${format.toUpperCase()} specification...`);
    const parsed = await parseSpec(content, format);

    console.log(`✨ Generating documentation...`);
    const html = generateDocumentation(parsed);

    console.log(`💾 Writing output to: ${outputFile}`);
    fs.writeFileSync(outputFile, html);

    console.log(`✅ Documentation generated successfully!`);
    console.log(`🌐 Open ${outputFile} in your browser to view the documentation`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
