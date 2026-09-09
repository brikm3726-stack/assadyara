/**
 * Envoi de la commande.
 *
 * Trois destinations possibles, cumulables :
 *   1. le hub e-commerce (ecom-hub) — la commande entre dans le dashboard,
 *      rattachée à son produit, sa landing et son client ;
 *   2. Web3Forms — une alerte e-mail immédiate ;
 *   3. n'importe quelle URL en POST JSON.
 *
 * Règle apprise sur le terrain : en Algérie le réseau mobile lâche souvent au
 * pire moment. On n'attend donc JAMAIS la réponse du serveur pour afficher la
 * confirmation — la commande est d'abord copiée dans le navigateur, puis
 * envoyée en arrière-plan, en « keepalive » pour survivre à la fermeture de
 * l'onglet.
 */
import type { ModeLivraison } from './livraison';
import {
  COMMANDE_ENDPOINT,
  HUB_LANDING_ID,
  HUB_PRODUITS,
  HUB_URL,
  PARFUMS,
  WEB3FORMS_KEY,
  type CleOffre,
  type CleParfum,
} from './config';

export type Commande = {
  reference: string;
  date: string;
  nom: string;
  telephone: string;
  wilaya: string;
  wilayaCode: string;
  commune: string;
  notes: string;
  offre: CleOffre;
  produit: string;
  conditionnement: string;
  parfum: CleParfum | null;
  /** Prix du produit seul. */
  prix: number;
  livraison: ModeLivraison;
  /** Frais de livraison NOEST pour la wilaya choisie. */
  frais: number;
  /** prix + frais — ce que l'acheteur paiera au livreur. */
  total: number;
};

const CLE_STOCKAGE = 'commandes-asad-yara';

/** Référence courte et lisible au téléphone : AY-4F2K9. */
export function genererReference(): string {
  const alphabet = 'ACDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffixe = '';
  const aleatoire = new Uint8Array(5);
  crypto.getRandomValues(aleatoire);
  for (const octet of aleatoire) suffixe += alphabet[octet % alphabet.length];
  return `AY-${suffixe}`;
}

/** Filet de sécurité local : rien n'est perdu même si le réseau coupe. */
function archiverLocalement(commande: Commande): void {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    const liste: Commande[] = brut ? JSON.parse(brut) : [];
    liste.push(commande);
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(liste.slice(-50)));
  } catch {
    /* navigation privée, quota plein… : sans conséquence pour l'acheteur */
  }
}

/** Paramètres de campagne présents dans l'URL (Facebook Ads). */
function parametresCampagne(): Record<string, string> | null {
  try {
    const params = new URLSearchParams(location.search);
    const gardes = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
    const trouves: Record<string, string> = {};
    for (const cle of gardes) {
      const valeur = params.get(cle);
      if (valeur) trouves[cle] = valeur.slice(0, 200);
    }
    return Object.keys(trouves).length > 0 ? trouves : null;
  } catch {
    return null;
  }
}

