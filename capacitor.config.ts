import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ashfallprotocol.game',
  appName: 'Ashfall Protocol',
  webDir: 'www',
  server: {
    // Connects directly to your live Ashfall Protocol multiplayer server
    url: 'https://ais-dev-eyo7p5xpqkjnqgc5opy5zt-465114569299.europe-west1.run.app',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0d1015',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
