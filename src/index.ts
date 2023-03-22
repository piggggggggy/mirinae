import type { Plugin } from 'vue';

import { MirinaeInstaller } from './install';

const mirinaeOptions: Plugin = {
    install: MirinaeInstaller.install,
};

/* Plugin */
export default mirinaeOptions;

/* Languages */
export { messages } from './translations';

/* Styles */
export { default as colors } from './styles/colors.cjs';
export { default as screens } from './styles/screens.cjs';
export { default as styleVariables } from './styles/variables.cjs';
export { default as fonts } from './styles/web-fonts.cjs';

/* Components */
export * from './components';

/* Composables */
export * from './hooks';

/* Utils */
export * from './utils';
