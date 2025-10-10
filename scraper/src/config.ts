export interface AppConfig {
  recordingDevice: string;
  outputDir: string;
  executablePath?: string;
  ffmpegAudioInput: string;
  browserHeadless: boolean;
  browserArgs: string[];
}

export interface TestModeConfig extends AppConfig {
  mode: 'test';
}

export interface ProductionConfig extends AppConfig {
  mode: 'production';
}

export type Config = TestModeConfig | ProductionConfig;

/**
 * Configuration for Linux production environment (Docker)
 */
export function getProductionConfig(): ProductionConfig {
  return {
    mode: 'production',
    recordingDevice: 'virtual-capture-recorder.monitor',
    outputDir: './out',
    executablePath: '/usr/bin/google-chrome',
    ffmpegAudioInput: 'pulse',
    browserHeadless: true,
    browserArgs: ['--use-fake-ui-for-media-stream'],
  };
}

/**
 * Configuration for local testing on Linux
 */
export function getTestConfig(): TestModeConfig {
  return {
    mode: 'test',
    recordingDevice: 'virtual-capture-recorder.monitor', // Virtual PulseAudio monitor for servers
    outputDir: './out',
    ffmpegAudioInput: 'pulse',
    browserHeadless: true,
    browserArgs: [
      '--use-fake-ui-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-features=PulseaudioLoopbackForScreenShare',
      '--alsa-output-device=pulse',
    ],
  };
}

/**
 * Get configuration based on test mode flag
 */
export function getConfig(isTestMode: boolean): Config {
  return isTestMode ? getTestConfig() : getProductionConfig();
}
