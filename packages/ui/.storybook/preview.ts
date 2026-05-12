import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#f5f5f7' },
        { name: 'panel', value: '#ffffff' },
        { name: 'dark', value: '#0c0e12' },
      ],
    },
  },
};

export default preview;
