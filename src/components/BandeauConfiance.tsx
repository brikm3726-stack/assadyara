import { IconeBillets, IconeBouclier, IconeLivraison } from './Icones';

const POINTS = [
  { icone: IconeBillets, titre: 'الدفع عند الاستلام', detail: 'تدفع بعد ما تستلم طلبك' },
  { icone: IconeLivraison, titre: 'التوصيل إلى 58 ولاية', detail: 'كامل التراب الوطني' },
  { icone: IconeBouclier, titre: 'منتج أصلي 100٪', detail: 'عطور مضمونة وثابتة' },
];

/** Bandeau de réassurance, juste sous la photo : les 3 freins levés d'un coup. */
export function BandeauConfiance() {
  return (
    <section
      aria-label="ضمانات"
      className="border-y"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-or) 28%, transparent)',
        background: 'linear-gradient(180deg, rgba(255,253,252,.85), rgba(248,236,228,.85))',
      }}
    >
      <ul className="enveloppe grid grid-cols-1 gap-3 py-5 sm:grid-cols-3 sm:gap-6">
        {POINTS.map(({ icone: Icone, titre, detail }) => (
          <li key={titre} className="flex items-center gap-3 sm:flex-col sm:gap-1.5 sm:text-center">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
              style={{
                background: 'linear-gradient(135deg,#fffdfb,#f3e2d6)',
                border: '1px solid color-mix(in srgb, var(--color-or) 45%, transparent)',
                color: 'var(--color-or-fonce)',
              }}
            >
              <Icone taille={21} />
            </span>
            <span>
              <span className="block font-extrabold text-encre">{titre}</span>
              <span className="block text-[0.85rem] text-encre-2">{detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
