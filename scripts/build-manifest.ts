import fs from 'fs';
import path from 'path';

/**
 * Manifest builder for /public/photos
 * Reads image dimensions, orientation, and writes to public/photos/manifest.json
 */
export async function buildManifest() {
  const photosDir = path.resolve(process.cwd(), 'public/photos');
  const manifestPath = path.join(photosDir, 'manifest.json');

  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }

  const existingManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : { version: '1.0.0', photos: [] };

  fs.writeFileSync(manifestPath, JSON.stringify(existingManifest, null, 2));
  console.log('Manifest written to', manifestPath);
}

if (process.argv[1] && process.argv[1].endsWith('build-manifest.ts')) {
  buildManifest();
}
