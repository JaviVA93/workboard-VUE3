/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  spotify_token: any;
  Spotify: any;
  spotify_player: any;
  onSpotifyWebPlaybackSDKReady: () => void;
  spotifyData: any;
  spotifyDataPrinter: any;
  spotifyDataPrinterFlag: boolean;
}