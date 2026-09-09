/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PIXEL_ID?: string;
  readonly VITE_WEB3FORMS_KEY?: string;
  readonly VITE_COMMANDE_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
