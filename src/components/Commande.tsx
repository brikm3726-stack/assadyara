import { useRef, useState } from 'react';
import {
  DEVISE,
  OFFRES,
  conditionnement,
  libelleProduit,
  type CleOffre,
  type CleParfum,
} from '../lib/config';
import { envoyerCommande, genererReference, type Commande as Bon } from '../lib/commande';
import { suivre, suivreUneFois } from '../lib/pixel';
import { useRevele } from '../lib/useRevele';
import { ChampWilaya } from './ChampWilaya';
import {
  IconeBillets,
  IconeCadenas,
  IconeCoche,
  IconeLivraison,
  IconeMaison,
  IconeNote,
  IconePanier,
  IconeTelephone,
  IconeUtilisateur,
} from './Icones';

type Props = {
  offre: CleOffre;
  parfum: CleParfum | null;
  parfumManquant: () => void;
  auSucces: () => void;
};

type Champs = {
  nom: string;
  telephone: string;
  /** Nom arabe, pour l'affichage. */
  wilaya: string;
  /** Code officiel (« 19 ») : c'est lui que le hub sait reconnaître. */
  wilayaCode: string;
  commune: string;
  notes: string;
};
type Erreurs = Partial<Record<keyof Champs, string>>;

const CHAMPS_VIDES: Champs = {
  nom: '',
  telephone: '',
  wilaya: '',
  wilayaCode: '',
  commune: '',
  notes: '',
};

/** Accepte 0550…, +213 550…, 00213 550… et renvoie la forme locale 0XXXXXXXXX. */
function normaliserTelephone(saisie: string): string {
  const chiffres = saisie.replace(/[^\d+]/g, '');
  if (chiffres.startsWith('+213')) return `0${chiffres.slice(4)}`;
  if (chiffres.startsWith('00213')) return `0${chiffres.slice(5)}`;
  if (chiffres.startsWith('213') && chiffres.length === 12) return `0${chiffres.slice(3)}`;
  return chiffres;
}

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* Le champ téléphone est en LTR (imposé par le navigateur, et souhaitable :
   sinon les groupes de chiffres se réordonnent). Pour que le texte d'exemple
   s'affiche quand même dans le sens arabe, on l'enveloppe d'isolants Unicode :
   RLI … PDI autour de la phrase, LRI … PDI autour du numéro. */
const EXEMPLE_TELEPHONE = '\u2067مثال: \u20660550 00 00 00\u2069\u2069';

/**
 * Section 3 — le formulaire de commande, puis la confirmation.
 * Tout se passe sur la même page : aucune redirection, aucun compte à créer.
 */
