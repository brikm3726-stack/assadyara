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
npm run build    # génère dist/
npm run preview  # relit le dossier dist/
```

> Ne lancez pas `npm run build` pendant que `npm run dev` tourne.

## Réglages (fichier `.env`)

Copiez `.env.example` en `.env`. Les trois variables sont facultatives : sans
elles la page tourne en **mode démo** (commande gardée dans le navigateur,
événements Pixel affichés dans la console).

| Variable                 | Rôle                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `VITE_PIXEL_ID`          | Identifiant Meta Pixel. Vide = aucun suivi réel envoyé.      |
| `VITE_WEB3FORMS_KEY`     | Clé Web3Forms : les commandes arrivent par e-mail.           |
| `VITE_COMMANDE_ENDPOINT` | Ou votre propre URL, qui reçoit la commande en POST JSON.    |

Après toute modification du `.env`, il faut **rebuilder** (`npm run build`) :
Vite fige ces valeurs à la compilation.

### Où arrivent les commandes

1. Elles sont **d'abord copiées dans le navigateur** (`localStorage`), puis
   envoyées. La confirmation s'affiche sans attendre plus de 2,5 s : sur un
   réseau mobile algérien capricieux, l'acheteur ne reste jamais bloqué.
2. `VITE_WEB3FORMS_KEY` a la priorité sur `VITE_COMMANDE_ENDPOINT`.

Format JSON envoyé :

```json
{
  "reference": "AY-4F2K9",
  "date": "2026-09-09T14:32:00.000Z",
  "nom": "أمينة بن علي",
  "telephone": "0550123456",
  "wilaya": "سطيف",
  "commune": "العلمة",
  "notes": "",
  "offre": "pack",
  "produit": "أسد + يارا",
  "conditionnement": "2 parfums",
  "parfum": null,
  "prix": 3700
}
```

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
