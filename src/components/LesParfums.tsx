import { useRevele } from '../lib/useRevele';
import { IconeGoutte } from './Icones';

const FICHES = [
  {
    nom: 'أسد',
    latin: 'ASAD',
    couleur: '#0d0908',
    accent: '#c9a46a',
    texte: 'عطر قوي وجذاب بلمسات شرقية عميقة، يدمج بين الفخامة والرجولة.',
    notes: ['توابل', 'خشب', 'عنبر'],
  },
  {
    nom: 'يارا',
    latin: 'YARA',
    couleur: '#e794a6',
    accent: '#d42766',
    texte: 'عطر ناعم أنثوي مفعم بالحيوية، مزيج ساحر من الفواكه والزهور والفانيليا.',
    notes: ['فواكه', 'زهور', 'فانيليا'],
  },
];

/** Deux fiches courtes : juste ce qu'il faut pour désirer, jamais un catalogue. */
export function LesParfums() {
  const ref = useRevele<HTMLElement>();

  return (
    <section ref={ref} className="revele enveloppe py-10 sm:py-14">
      <div className="text-center">
        <p className="surtitre">العطران</p>
        <h2 className="mt-3 text-[clamp(1.5rem,6vw,2.2rem)] font-extrabold text-encre">
          حكايتان في زجاجتين
        </h2>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5">
        {FICHES.map((fiche) => (
          <article key={fiche.nom} className="carte relative overflow-hidden p-6">
            <span
              aria-hidden
              className="absolute top-0 inset-x-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, transparent, ${fiche.accent}, transparent)` }}
            />

            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-12 w-12 shrink-0 rounded-full"
                style={{
                  background: fiche.couleur,
                  border: '1px solid color-mix(in srgb, var(--color-or) 55%, transparent)',
                  boxShadow: 'inset 0 3px 8px rgba(255,255,255,.3)',
                }}
              />
              <div>
                <h3 className="text-2xl leading-tight font-extrabold text-encre">{fiche.nom}</h3>
                <p className="font-serif text-[0.72rem] tracking-[0.32em] text-or-fonce">
                  {fiche.latin}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[1rem] text-encre-2">{fiche.texte}</p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {fiche.notes.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.82rem] font-semibold"
                  style={{
                    background: 'color-mix(in srgb, var(--color-creme-2) 75%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-or) 30%, transparent)',
                    color: 'var(--color-encre-2)',
                  }}
                >
                  <IconeGoutte taille={13} className="text-or-fonce" />
                  {note}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
