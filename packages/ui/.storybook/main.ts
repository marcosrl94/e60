import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen',
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
