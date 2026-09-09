/**
 * Icônes dessinées à la main en SVG inline.
 * Aucune librairie d'icônes : zéro kilo-octet de dépendance, tracés fins
 * cohérents avec les filets dorés de la page.
 */
type Props = { className?: string; taille?: number; style?: React.CSSProperties };

const base = (taille: number) => ({
  width: taille,
  height: taille,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
});

export const IconePanier = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M3 5h2.2l1.9 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.4 8H6" />
    <circle cx="9.5" cy="20" r="1.3" />
    <circle cx="17" cy="20" r="1.3" />
  </svg>
);

export const IconeCoche = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="m5 12.8 4.4 4.2L19 7" />
  </svg>
);

export const IconeBouclier = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 7.7 7 9.5 4.1-1.8 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9.3 12.2 1.9 1.9 3.6-3.7" />
  </svg>
);

export const IconeLivraison = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M2 7.5h10.5v9H2z" />
    <path d="M12.5 10.5H17l3 3v3h-7.5z" />
    <circle cx="6" cy="18" r="1.6" />
    <circle cx="16.5" cy="18" r="1.6" />
  </svg>
);

export const IconeBillets = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export const IconeUtilisateur = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M4.8 20c.6-3.6 3.5-5.6 7.2-5.6s6.6 2 7.2 5.6" />
  </svg>
);

export const IconeTelephone = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M6.4 3.5h3l1.4 3.6-2 1.4a11.5 11.5 0 0 0 5.7 5.7l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);

export const IconeEpingle = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.3" r="2.4" />
  </svg>
);

export const IconeMaison = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-5.5H9V21H5a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconeNote = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M16.5 3.6 20.4 7.5 9.6 18.3l-4.6.7.7-4.6z" />
    <path d="m14.4 5.7 3.9 3.9" />
  </svg>
);

export const IconeLoupe = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.5 15.5 4 4" />
  </svg>
);

export const IconeChevron = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const IconeFleche = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M12 4.5v14M6.5 13l5.5 5.5L17.5 13" />
  </svg>
);

export const IconeEtoile = ({ className, style, taille = 16 }: Props) => (
  <svg {...base(taille)} className={className} style={style} fill="currentColor" stroke="none">
    <path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />
  </svg>
);

export const IconeGoutte = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <path d="M12 3.5c3.2 3.7 5.4 6.5 5.4 9.1a5.4 5.4 0 0 1-10.8 0c0-2.6 2.2-5.4 5.4-9.1Z" />
  </svg>
);

export const IconeCadenas = ({ className, style, taille = 20 }: Props) => (
  <svg {...base(taille)} className={className} style={style}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5" />
  </svg>
);
