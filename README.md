# أسد & يارا — landing page de vente

Page unique de vente pour le coffret de deux parfums **أسد (ASAD)** et **يارا (YARA)**,
destinée au trafic Facebook Ads en Algérie. Tout en arabe, RTL, mobile d'abord,
paiement à la livraison.

Parcours : **photo → offre (3700 / 2200) → formulaire → confirmation**.
Aucun compte, aucun panier, aucun paiement en ligne, aucune autre page.

---

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # génère dist/ (racine d'un domaine)
npm run preview  # relit le dossier dist/
npm run deploy   # build avec la base /assadyara/ + publication sur gh-pages
```

La page est en ligne sur <https://brikm3726-stack.github.io/assadyara/>.
GitHub Pages la sert depuis un sous-dossier : c'est pourquoi le déploiement
passe par `build:pages`, qui fixe `--base=/assadyara/`. Un `npm run build`
ordinaire produirait des chemins absolus cassés une fois publiés.

> Ne lancez pas `npm run build` pendant que `npm run dev` tourne.

## Réglages (fichier `.env`)

Copiez `.env.example` en `.env`. Toutes les variables sont facultatives : sans
elles la page tourne en **mode démo** (commande gardée dans le navigateur,
événements Pixel affichés dans la console).

| Variable                  | Rôle                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `VITE_HUB_URL`            | Adresse du hub. `https://ecom-hub-cyan.vercel.app`          |
| `VITE_HUB_LANDING_ID`     | Code de la landing dans le dashboard (`LANDING_003`).       |
| `VITE_HUB_PRODUIT_PACK`   | Code du produit facturé 3700 دج.                            |
| `VITE_HUB_PRODUIT_UNITE`  | Code du produit facturé 2200 دج.                            |
| `VITE_WEB3FORMS_KEY`      | Clé Web3Forms : une alerte e-mail à chaque commande.        |
| `VITE_COMMANDE_ENDPOINT`  | Une URL de plus, qui reçoit la commande en POST JSON.       |
| `VITE_PIXEL_ID`           | Identifiant Meta Pixel. Vide = aucun suivi réel envoyé.     |

Après toute modification du `.env`, il faut **rebuilder et redéployer**
(`npm run deploy`) : Vite fige ces valeurs à la compilation, elles vivent dans
le fichier JavaScript publié.

### Où arrivent les commandes

Les destinations sont **cumulables** : le hub enregistre, Web3Forms prévient
par e-mail. Tout part en parallèle, en `keepalive`, et la confirmation
s'affiche sans attendre plus de 2,5 s — sur un réseau mobile algérien, un
écran figé, c'est la vente perdue. Une copie est toujours gardée dans le
navigateur (`localStorage`, clé `commandes-asad-yara`).

#### Le hub (ecom-hub → dashboard → NOEST)

Trois gestes, une seule fois, dans <https://ecom-hub-cyan.vercel.app/admin> :

1. **Produits → Nouveau produit**, deux fois. Le hub recalcule toujours le
   montant à partir du produit et **ignore le prix envoyé par la page** : il
   faut donc un produit par offre.

   | Nom | Prix | Frais domicile / bureau |
   | --- | --- | --- |
   | `أسد + يارا — العلبتين` | `3700` | `0` et `0` |
   | `أسد أو يارا — علبة واحدة` | `2200` | `0` et `0` |

2. **Landing pages → Connecter une nouvelle landing page**, URL
   `https://brikm3726-stack.github.io/assadyara/`.
3. Reporter les trois codes obtenus dans `.env`, puis `npm run deploy`.
   Le hub numérote à la suite : `PROD_001` à `PROD_003` sont déjà les trois
   coloris McQUENNE, les parfums prendront donc les numéros suivants.

```env
VITE_HUB_URL=https://ecom-hub-cyan.vercel.app
VITE_HUB_LANDING_ID=LANDING_003
VITE_HUB_PRODUIT_PACK=PROD_004
VITE_HUB_PRODUIT_UNITE=PROD_005
```

**Les frais de livraison.** Si les champs « Frais domicile » et « Frais
bureau » du produit restent vides, le hub applique sa grille par wilaya et
l'ajoute au total : la page annonce 3700 دج, le dashboard affiche 4400 دج, et
le livreur réclame un montant que l'acheteur n'a jamais vu. Deux issues
cohérentes : mettre `0` dans ces deux champs (livraison offerte, le prix
affiché est le prix payé), ou afficher les frais sur la page. **Choix retenu
ici : `0` partout**, la page annonce un prix tout compris.

Tant que `VITE_HUB_LANDING_ID` est vide, l'appel au hub est simplement sauté :
la page continue de fonctionner avec l'e-mail seul.

#### Ce que la page envoie

