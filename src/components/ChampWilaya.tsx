import { useEffect, useMemo, useRef, useState } from 'react';
import { WILAYAS, normaliserArabe } from '../data/wilayas';
import { IconeChevron, IconeCoche, IconeEpingle, IconeLoupe } from './Icones';

type Props = {
  id?: string;
  valeur: string;
  auChoix: (nom: string) => void;
  erreur?: string;
  idErreur?: string;
};

/**
 * Sélecteur de wilaya avec recherche.
 * Les 58 wilayas y sont, cherchables en arabe (« الجزاير » trouve « الجزائر »)
 * comme en latin (« oran », « setif »), avec de grandes zones tactiles.
 */
export function ChampWilaya({ id, valeur, auChoix, erreur, idErreur }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [actif, setActif] = useState(0);

  const conteneur = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const champRecherche = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLUListElement>(null);

  const resultats = useMemo(() => {
    const q = normaliserArabe(recherche);
    if (!q) return WILAYAS;
    return WILAYAS.filter(
      (w) =>
        normaliserArabe(w.nom).includes(q) ||
        normaliserArabe(w.latin).includes(q) ||
        w.code.includes(q),
    );
  }, [recherche]);

  const selection = WILAYAS.find((w) => w.nom === valeur);

  /* Fermeture au clic extérieur. */
  useEffect(() => {
    if (!ouvert) return;
    const auClic = (evenement: PointerEvent) => {
      if (!conteneur.current?.contains(evenement.target as Node)) setOuvert(false);
    };
    document.addEventListener('pointerdown', auClic);
    return () => document.removeEventListener('pointerdown', auClic);
  }, [ouvert]);

  /* À l'ouverture : focus sur la recherche et champ amené au centre de l'écran. */
  useEffect(() => {
    if (!ouvert) return;
    setActif(0);
    champRecherche.current?.focus({ preventScroll: true });
    conteneur.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [ouvert]);

  /* L'option survolée au clavier reste toujours visible. */
  useEffect(() => {
    if (!ouvert) return;
    liste.current?.children[actif]?.scrollIntoView({ block: 'nearest' });
  }, [actif, ouvert]);

  const valider = (nom: string) => {
    auChoix(nom);
    setOuvert(false);
    setRecherche('');
    bouton.current?.focus();
  };

  const auClavier = (evenement: React.KeyboardEvent) => {
    if (evenement.key === 'ArrowDown') {
      evenement.preventDefault();
      setActif((i) => Math.min(i + 1, resultats.length - 1));
    } else if (evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      setActif((i) => Math.max(i - 1, 0));
    } else if (evenement.key === 'Enter') {
      evenement.preventDefault();
      const choix = resultats[actif];
      if (choix) valider(choix.nom);
    } else if (evenement.key === 'Escape') {
      evenement.preventDefault();
      setOuvert(false);
      bouton.current?.focus();
    }
  };

  return (
    <div ref={conteneur} className="relative">
      <button
        ref={bouton}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={ouvert}
        aria-haspopup="listbox"
        aria-controls="liste-wilayas"
        aria-invalid={Boolean(erreur)}
        aria-describedby={erreur ? idErreur : undefined}
        onClick={() => setOuvert((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !ouvert) {
            e.preventDefault();
            setOuvert(true);
          }
        }}
        className={`champ flex items-center justify-between text-start ${erreur ? 'champ-erreur' : ''}`}
        style={{ paddingInlineEnd: '3rem' }}
      >
        <span className={selection ? 'font-semibold text-encre' : 'text-encre-3'}>
          {selection ? `${selection.code} — ${selection.nom}` : 'اختر ولايتك'}
        </span>
        <IconeEpingle taille={19} className="icone-champ" />
      </button>

      <IconeChevron
        taille={18}
        className="pointer-events-none absolute top-1/2 end-4 -translate-y-1/2 text-encre-3"
      />

      {ouvert && (
        <div
          className="carte absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden p-2"
          style={{
            animation: 'deplier .22s var(--ease-douce) both',
            background: '#fff',
            boxShadow: '0 26px 60px -22px rgba(103,62,47,.45)',
          }}
        >
          <div className="relative">
            <input
              ref={champRecherche}
              type="search"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setActif(0);
              }}
              onKeyDown={auClavier}
              placeholder="ابحث عن ولايتك…"
              aria-label="ابحث عن ولايتك"
              aria-activedescendant={resultats[actif] ? `wilaya-${resultats[actif].code}` : undefined}
              className="champ text-[0.98rem]"
              style={{ minHeight: '3rem', borderRadius: '0.85rem' }}
              autoComplete="off"
            />
            <IconeLoupe taille={18} className="icone-champ" />
          </div>

          <ul
            ref={liste}
            id="liste-wilayas"
            role="listbox"
            aria-label="قائمة الولايات"
            className="mt-2 max-h-[min(46vh,20rem)] overflow-y-auto overscroll-contain"
          >
            {resultats.map((wilaya, index) => {
              const choisie = wilaya.nom === valeur;
              return (
                <li key={wilaya.code}>
                  <button
                    type="button"
                    id={`wilaya-${wilaya.code}`}
                    role="option"
                    aria-selected={choisie}
                    onClick={() => valider(wilaya.nom)}
                    onMouseEnter={() => setActif(index)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors duration-150"
                    style={{
                      background: choisie
                        ? 'var(--color-rose-pale)'
                        : index === actif
                          ? 'var(--color-creme-2)'
                          : 'transparent',
                    }}
                  >
                    <span
                      className="w-8 shrink-0 text-[0.78rem] font-bold tabular-nums text-or-fonce"
                      aria-hidden
                    >
                      {wilaya.code}
                    </span>
                    <span className="flex-1 font-semibold text-encre">{wilaya.nom}</span>
                    {choisie && <IconeCoche taille={16} className="text-rose" />}
                  </button>
                </li>
              );
            })}

            {resultats.length === 0 && (
              <li className="px-3 py-6 text-center text-encre-2">لا توجد نتيجة مطابقة</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
