/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SPOTIFY_REDIRECT_URL: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }