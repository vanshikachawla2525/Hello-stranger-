/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_ADMIN_PASSPHRASE?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CONFIG_NATIVE_IGNORE_WARNING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
