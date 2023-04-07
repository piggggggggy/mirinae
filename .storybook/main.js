const path = require('path');
const postCssLoader = {
  loader: 'postcss-loader',
  options: require('./postcss.config')
};
module.exports = {
  "stories": ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  "addons": ["@storybook/addon-links", "@storybook/addon-a11y", "@storybook/addon-storysource", "storybook-addon-designs", "@storybook/addon-essentials", '@storybook/addon-mdx-gfm'],
  async viteFinal(config, { configType }) {

    if (configType === 'PRODUCTION') {
      // set public path for production builds
      config.base = '/path/to/public/folder/';
    }

    /* alis settings */
    config.resolve.alias = {
      'vue': 'vue/dist/vue.d.ts',
      '@': path.resolve(__dirname, '../src'),
      'fs': path.resolve(__dirname, 'fsMock.js')
    };

    // /* SASS settings */
    // config.module.rules.push({
    //   test: /\.s?css$/,
    //   use: ['style-loader', 'css-loader', {
    //     loader: 'sass-loader',
    //     options: {
    //       implementation: require('sass')
    //     }
    //   }],
    //   include: path.resolve(__dirname, '../')
    // });
    //
    // /* POSTCSS settings */
    // config.module.rules.push({
    //   test: /\.(postcss|pcss)$/,
    //   use: ['style-loader', 'css-loader', postCssLoader],
    //   include: path.resolve(__dirname, '../')
    // });

    /* for 'Can't import the named export from non EcmaScript module' issue while using '@vueuse/components' */
    /* https://github.com/vuejs/pinia/issues/675 */
    // config.module.rules.push({
    //   test: /\.mjs$/,
    //   include: /node_modules/,
    //   type: 'javascript/auto'
    // });
    return config;
  },
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  docs: {
    autodocs: true
  }
};
