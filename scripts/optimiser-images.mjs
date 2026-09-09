/**
 * Optimise la photo produit fournie par le client.
 * Source : scripts/source-produit.jpg  (941 x 1672, ratio 9:16)
 * Sortie : public/img/*.webp + repli .jpg + placeholder flou inline.
 *
 *   npm run images
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';

const SOURCE = 'scripts/source-produit.jpg';
const DEST = 'public/img';
const LARGEURS = [380, 560, 750, 941];

await fs.mkdir(DEST, { recursive: true });

const src = sharp(SOURCE);
const { width, height } = await src.metadata();
console.log(`Source : ${width} x ${height}`);

// --- Variantes WebP (image entière, jamais recadrée) ---
for (const w of LARGEURS) {
  const fichier = `${DEST}/produit-${w}.webp`;
  await sharp(SOURCE)
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(fichier);
  const { size } = await fs.stat(fichier);
  console.log(`  ${fichier.padEnd(28)} ${(size / 1024).toFixed(1)} Ko`);
}

// --- Repli JPEG (navigateurs sans WebP) ---
await sharp(SOURCE)
  .resize({ width: 750, withoutEnlargement: true })
  .jpeg({ quality: 80, mozjpeg: true, progressive: true })
  .toFile(`${DEST}/produit.jpg`);

// --- Image de partage Facebook / WhatsApp (1200 x 630) ---
await sharp(SOURCE)
  .extract({ left: 0, top: Math.round(height * 0.28), width, height: Math.round(height * 0.46) })
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(`${DEST}/partage.jpg`);

// --- Favicon (flacon rose détouré grossièrement au centre) ---
await sharp(SOURCE)
  .extract({
    left: Math.round(width * 0.6),
    top: Math.round(height * 0.38),
    width: Math.round(width * 0.3),
    height: Math.round(width * 0.3),
  })
  .resize(180, 180)
  .png()
  .toFile('public/icone.png');

// --- Placeholder flou inline (évite tout flash blanc au chargement) ---
const flou = await sharp(SOURCE)
  .resize({ width: 20 })
  .blur(1.2)
  .webp({ quality: 40 })
  .toBuffer();
const dataUri = `data:image/webp;base64,${flou.toString('base64')}`;
await fs.writeFile(
  'src/lib/placeholder.ts',
  `// Généré par « npm run images » — ne pas éditer à la main.\n` +
    `export const PLACEHOLDER_PRODUIT =\n  '${dataUri}';\n`,
);
console.log(`  placeholder inline           ${(dataUri.length / 1024).toFixed(1)} Ko`);
console.log('Terminé.');