```json
{
  "landingPageId": "LANDING_003",
  "productId": "PROD_005",
  "customer": {
    "name": "أمينة بن علي",
    "phone": "0550123456",
    "wilaya": "19",
    "wilayaCode": "19",
    "commune": "العلمة",
    "address": "حي 20 أوت، عمارة ب"
  },
  "quantity": 1,
  "variant": "أسد",
  "delivery": "domicile",
  "note": "… — réf. page AY-GWGT5",
  "source": "Landing أسد & يارا",
  "total": 2200,
  "utm": { "utm_source": "facebook", "fbclid": "…" }
}
```

La wilaya part sous son **code** et jamais sous son nom arabe : le hub compare
les noms après avoir retiré tout ce qui n'est pas latin, et « سطيف »
deviendrait une chaîne vide, donc « Wilaya inconnue ». Les paramètres de
campagne présents dans l'URL (`utm_*`, `fbclid`) sont transmis tels quels :
le dashboard dira quelle publicité a vendu.

#### Web3Forms

Clé gratuite sur <https://web3forms.com>, à mettre dans `VITE_WEB3FORMS_KEY`.
Joignable depuis l'Algérie, contrairement à FormSubmit.

### Meta Pixel

`src/lib/pixel.ts` envoie les cinq événements demandés :

| Événement          | Déclenchement                                         |
| ------------------ | ----------------------------------------------------- |
| `PageView`         | chargement de la page                                 |
| `ViewContent`      | la photo produit entre à l'écran / changement d'offre  |
| `InitiateCheckout` | clic sur « اطلب الآن » ou arrivée sur le formulaire    |
| `Lead`             | formulaire valide, commande partie                    |
| `Purchase`         | commande confirmée (`value` = prix, `currency` = DZD) |

## Changer les prix ou les textes de l'offre

Tout est dans **`src/lib/config.ts`** : noms des parfums, titres des offres,
prix, prix barré, badge. Le prix barré du pack (4400 دج) est le total des deux
flacons à l'unité ; l'économie affichée (« وفّري 700 دج ») est calculée, elle
suit automatiquement.

## La photo produit

La photo fournie par le client est dans `scripts/source-produit.jpg`.
`npm run images` en régénère toutes les versions :

- `public/img/produit-{380,560,750,941}.webp` — servies via `srcset`
- `public/img/produit.jpg` — repli pour les vieux navigateurs
- `public/img/partage.jpg` — aperçu Facebook / WhatsApp (1200 × 630)
- `public/icone.png` — favicon
- `src/lib/placeholder.ts` — miniature floue en base64, affichée le temps du chargement

La photo n'est **jamais recadrée** : pleine largeur sur téléphone (elle est au
format 9:16, celui de l'écran), encadrée d'un filet doré à partir de 520 px.

Pour changer de photo : remplacez `scripts/source-produit.jpg`, lancez
`npm run images`, puis rebuildez.

## Structure

```
src/
  App.tsx                    assemblage de la page + état de l'offre choisie
  components/
    Hero.tsx                 photo + titre + CTA + prix
    BandeauConfiance.tsx     paiement à la livraison / 58 wilayas / authenticité
    LesParfums.tsx           deux fiches courtes ASAD et YARA
    Offres.tsx               choix 3700 / 2200 + choix du parfum
    Commande.tsx             formulaire, résumé, confirmation
    ChampWilaya.tsx          sélecteur des 58 wilayas avec recherche
    CtaFlottant.tsx          bouton collant en bas d'écran (mobile)
    PiedDePage.tsx           pied de page minimal
    Icones.tsx               icônes SVG maison (aucune dépendance)
  data/wilayas.ts            les 58 wilayas + normalisation de recherche
  lib/config.ts              prix, offres, variables d'environnement
  lib/commande.ts            envoi de la commande + copie locale
  lib/pixel.ts               Meta Pixel
  lib/useRevele.ts           apparition au défilement
```

## Points d'attention

- **Polices auto-hébergées** (`public/fonts/`, 140 Ko) : Tajawal pour l'arabe,
  Cormorant Garamond pour les quelques mots latins. Aucun appel à Google Fonts,
  qui n'est pas toujours joignable depuis l'Algérie.
- **Aucune barre horizontale** : vérifié à 320, 390 et 1440 px.
- **Champ téléphone** : Chrome impose `direction: ltr` aux `input[type=tel]`.
  La classe `.champ-tel` remet le rembourrage du côté de l'icône — ne la
  supprimez pas.
- **Pas d'interlettrage sur l'arabe** : il délie les lettres cursives. Le
  `letter-spacing` n'est utilisé que sur les mots latins.
- Les cartes d'offre sont de vrais `input[type=radio]` masqués : clavier et
  lecteurs d'écran fonctionnent sans code supplémentaire.

## Mise en ligne

`netlify.toml` et `vercel.json` sont prêts (dossier publié : `dist`, cache long
sur les polices et les images). Sur Vercel ou Netlify, pensez à déclarer les
variables `VITE_…` dans les réglages du projet avant le build.