function enTexte(c: Commande): string {
  return [
    `الطلب : ${c.reference}`,
    `المنتج : ${c.produit} (${c.conditionnement})`,
    `السعر : ${c.prix} دج`,
    `التوصيل : ${c.frais} دج (${c.livraison === 'bureau' ? 'إلى المكتب' : 'إلى المنزل'})`,
    `المجموع : ${c.total} دج`,
    `الاسم : ${c.nom}`,
    `الهاتف : ${c.telephone}`,
    `الولاية : ${c.wilayaCode} — ${c.wilaya}`,
    `البلدية : ${c.commune}`,
    c.notes ? `ملاحظات : ${c.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/* -------------------------------------------------------------------------- */
/*  Destination 1 — le hub e-commerce                                          */
/* -------------------------------------------------------------------------- */

export type ReponseHub = { ok: boolean; reference?: string; total?: number; error?: string };

/**
 * Poste la commande sur POST /api/orders du hub.
 *
 * Deux points à ne pas modifier sans y regarder à deux fois :
 *  - la wilaya part sous son **code** (« 19 »), jamais sous son nom arabe : le
 *    hub compare les noms après avoir retiré tout ce qui n'est pas latin, et
 *    « سطيف » deviendrait une chaîne vide, donc « Wilaya inconnue » ;
 *  - chaque offre a son propre produit dans le dashboard, car le hub facture
 *    le prix du produit × la quantité et ignore le montant envoyé par la page.
 */
async function envoyerAuHub(commande: Commande): Promise<ReponseHub> {
  if (!HUB_URL || !HUB_LANDING_ID) return { ok: false, error: 'hub non configuré' };

  const produit = HUB_PRODUITS[commande.offre];
  const campagne = parametresCampagne();

  const reponse = await fetch(`${HUB_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      landingPageId: HUB_LANDING_ID,
      ...(produit ? { productId: produit } : {}),
      customer: {
        name: commande.nom,
        phone: commande.telephone,
        wilaya: commande.wilayaCode,
        wilayaCode: commande.wilayaCode,
        commune: commande.commune,
        address: commande.notes || commande.commune,
      },
      quantity: 1,
      variant: commande.parfum ? PARFUMS[commande.parfum].nom : null,
      delivery: commande.livraison,
      note: [commande.notes, `réf. page ${commande.reference}`].filter(Boolean).join(' — '),
      source: 'Landing أسد & يارا',
      // Indicatif : le hub recalcule tout à partir du produit et de sa grille.
      total: commande.total,
      ...(campagne ? { utm: campagne } : {}),
    }),
  });

  const resultat = (await reponse.json().catch(() => null)) as ReponseHub | null;
  if (!resultat) return { ok: false, error: `réponse illisible (${reponse.status})` };
  if (!resultat.ok) console.warn('[hub] commande refusée :', resultat.error);
  return resultat;
}

/* -------------------------------------------------------------------------- */
/*  Destination 2 — alerte e-mail Web3Forms                                    */
/* -------------------------------------------------------------------------- */

async function envoyerParEmail(commande: Commande): Promise<boolean> {
  if (!WEB3FORMS_KEY) return false;

  const reponse = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `طلب جديد ${commande.reference} — ${commande.produit}`,
      from_name: 'أسد & يارا',
      message: enTexte(commande),
      ...commande,
    }),
  });
  return reponse.ok;
}

/* -------------------------------------------------------------------------- */
/*  Destination 3 — endpoint JSON libre                                        */
/* -------------------------------------------------------------------------- */

async function envoyerAuEndpoint(commande: Commande): Promise<boolean> {
  if (!COMMANDE_ENDPOINT) return false;

  const reponse = await fetch(COMMANDE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify(commande),
  });
  return reponse.ok;
}

/* -------------------------------------------------------------------------- */

/**
 * Transmet la commande à toutes les destinations configurées, en parallèle.
 * Ne rejette jamais : l'appelant affiche la confirmation sans attendre, une
 * panne réseau ne doit pas casser l'expérience d'achat.
 */
export async function envoyerCommande(commande: Commande): Promise<boolean> {
  archiverLocalement(commande);

  const destinations = [
    envoyerAuHub(commande).then((r) => r.ok),
    envoyerParEmail(commande),
    envoyerAuEndpoint(commande),
  ];

  const resultats = await Promise.allSettled(destinations);
  const reussites = resultats.filter((r) => r.status === 'fulfilled' && r.value).length;

  if (reussites === 0) {
    const raisons = resultats
      .map((r) => (r.status === 'rejected' ? String(r.reason) : null))
      .filter(Boolean);
    if (raisons.length > 0) {
      console.warn('[Commande] aucune destination jointe, copie gardée en local.', raisons);
    } else if (!HUB_URL && !WEB3FORMS_KEY && !COMMANDE_ENDPOINT) {
      console.info('[Commande — mode démo] aucune destination configurée :', commande);
      return true;
    }
  }

  return reussites > 0;
}
