import fs from 'fs';
import path from 'path';

// Load OpenAPI spec from file
const specPath = path.join(process.cwd(), 'openapi.yaml');
const specContent = fs.readFileSync(specPath, 'utf8');

export async function GET() {
  return new Response(specContent, {
    headers: { 'content-type': 'application/json' }
  });
}