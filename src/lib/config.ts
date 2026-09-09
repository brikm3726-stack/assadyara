/**
 * Point de réglage unique de la landing page.
 * Tout ce que le client peut vouloir changer (prix, textes de l'offre,
 * destination des commandes, Pixel) se trouve ici ou dans le fichier .env.
 */

export type CleOffre = 'pack' | 'unite';
export type CleParfum = 'asad' | 'yara';

export const PARFUMS: Record<CleParfum, { nom: string; couleur: string; note: string }> = {
  asad: { nom: 'أسد', couleur: '#0d0908', note: 'توابل · خشب · عنبر' },
  yara: { nom: 'يارا', couleur: '#e794a6', note: 'فواكه · زهور · فانيليا' },
};

export const OFFRES: Record<
  CleOffre,
  { titre: string; sousTitre: string; prix: number; prixBarre?: number; badge?: string }
> = {
  pack: {
    titre: 'اشتري العلبتين',
    sousTitre: 'أسد + يارا',
    prix: 3700,
    prixBarre: 4400,
    badge: 'الأكثر طلباً',
  },
  unite: {
    titre: 'اشتري العلبة',
    sousTitre: 'أسد أو يارا',
    prix: 2200,
  },
};

export const DEVISE = 'دج';

/** Formate un prix en chiffres occidentaux, sans séparateur (lisible en RTL). */
export function formaterPrix(montant: number): string {
  return `${montant} ${DEVISE}`;
}

/** Nom du produit tel qu'il apparaît dans le résumé et dans la commande. */
export function libelleProduit(offre: CleOffre, parfum: CleParfum | null): string {
  if (offre === 'pack') return `${PARFUMS.asad.nom} + ${PARFUMS.yara.nom}`;
  return parfum ? PARFUMS[parfum].nom : '—';
}

/** Conditionnement envoyé au vendeur : « 2 parfums » ou « عطر واحد ». */
export function conditionnement(offre: CleOffre): string {
  return offre === 'pack' ? '2 parfums' : '1 parfum';
}

/**
 * Où partent les commandes.
 * - VITE_WEB3FORMS_KEY : clé Web3Forms (fiable depuis l'Algérie) → e-mail.
 * - VITE_COMMANDE_ENDPOINT : n'importe quelle URL qui accepte un POST JSON
 *   (Google Apps Script, Supabase, n8n, Make…).
 * Si les deux sont vides, la page reste 100 % fonctionnelle : la commande est
 * enregistrée dans le navigateur et affichée dans la console (mode démo).
 */
export const WEB3FORMS_KEY = (import.meta.env.VITE_WEB3FORMS_KEY ?? '').trim();
export const COMMANDE_ENDPOINT = (import.meta.env.VITE_COMMANDE_ENDPOINT ?? '').trim();

/**
 * Hub e-commerce (ecom-hub) — destination principale des commandes.
 * Le hub relit le produit en base et recalcule les montants : le prix envoyé
 * par la page est ignoré, c'est voulu. Chaque offre a donc son propre produit
 * dans le dashboard, sinon 2200 × 2 remplacerait le tarif du pack à 3700.
 */
export const HUB_URL = (import.meta.env.VITE_HUB_URL ?? '').trim().replace(/\/$/, '');
export const HUB_LANDING_ID = (import.meta.env.VITE_HUB_LANDING_ID ?? '').trim();
export const HUB_PRODUITS: Record<CleOffre, string> = {
  pack: (import.meta.env.VITE_HUB_PRODUIT_PACK ?? '').trim(),
  unite: (import.meta.env.VITE_HUB_PRODUIT_UNITE ?? '').trim(),
};

/** Identifiant Meta Pixel — à remplir dans .env, jamais en dur dans le code. */
export const PIXEL_ID = (import.meta.env.VITE_PIXEL_ID ?? '').trim();

export const MARQUE = {
  nom: 'أسد & يارا',
  nomLatin: 'ASAD & YARA',
  telephone: '',
};
