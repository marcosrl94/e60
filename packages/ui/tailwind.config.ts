import type { Config } from 'tailwindcss';
import e60Preset from '@e60/config/tailwind';

const config: Config = {
  presets: [e60Preset],
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
};

export default config;
