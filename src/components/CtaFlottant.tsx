import { useEffect, useState } from 'react';
import { DEVISE, OFFRES, type CleOffre } from '../lib/config';
import { IconePanier } from './Icones';

type Props = { offre: CleOffre; actif: boolean; auClic: () => void };

/**
 * Bouton d'achat collant en bas d'écran.
 * Il apparaît dès que la photo est dépassée et s'efface quand le formulaire
 * est à l'écran, pour ne jamais recouvrir le bouton « تأكيد الطلب ».
 */
export function CtaFlottant({ offre, actif, auClic }: Props) {
  const [depasseHero, setDepasseHero] = useState(false);
  const [formulaireVisible, setFormulaireVisible] = useState(false);

  useEffect(() => {
    let enAttente = false;
    const auDefilement = () => {
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(() => {
        setDepasseHero(window.scrollY > 260);
        enAttente = false;
      });
    };
    auDefilement();
    window.addEventListener('scroll', auDefilement, { passive: true });
    return () => window.removeEventListener('scroll', auDefilement);
  }, []);

  useEffect(() => {
    const formulaire = document.getElementById('commander');
    if (!formulaire || typeof IntersectionObserver === 'undefined') return;
    const observateur = new IntersectionObserver(
      ([entree]) => setFormulaireVisible(entree.isIntersecting),
      { threshold: 0.06 },
    );
    observateur.observe(formulaire);
    return () => observateur.disconnect();
  }, []);

  const visible = actif && depasseHero && !formulaireVisible;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(115%)',
        opacity: visible ? 1 : 0,
        transition: 'transform .4s var(--ease-douce), opacity .3s ease',
        pointerEvents: visible ? 'auto' : 'none',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'linear-gradient(180deg, rgba(253,246,241,0), rgba(253,246,241,.96) 38%)',
      }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <div className="shrink-0 text-start">
          <p className="text-[0.72rem] font-semibold text-encre-2">السعر</p>
          <p className="text-[1.15rem] leading-none font-extrabold text-rose-fonce">
            {OFFRES[offre].prix} {DEVISE}
          </p>
          <p className="text-[0.68rem] text-encre-3">+ التوصيل</p>
        </div>
        <a
          href="#commander"
          onClick={auClic}
          tabIndex={visible ? 0 : -1}
          className="btn btn-principal flex-1"
          style={{ padding: '0.95rem 1.5rem', fontSize: '1.05rem' }}
        >
          <IconePanier taille={20} />
          اطلب الآن
        </a>
      </div>
    </div>
  );
}
