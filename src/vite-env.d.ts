/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PIXEL_ID?: string;
  readonly VITE_WEB3FORMS_KEY?: string;
  readonly VITE_COMMANDE_ENDPOINT?: string;
  readonly VITE_HUB_URL?: string;
  readonly VITE_HUB_LANDING_ID?: string;
  readonly VITE_HUB_PRODUIT_PACK?: string;
  readonly VITE_HUB_PRODUIT_UNITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
