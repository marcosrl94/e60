import type { Config } from 'tailwindcss';
import e60Preset from '@e60/config/tailwind';

const config: Config = {
  presets: [e60Preset],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    // include @e60/ui source so its classes are picked up
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
