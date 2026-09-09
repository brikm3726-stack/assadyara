import { useEffect, useState } from 'react';
import { TARIFS_LIVRAISON, type TarifLivraison } from '../data/tarifs-livraison';
import { HUB_LANDING_ID, HUB_URL } from './config';

export type ModeLivraison = 'domicile' | 'bureau';

export const MODES_LIVRAISON: {
  cle: ModeLivraison;
  nom: string;
  detail: string;
}[] = [
  { cle: 'domicile', nom: 'إلى المنزل', detail: 'يصل إلى عنوانك' },
  { cle: 'bureau', nom: 'إلى المكتب', detail: 'أرخص — تستلمه بنفسك' },
];

export type Grille = Record<string, TarifLivraison>;

/** Frais pour une wilaya et un mode. `null` tant qu'aucune wilaya n'est choisie. */
export function fraisLivraison(
  grille: Grille,
  codeWilaya: string,
  mode: ModeLivraison,
): number | null {
  if (!codeWilaya) return null;
  const tarif = grille[codeWilaya];
  if (!tarif) return null;
  return mode === 'bureau' ? tarif.bureau : tarif.domicile;
}

/** NOEST ne dessert pas toutes les wilayas (50 et 54 au dernier relevé). */
export function estDesservie(grille: Grille, codeWilaya: string): boolean {
  if (!codeWilaya) return true;
  return grille[codeWilaya]?.desservie !== false;
}

type TarifDuHub = { domicile: number; stopdesk: number; covered: boolean };

/**
 * La grille embarquée s'affiche immédiatement — aucun chiffre qui apparaît
 * après coup, aucune mise en page qui saute. Puis on demande au hub la
 * version du jour : s'il répond, les tarifs se corrigent tout seuls, sans
 * redéploiement. S'il ne répond pas, la copie locale fait très bien l'affaire.
 */
export function useTarifsLivraison(): Grille {
  const [grille, setGrille] = useState<Grille>(TARIFS_LIVRAISON);

  useEffect(() => {
    if (!HUB_URL || !HUB_LANDING_ID) return;

    const controleur = new AbortController();

    fetch(`${HUB_URL}/api/landing/${encodeURIComponent(HUB_LANDING_ID)}`, {
      signal: controleur.signal,
    })
      .then((reponse) => reponse.json())
      .then((config: { ok?: boolean; shipping?: Record<string, TarifDuHub> }) => {
        if (!config?.ok || !config.shipping) return;

        const fraiche: Grille = {};
        for (const [code, tarif] of Object.entries(config.shipping)) {
          if (typeof tarif?.domicile !== 'number') continue;
          fraiche[code] = {
            domicile: tarif.domicile,
            bureau: tarif.stopdesk,
            desservie: Boolean(tarif.covered),
          };
        }
        if (Object.keys(fraiche).length > 0) setGrille(fraiche);
      })
      .catch(() => {
        /* hors ligne, hub en panne : la grille embarquée suffit */
      });

    return () => controleur.abort();
  }, []);

  return grille;
}
