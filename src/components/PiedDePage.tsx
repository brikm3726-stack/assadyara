import { IconeBillets, IconeCadenas, IconeLivraison } from './Icones';

/** Pied de page volontairement nu : aucun lien qui ferait sortir de la page. */
export function PiedDePage() {
  return (
    <footer
      className="mt-6 border-t"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-or) 28%, transparent)',
        background: 'linear-gradient(180deg, rgba(248,236,228,.7), rgba(253,246,241,.95))',
      }}
    >
      <div className="enveloppe py-8 text-center">
        <p className="text-xl font-extrabold text-encre">
          أسد <span className="texte-or font-serif">&amp;</span> يارا
        </p>
        <p className="font-serif text-[0.7rem] tracking-[0.34em] text-or-fonce">ASAD &amp; YARA</p>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.86rem] font-medium text-encre-2">
          <li className="flex items-center gap-1.5">
            <IconeBillets taille={16} className="text-or-fonce" />
            الدفع عند الاستلام
          </li>
          <li className="flex items-center gap-1.5">
            <IconeLivraison taille={16} className="text-or-fonce" />
            التوصيل إلى 58 ولاية
          </li>
          <li className="flex items-center gap-1.5">
            <IconeCadenas taille={16} className="text-or-fonce" />
            معلوماتك آمنة وسرية
          </li>
        </ul>

        <div className="separateur my-5" aria-hidden>
          <span className="text-[0.55rem]">◆</span>
        </div>

        <p className="text-[0.8rem] text-encre-3">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
