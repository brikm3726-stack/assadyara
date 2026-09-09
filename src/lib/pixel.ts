/**
 * Meta Pixel (Facebook) — branchement prêt à l'emploi.
 *
 * Aucun identifiant réel n'est écrit dans le code : on renseigne
 * VITE_PIXEL_ID dans le fichier .env, puis on rebuild. Tant que la variable
 * est vide, les événements sont simplement affichés dans la console, ce qui
 * permet de vérifier le parcours sans polluer les statistiques.
 *
 * Événements envoyés par la page :
 *   PageView          → au chargement
 *   ViewContent       → quand la photo produit entre à l'écran
 *   InitiateCheckout  → au clic sur « اطلب الآن » / à l'ouverture du formulaire
 *   Lead              → formulaire valide, commande envoyée
 *   Purchase          → commande confirmée (valeur + devise)
 */
import { PIXEL_ID } from './config';

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...a: unknown[]) => void };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export type EvenementPixel =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Purchase';

let pret = false;
const dejaEnvoyes = new Set<string>();

/** Injecte le script officiel Meta puis démarre le suivi. À appeler une fois. */
export function initPixel(): void {
  if (pret) return;
  pret = true;

  if (!PIXEL_ID) {
    if (import.meta.env.DEV) {
      console.info('[Pixel] Mode démo : renseignez VITE_PIXEL_ID dans .env pour activer le suivi.');
    }
    suivre('PageView');
    return;
  }

  /* Extrait officiel Meta, réécrit proprement. */
  const f = window;
  if (!f.fbq) {
    const n: Fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue?.push(args);
    } as Fbq;
    n.queue = [];
    f.fbq = n;
    f._fbq = n;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq?.('init', PIXEL_ID);
  suivre('PageView');
}

/** Envoie un événement standard. */
export function suivre(evenement: EvenementPixel, parametres?: Record<string, unknown>): void {
  if (!PIXEL_ID) {
    if (import.meta.env.DEV) console.info('[Pixel démo]', evenement, parametres ?? '');
    return;
  }
  window.fbq?.('track', evenement, parametres);
}

/** Même chose, mais une seule fois par visite (ViewContent, InitiateCheckout…). */
export function suivreUneFois(
  evenement: EvenementPixel,
  parametres?: Record<string, unknown>,
): void {
  if (dejaEnvoyes.has(evenement)) return;
  dejaEnvoyes.add(evenement);
  suivre(evenement, parametres);
}
