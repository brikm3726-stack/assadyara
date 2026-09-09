/**
 * Envoi de la commande.
 *
 * Règle apprise sur le terrain : en Algérie le réseau mobile lâche souvent au
 * pire moment. On n'attend donc JAMAIS la réponse du serveur pour afficher la
 * confirmation — la commande est d'abord copiée dans le navigateur, puis
 * envoyée en arrière-plan. Le client voit son message de succès instantanément.
 */
import { COMMANDE_ENDPOINT, WEB3FORMS_KEY, type CleOffre, type CleParfum } from './config';

export type Commande = {
  reference: string;
  date: string;
  nom: string;
  telephone: string;
  wilaya: string;
  commune: string;
  notes: string;
  offre: CleOffre;
  produit: string;
  conditionnement: string;
  parfum: CleParfum | null;
  prix: number;
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

function enTexte(c: Commande): string {
  return [
    `الطلب : ${c.reference}`,
    `المنتج : ${c.produit} (${c.conditionnement})`,
    `السعر : ${c.prix} دج`,
    `الاسم : ${c.nom}`,
    `الهاتف : ${c.telephone}`,
    `الولاية : ${c.wilaya}`,
    `البلدية : ${c.commune}`,
    c.notes ? `ملاحظات : ${c.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Transmet la commande. Ne rejette jamais : l'appelant a déjà affiché la
 * confirmation, une erreur réseau ne doit pas casser l'expérience.
 */
export async function envoyerCommande(commande: Commande): Promise<boolean> {
  archiverLocalement(commande);

  try {
    if (WEB3FORMS_KEY) {
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

    if (COMMANDE_ENDPOINT) {
      const reponse = await fetch(COMMANDE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify(commande),
      });
      return reponse.ok;
    }

    console.info('[Commande — mode démo] aucune destination configurée :', commande);
    return true;
  } catch (erreur) {
    console.warn('[Commande] envoi impossible, copie gardée en local.', erreur);
    return false;
  }
}
