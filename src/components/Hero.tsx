import { useState } from 'react';
import { PLACEHOLDER_PRODUIT } from '../lib/placeholder';
import { useRevele } from '../lib/useRevele';
import { suivreUneFois } from '../lib/pixel';
import { IconeBillets, IconeFleche, IconeLivraison, IconePanier } from './Icones';

type Props = { auClicCommander: () => void };

/* Préfixe de base Vite : '/' en dev et sur Netlify/Vercel,
   '/assadyara/' sur GitHub Pages. Les chemins « /img/… » en dur
   ignoreraient ce préfixe et renverraient 404 hors racine. */
const BASE = import.meta.env.BASE_URL;

/**
 * Section 1 — la photo du client est le tout premier élément visible.
 * Pleine largeur sur téléphone (elle est au format 9:16, celui de l'écran),
 * encadrée d'un filet doré à partir de la tablette. Jamais recadrée.
 */
export function Hero({ auClicCommander }: Props) {
  const [chargee, setChargee] = useState(false);
  const refTexte = useRevele<HTMLDivElement>({ seuil: 0.1 });
  const refPhoto = useRevele<HTMLElement>({
    seuil: 0.25,
    auCroisement: () =>
      suivreUneFois('ViewContent', {
        content_name: 'أسد & يارا',
        content_type: 'product',
        currency: 'DZD',
      }),
  });

  return (
    <header className="relative overflow-hidden pb-10 lg:pt-6 lg:pb-20">
      {/* Halos décoratifs, découpés par le overflow-hidden du parent. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 start-[-18%] h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(231,148,166,.34), transparent 68%)' }}
        />
        <div
          className="absolute top-1/2 end-[-22%] h-[30rem] w-[30rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(201,164,106,.28), transparent 68%)' }}
        />
      </div>

      <div className="enveloppe relative">
        <div className="grid items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          {/* ---------- La photo produit ---------- */}
          <figure ref={refPhoto} className="hero-photo revele est-visible order-1">
            <div className="hero-cadre">
              {/* Reflet doré très léger sur le cadre */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden sm:block"
                style={{
                  borderRadius: 'inherit',
                  background:
                    'linear-gradient(150deg, rgba(255,255,255,.5) 0%, transparent 32%, transparent 70%, rgba(201,164,106,.2) 100%)',
                }}
              />
              <img
                src={`${BASE}img/produit-750.webp`}
                srcSet={`${BASE}img/produit-380.webp 380w, ${BASE}img/produit-560.webp 560w, ${BASE}img/produit-750.webp 750w, ${BASE}img/produit-941.webp 941w`}
                sizes="(min-width: 1024px) 470px, (min-width: 32.5rem) 60vw, 100vw"
                width={941}
                height={1672}
                alt="عطر أسد بالقارورة السوداء وعطر يارا بالقارورة الوردية"
                fetchPriority="high"
                decoding="async"
                onLoad={() => setChargee(true)}
                className="hero-img"
                style={{ backgroundImage: chargee ? undefined : `url(${PLACEHOLDER_PRODUIT})` }}
              />
            </div>
          </figure>

          {/* ---------- Le discours ---------- */}
          <div ref={refTexte} className="revele order-2 pt-7 text-center lg:pt-0 lg:text-start">
            <p className="surtitre justify-center lg:justify-start">عطر فاخر · أصلي 100٪</p>

            <h1 className="mt-2 text-[clamp(2rem,9vw,4.2rem)] leading-[1.15] font-extrabold">
              <span className="text-encre">أسد</span>
              <span className="texte-or mx-2 font-serif">&amp;</span>
              <span className="text-rose">يارا</span>
            </h1>

            <p className="texte-or font-serif text-[0.78rem] tracking-[0.42em]">ASAD &amp; YARA</p>

            <div className="separateur my-4 lg:justify-start" aria-hidden>
              <span className="text-[0.6rem]">◆</span>
            </div>

            <p className="text-[clamp(1.15rem,4.8vw,1.6rem)] leading-snug font-bold text-encre">
              عطران .. يحكيان قصتك
            </p>

            <p className="mx-auto mt-2 max-w-[30rem] text-[1.02rem] text-encre-2 lg:mx-0">
              اختاري عطرك المفضل وتمتعي بإحساس فاخر يدوم معك
            </p>

            {/* Les prix dès le premier écran : un visiteur venu d'une publicité
                ne doit jamais avoir à chercher combien ça coûte. */}
            <p
              className="mx-auto mt-4 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full px-4 py-1.5 text-[0.92rem] text-encre-2 lg:mx-0"
              style={{
                background: 'color-mix(in srgb, var(--color-blanc) 75%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-or) 38%, transparent)',
              }}
            >
              <span>
                العلبتين بـ <strong className="font-extrabold text-rose-fonce">3700 دج</strong>
              </span>
              <span aria-hidden className="text-or">·</span>
              <span>
                العلبة بـ <strong className="font-extrabold text-encre">2200 دج</strong>
              </span>
            </p>

            <div className="mt-5 flex flex-col items-center gap-3.5 lg:items-start">
              <a
                href="#commander"
                onClick={auClicCommander}
                className="btn btn-principal w-full max-w-[22rem] lg:w-auto"
              >
                <IconePanier taille={21} />
                اطلب الآن
              </a>

              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[0.88rem] font-medium text-encre-2 lg:justify-start">
                <li className="flex items-center gap-1.5">
                  <IconeBillets taille={17} className="text-or-fonce" />
                  الدفع عند الاستلام
                </li>
                <li className="flex items-center gap-1.5">
                  <IconeLivraison taille={17} className="text-or-fonce" />
                  التوصيل إلى 58 ولاية
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:hidden" aria-hidden>
          <IconeFleche
            taille={22}
            className="text-or opacity-70"
            style={{ animation: 'flotter 2.6s ease-in-out infinite' }}
          />
        </div>
      </div>
    </header>
  );
}
