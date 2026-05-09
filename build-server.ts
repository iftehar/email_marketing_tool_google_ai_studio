import { execSync } from 'child_process';
import fs from 'fs';

// Simple build script to ensure server side types are handled if needed, 
// though here we are mostly using standard tsx.
console.log('Building server...');
try {
  // If we needed a full build, we'd use esbuild or similar.
  // For now, we'll just ensure the dist directory exists.
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
} catch (e) {
  console.error('Server build failed', e);
  process.exit(1);
}
