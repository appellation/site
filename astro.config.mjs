import presetIcons from '@unocss/preset-icons';
import { defineConfig } from 'astro/config';
import { presetUno } from 'unocss';
import Unocss from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [Unocss({ presets: [presetIcons(), presetUno()] })],
  site: 'https://wnelson.dev',
});
