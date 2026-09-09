/**
 * Recopie la grille de livraison du hub dans le projet.
 *
 *   npm run tarifs
 *
 * Pourquoi une copie alors que la page interroge déjà le hub au chargement :
 * la copie s'affiche instantanément, sans attendre le réseau ni faire sauter
 * la mise en page. Le hub, lui, reste la source de vérité — la page rafraîchit
 * la grille en arrière-plan et corrige les chiffres si le tarif a changé.
 *
 * Les valeurs viennent de Dashboard → Réglages, elles-mêmes synchronisées
 * depuis l'API NOEST (`npm run noest` côté hub).
 */
import fs from 'node:fs/promises';

const env = await lireEnv('.env');
const HUB = (env.VITE_HUB_URL ?? '').replace(/\/$/, '');
const LANDING = env.VITE_HUB_LANDING_ID ?? '';

if (!HUB || !LANDING) {
  console.error('Renseignez VITE_HUB_URL et VITE_HUB_LANDING_ID dans .env.');
  process.exit(1);
}

const url = `${HUB}/api/landing/${encodeURIComponent(LANDING)}`;
console.log(`Lecture de ${url}`);

const reponse = await fetch(url);
const config = await reponse.json();

if (!config.ok) {
  console.error(`Le hub a répondu : ${config.error}`);
  process.exit(1);
}

const grille = config.shipping ?? {};
const codes = Object.keys(grille).sort();

if (codes.length !== 58) {
  console.warn(`Attention : ${codes.length} wilayas reçues au lieu de 58.`);
}

const lignes = codes.map((code) => {
  const t = grille[code];
  return `  '${code}': { domicile: ${t.domicile}, bureau: ${t.stopdesk}, desservie: ${Boolean(t.covered)} },`;
});

const nonDesservies = codes.filter((c) => !grille[c].covered);

const fichier = `/**
 * Grille de livraison NOEST, par wilaya, en dinars.
 * Générée par « npm run tarifs » depuis ${HUB} — ne pas éditer à la main :
 * les tarifs se changent dans Dashboard → Réglages, puis on relance le script.
 *
 * Relevé du ${new Date().toLocaleDateString('fr-FR')}.
 * Wilayas non desservies par NOEST : ${nonDesservies.join(', ') || 'aucune'}.
 */
export type TarifLivraison = { domicile: number; bureau: number; desservie: boolean };

export const TARIFS_LIVRAISON: Record<string, TarifLivraison> = {
${lignes.join('\n')}
};
`;

await fs.writeFile('src/data/tarifs-livraison.ts', fichier, 'utf8');

const domicile = codes.map((c) => grille[c].domicile);
console.log(`  ${codes.length} wilayas écrites dans src/data/tarifs-livraison.ts`);
console.log(`  domicile de ${Math.min(...domicile)} à ${Math.max(...domicile)} DA`);
console.log(`  non desservies : ${nonDesservies.join(', ') || 'aucune'}`);

/** Lecture minimale d'un fichier .env — pas de dépendance pour trois lignes. */
async function lireEnv(chemin) {
  try {
    const brut = await fs.readFile(chemin, 'utf8');
    const valeurs = {};
    for (const ligne of brut.split(/\r?\n/)) {
      const trouve = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (trouve) valeurs[trouve[1]] = trouve[2].replace(/^["']|["']$/g, '').trim();
    }
    return valeurs;
  } catch {
    return {};
  }
}