export function Commande({ offre, parfum, parfumManquant, auSucces }: Props) {
  const [champs, setChamps] = useState<Champs>(CHAMPS_VIDES);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const [bon, setBon] = useState<Bon | null>(null);

  const refNom = useRef<HTMLInputElement>(null);
  const refTelephone = useRef<HTMLInputElement>(null);
  const refCommune = useRef<HTMLInputElement>(null);
  const refConfirmation = useRef<HTMLDivElement>(null);

  const section = useRevele<HTMLElement>({
    seuil: 0.2,
    auCroisement: () => suivreUneFois('InitiateCheckout', { currency: 'DZD' }),
  });

  const prix = OFFRES[offre].prix;
  const produit = libelleProduit(offre, parfum);

  const modifier = (cle: keyof Champs) => (valeur: string) => {
    setChamps((c) => ({ ...c, [cle]: valeur }));
    setErreurs((e) => (e[cle] ? { ...e, [cle]: undefined } : e));
  };

  function verifier(): Erreurs {
    const trouvees: Erreurs = {};

    if (champs.nom.trim().length < 3) trouvees.nom = 'الرجاء إدخال اسمك الكامل';

    const tel = normaliserTelephone(champs.telephone);
    if (!/^0[5-7]\d{8}$/.test(tel)) trouvees.telephone = 'رقم غير صحيح — مثال: 0550 00 00 00';

    if (!champs.wilaya) trouvees.wilaya = 'الرجاء اختيار الولاية';
    if (champs.commune.trim().length < 2) trouvees.commune = 'الرجاء إدخال اسم البلدية';

    return trouvees;
  }

  async function soumettre(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (envoi) return;

    /* L'offre à l'unité exige un parfum : on renvoie l'acheteur au bon endroit. */
    if (offre === 'unite' && !parfum) {
      parfumManquant();
      return;
    }

    const trouvees = verifier();
    setErreurs(trouvees);

    const premiere = (['nom', 'telephone', 'wilaya', 'commune'] as const).find((c) => trouvees[c]);
    if (premiere) {
      const cibles = {
        nom: refNom.current,
        telephone: refTelephone.current,
        commune: refCommune.current,
        wilaya: document.querySelector<HTMLButtonElement>('[aria-controls="liste-wilayas"]'),
      };
      const cible = cibles[premiere];
      cible?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cible?.focus({ preventScroll: true });
      return;
    }

    setEnvoi(true);

    const commande: Bon = {
      reference: genererReference(),
      date: new Date().toISOString(),
      nom: champs.nom.trim(),
      telephone: normaliserTelephone(champs.telephone),
      wilaya: champs.wilaya,
      wilayaCode: champs.wilayaCode,
      commune: champs.commune.trim(),
      notes: champs.notes.trim(),
      offre,
      produit,
      conditionnement: conditionnement(offre),
      parfum: offre === 'pack' ? null : parfum,
      prix,
    };

    suivre('Lead', { content_name: produit, currency: 'DZD', value: prix });

    /* On laisse au réseau 2,5 s maximum : au-delà, l'acheteur voit quand même
       sa confirmation et l'envoi se termine en arrière-plan. */
    await Promise.race([envoyerCommande(commande), attendre(2500)]);

    suivre('Purchase', {
      content_name: produit,
      content_type: 'product',
      contents: [{ id: offre, quantity: offre === 'pack' ? 2 : 1 }],
      currency: 'DZD',
      value: prix,
    });

    setEnvoi(false);
    setBon(commande);
    auSucces();
    requestAnimationFrame(() =>
      refConfirmation.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  }

  /* ---------------------------------------------------------------- */

  if (bon) {
    return (
      <section id="commander" className="enveloppe py-12 sm:py-16">
        <Confirmation refConfirmation={refConfirmation} bon={bon} />
      </section>
    );
  }

  return (
    <section ref={section} id="commander" className="revele enveloppe py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="surtitre">الخطوة الأخيرة</p>
          <h2 className="mt-3 text-[clamp(1.7rem,7vw,2.5rem)] font-extrabold text-encre">
            اطلب الآن
          </h2>
          <p className="mx-auto mt-2 max-w-[30rem] text-encre-2">
            املأ المعلومات وسنتواصل معك لتأكيد طلبك
          </p>
        </div>

        <form
          onSubmit={soumettre}
          noValidate
          className="carte mt-7 p-5 sm:p-8"
          style={{ background: 'rgba(255,253,252,.92)' }}
        >
          <Champ
            id="nom"
            libelle="الاسم الكامل"
            erreur={erreurs.nom}
            icone={<IconeUtilisateur taille={19} className="icone-champ" />}
          >
            <input
              ref={refNom}
              id="nom"
              name="nom"
              type="text"
              value={champs.nom}
              onChange={(e) => modifier('nom')(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              autoComplete="name"
              enterKeyHint="next"
              aria-invalid={Boolean(erreurs.nom)}
              aria-describedby={erreurs.nom ? 'erreur-nom' : undefined}
              className={`champ ${erreurs.nom ? 'champ-erreur' : ''}`}
            />
          </Champ>

          <Champ
            id="telephone"
            libelle="رقم الهاتف"
            erreur={erreurs.telephone}
            icone={<IconeTelephone taille={19} className="icone-champ" />}
          >
            <input
              ref={refTelephone}
              id="telephone"
              name="telephone"
              type="tel"
              inputMode="numeric"
              value={champs.telephone}
              onChange={(e) => modifier('telephone')(e.target.value.replace(/[^\d+\s]/g, ''))}
              placeholder={EXEMPLE_TELEPHONE}
              autoComplete="tel"
              enterKeyHint="next"
              maxLength={20}
              aria-invalid={Boolean(erreurs.telephone)}
              aria-describedby={erreurs.telephone ? 'erreur-telephone' : undefined}
              className={`champ champ-tel ${erreurs.telephone ? 'champ-erreur' : ''}`}
            />
          </Champ>

          <Champ id="wilaya" libelle="الولاية" erreur={erreurs.wilaya}>
            <ChampWilaya
              id="wilaya"
              valeur={champs.wilaya}
              auChoix={(w) => {
                setChamps((c) => ({ ...c, wilaya: w.nom, wilayaCode: w.code }));
                setErreurs((e) => (e.wilaya ? { ...e, wilaya: undefined } : e));
              }}
              erreur={erreurs.wilaya}
              idErreur="erreur-wilaya"
            />
          </Champ>

          <Champ
            id="commune"
            libelle="البلدية"
            erreur={erreurs.commune}
            icone={<IconeMaison taille={19} className="icone-champ" />}
          >
            <input
              ref={refCommune}
              id="commune"
              name="commune"
              type="text"
              value={champs.commune}
              onChange={(e) => modifier('commune')(e.target.value)}
              placeholder="أدخل اسم البلدية"
              autoComplete="address-level2"
              enterKeyHint="next"
              aria-invalid={Boolean(erreurs.commune)}
              aria-describedby={erreurs.commune ? 'erreur-commune' : undefined}
              className={`champ ${erreurs.commune ? 'champ-erreur' : ''}`}
            />
          </Champ>

          <Champ
            id="notes"
            libelle="ملاحظات"
            optionnel
            icone={
              <IconeNote
                taille={19}
                className="icone-champ"
                style={{ top: '1.65rem', transform: 'none' }}
              />
            }
          >
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={champs.notes}
              onChange={(e) => modifier('notes')(e.target.value)}
              placeholder="عنوان دقيق، وقت مناسب للاتصال…"
              maxLength={400}
              className="champ resize-none"
              style={{ minHeight: '6rem', lineHeight: 1.7 }}
            />
          </Champ>

          {/* ---------- Résumé de commande ---------- */}
          <div
            aria-live="polite"
            className="mt-6 overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(160deg,#fff 0%,#fdeef3 100%)',
              border: '1px solid color-mix(in srgb, var(--color-or) 40%, transparent)',
            }}
          >
            <p
              className="px-5 py-2.5 text-[0.85rem] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#c9a46a,#94733a)' }}
            >
              ملخص الطلب
            </p>
            <dl className="space-y-2 px-5 py-4 text-[1.02rem]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-semibold text-encre-2">المنتج :</dt>
                <dd className="font-extrabold text-encre">{produit}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-semibold text-encre-2">السعر :</dt>
                <dd className="text-[1.3rem] font-extrabold text-rose-fonce">
                  {prix} {DEVISE}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-creme-3 pt-2">
                <dt className="font-semibold text-encre-2">الدفع :</dt>
                <dd className="font-bold text-encre">عند الاستلام</dd>
              </div>
            </dl>
          </div>

          <button type="submit" disabled={envoi} className="btn btn-principal mt-6 w-full">
            {envoi ? (
              <>
                <Chargement />
                جاري الإرسال…
              </>
            ) : (
              <>
                <IconePanier taille={21} />
                تأكيد الطلب
              </>
            )}
          </button>

          <ul className="mt-5 grid gap-2.5 text-[0.9rem] font-medium text-encre-2 sm:grid-cols-3 sm:text-center">
            <li className="flex items-center gap-2 sm:flex-col sm:gap-1">
              <IconeBillets taille={18} className="text-or-fonce" />
              الدفع عند الاستلام
            </li>
            <li className="flex items-center gap-2 sm:flex-col sm:gap-1">
              <IconeLivraison taille={18} className="text-or-fonce" />
              التوصيل إلى 58 ولاية
            </li>
            <li className="flex items-center gap-2 sm:flex-col sm:gap-1">
              <IconeCadenas taille={18} className="text-or-fonce" />
              معلوماتك آمنة وسرية
            </li>
          </ul>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Champ({
  id,
  libelle,
  erreur,
  optionnel,
  icone,
  children,
}: {
  id: string;
  libelle: string;
  erreur?: string;
  optionnel?: boolean;
  icone?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="etiquette">
        {libelle}
        {optionnel && <span className="ms-2 text-[0.8rem] font-medium text-encre-3">اختياري</span>}
      </label>
      <div className="relative">
        {children}
        {icone}
      </div>
      {erreur && (
        <p id={`erreur-${id}`} className="message-erreur" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}

function Chargement() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
      style={{ animation: 'tourner .7s linear infinite' }}
    />
  );
}

/* ------------------------------------------------------------------ */

function Confirmation({
  bon,
  refConfirmation,
}: {
  bon: Bon;
  refConfirmation: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={refConfirmation}
      role="status"
      aria-live="assertive"
      className="carte mx-auto max-w-2xl p-7 text-center sm:p-10"
      style={{
        background: 'linear-gradient(170deg,#fffdfc 0%,#fdeef3 100%)',
        animation: 'monter .5s var(--ease-douce) both',
      }}
    >
      {/* Sceau doré avec coche tracée */}
      <div
        className="mx-auto grid h-20 w-20 place-items-center rounded-full"
        style={{
          background: 'linear-gradient(135deg,#ebd7a8,#c9a46a 55%,#94733a)',
          boxShadow: '0 18px 34px -16px rgba(148,115,58,.8)',
          animation: 'sceau .6s var(--ease-douce) both',
        }}
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m5 12.6 4.5 4.4L19 7"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="24"
            strokeDashoffset="24"
            style={{ animation: 'trace-coche .5s .25s ease-out forwards' }}
          />
        </svg>
      </div>

      <h2 className="mt-5 text-[clamp(1.5rem,6vw,2.1rem)] font-extrabold text-encre">
        تم إرسال طلبك بنجاح ✓
      </h2>
      <p className="mt-2 text-lg font-bold text-rose">شكراً لثقتك بنا</p>
      <p className="mt-1 text-encre-2">سنتواصل معك قريباً لتأكيد طلبك.</p>

      <div className="separateur my-6" aria-hidden>
        <span className="text-[0.6rem]">◆</span>
      </div>

      <dl className="mx-auto max-w-sm space-y-2 text-start text-[0.98rem]">
        <Ligne intitule="رقم الطلب" valeur={bon.reference} />
        <Ligne intitule="المنتج" valeur={bon.produit} />
        <Ligne intitule="السعر" valeur={`${bon.prix} ${DEVISE}`} accent />
        <Ligne intitule="الهاتف" valeur={bon.telephone} />
        <Ligne intitule="العنوان" valeur={`${bon.commune} — ${bon.wilaya}`} />
      </dl>

      <p className="mt-6 flex items-center justify-center gap-2 text-[0.9rem] font-semibold text-encre-2">
        <IconeCoche taille={16} className="text-or-fonce" />
        الدفع عند الاستلام — لا شيء يُدفع الآن
      </p>
    </div>
  );
}

function Ligne({
  intitule,
  valeur,
  accent,
}: {
  intitule: string;
  valeur: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-creme-3 pb-2">
      <dt className="font-semibold text-encre-2">{intitule}</dt>
      <dd className={accent ? 'font-extrabold text-rose-fonce' : 'font-bold text-encre'}>
        {valeur}
      </dd>
    </div>
  );
}
