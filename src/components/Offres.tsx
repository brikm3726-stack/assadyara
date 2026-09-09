import { OFFRES, PARFUMS, type CleOffre, type CleParfum } from '../lib/config';
import { useRevele } from '../lib/useRevele';
import { IconeCoche, IconeGoutte } from './Icones';

type Props = {
  offre: CleOffre;
  choisirOffre: (offre: CleOffre) => void;
  parfum: CleParfum | null;
  choisirParfum: (parfum: CleParfum) => void;
  parfumManquant: boolean;
};

const economie = OFFRES.unite.prix * 2 - OFFRES.pack.prix;

/**
 * Section 2 — le choix de l'offre.
 * Vrais boutons radio masqués sous des étiquettes : clavier, lecteur d'écran
 * et navigateur font le travail, on ne réinvente rien.
 */
export function Offres({ offre, choisirOffre, parfum, choisirParfum, parfumManquant }: Props) {
  const ref = useRevele<HTMLElement>();

  return (
    <section ref={ref} id="offres" className="revele enveloppe py-12 sm:py-16">
      <div className="text-center">
        <p className="surtitre">العرض</p>
        <h2 className="mt-3 text-[clamp(1.6rem,6.5vw,2.4rem)] font-extrabold text-encre">
          اختاري عرضك
        </h2>
        <p className="mx-auto mt-2 max-w-[34rem] text-encre-2">
          نفس الجودة، نفس الفخامة — الفرق فقط في عدد العلب.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="اختيار العرض"
        className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5"
      >
        <CarteOffre
          cle="pack"
          coche={offre === 'pack'}
          auChoix={choisirOffre}
          details={['عطر أسد الرجالي', 'عطر يارا النسائي', `وفّري ${economie} دج`]}
        />
        <CarteOffre
          cle="unite"
          coche={offre === 'unite'}
          auChoix={choisirOffre}
          details={['عطر واحد حسب اختيارك', 'نفس الحجم ونفس الجودة', 'مثالي كهدية']}
        />
      </div>

      {/* Choix du parfum : n'apparaît que pour l'offre à l'unité. */}
      {offre === 'unite' && (
        <div
          id="choix-parfum"
          className="mx-auto mt-6 max-w-4xl"
          style={{ animation: 'deplier .45s var(--ease-douce) both' }}
        >
          <div
            className={`carte p-5 sm:p-6 ${parfumManquant ? 'ring-2 ring-rose/45' : ''}`}
            style={parfumManquant ? { borderColor: '#d8496b' } : undefined}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-encre">
                <IconeGoutte taille={19} className="text-rose" />
                اختاري عطرك
              </h3>
              <span className="text-sm font-semibold text-encre-2">إجباري</span>
            </div>

            <div
              role="radiogroup"
              aria-label="اختيار العطر"
              aria-required
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {(Object.keys(PARFUMS) as CleParfum[]).map((cle) => (
                <BoutonParfum
                  key={cle}
                  cle={cle}
                  coche={parfum === cle}
                  auChoix={choisirParfum}
                />
              ))}
            </div>

            {parfumManquant && (
              <p className="message-erreur" role="alert">
                الرجاء اختيار العطر : أسد أو يارا.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function CarteOffre({
  cle,
  coche,
  auChoix,
  details,
}: {
  cle: CleOffre;
  coche: boolean;
  auChoix: (offre: CleOffre) => void;
  details: string[];
}) {
  const offre = OFFRES[cle];

  return (
    <label
      className="group relative block cursor-pointer"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <input
        type="radio"
        name="offre"
        value={cle}
        checked={coche}
        onChange={() => auChoix(cle)}
        className="sr-only"
      />

      <div
        className="relative h-full overflow-hidden rounded-3xl border p-5 pt-7 text-center transition-all duration-300 sm:p-6 sm:pt-8"
        style={{
          borderColor: coche ? 'var(--color-rose)' : 'color-mix(in srgb, var(--color-or) 34%, transparent)',
          background: coche
            ? 'linear-gradient(165deg, #fff 0%, #fdeef3 100%)'
            : 'color-mix(in srgb, var(--color-blanc) 78%, transparent)',
          boxShadow: coche
            ? '0 22px 46px -26px rgba(212,39,102,.55), inset 0 0 0 1px rgba(255,255,255,.7)'
            : 'var(--shadow-doux)',
          transform: coche ? 'translateY(-3px)' : 'none',
        }}
      >
        {offre.badge && (
          <span
            className="absolute top-0 start-5 rounded-b-lg px-3 py-1 text-[0.72rem] font-bold tracking-wide text-white"
            style={{ background: 'linear-gradient(135deg,#c9a46a,#94733a)' }}
          >
            {offre.badge}
          </span>
        )}

        {/* Pastille de sélection */}
        <span
          aria-hidden
          className="absolute top-4 end-4 grid h-7 w-7 place-items-center rounded-full border transition-all duration-300"
          style={{
            borderColor: coche ? 'var(--color-rose)' : 'color-mix(in srgb, var(--color-or) 45%, transparent)',
            background: coche ? 'var(--color-rose)' : 'transparent',
            color: '#fff',
            transform: coche ? 'scale(1)' : 'scale(.9)',
          }}
        >
          {coche && <IconeCoche taille={15} />}
        </span>

        <h3 className="mt-2 text-[1.35rem] font-extrabold text-encre">{offre.titre}</h3>
        <p className="mt-1 text-[0.98rem] font-semibold text-rose">{offre.sousTitre}</p>

        <div className="mt-4 flex items-end justify-center gap-2">
          <span
            className="text-[2.1rem] leading-none font-extrabold"
            style={{ color: coche ? 'var(--color-rose-fonce)' : 'var(--color-encre)' }}
          >
            {offre.prix}
          </span>
          <span className="pb-1 text-base font-bold text-encre-2">دج</span>
          {offre.prixBarre && (
            <span className="pb-1.5 text-sm font-medium text-encre-3 line-through">
              {offre.prixBarre}
            </span>
          )}
        </div>

        <p className="mt-1 text-[0.82rem] font-medium text-encre-2">+ التوصيل حسب الولاية</p>

        <ul className="mt-3 space-y-1.5 text-[0.92rem] text-encre-2">
          {details.map((ligne) => (
            <li key={ligne} className="flex items-center justify-center gap-1.5">
              <IconeCoche taille={14} className="text-or-fonce" />
              {ligne}
            </li>
          ))}
        </ul>
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */

function BoutonParfum({
  cle,
  coche,
  auChoix,
}: {
  cle: CleParfum;
  coche: boolean;
  auChoix: (parfum: CleParfum) => void;
}) {
  const parfum = PARFUMS[cle];

  return (
    <label className="relative block cursor-pointer">
      <input
        type="radio"
        name="parfum"
        value={cle}
        checked={coche}
        onChange={() => auChoix(cle)}
        className="sr-only"
      />
      <div
        className="flex items-center gap-3 rounded-2xl border p-3.5 transition-all duration-300"
        style={{
          borderColor: coche ? 'var(--color-rose)' : 'var(--color-creme-3)',
          background: coche ? '#fdeef3' : 'var(--color-blanc)',
          boxShadow: coche ? '0 12px 26px -18px rgba(212,39,102,.7)' : 'none',
        }}
      >
        <span
          aria-hidden
          className="h-9 w-9 shrink-0 rounded-full border"
          style={{
            background: parfum.couleur,
            borderColor: 'color-mix(in srgb, var(--color-or) 60%, transparent)',
            boxShadow: 'inset 0 2px 5px rgba(255,255,255,.35)',
          }}
        />
        <span className="flex-1 text-start">
          <span className="block text-[1.05rem] font-extrabold text-encre">{parfum.nom}</span>
          <span className="block text-[0.82rem] text-encre-2">{parfum.note}</span>
        </span>
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-full border"
          style={{
            borderColor: coche ? 'var(--color-rose)' : 'var(--color-creme-3)',
            background: coche ? 'var(--color-rose)' : 'transparent',
            color: '#fff',
          }}
        >
          {coche && <IconeCoche taille={13} />}
        </span>
      </div>
    </label>
  );
}

