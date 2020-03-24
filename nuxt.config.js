const path = require('path');
const fs = require('fs');

const babelrc = JSON.parse(fs.readFileSync(path.resolve('.babelrc'), 'utf-8'));

module.exports = {
  /* Vue所在的目錄 */
  srcDir: 'src/',
  /* Headers of the page */
  head: {
    title: 'Skyid',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Skyid' },
    ],
    link: [
      // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css', defer: true },
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
    script: [
      // { src: 'https://dcp.meshplus.com.tw/v1/meshpxl.min.js', async: true },
    ],
  },
  /* 是否暫存 (預設是15min) */
  cache: false,

  /* 是否要SSR，預設是universal(有) */
  // mode: 'spa',

  // 是否要禁止preload (看不出來有差別)
  // resourceHints: false,

  /* 所有router都會用到的middleware */
  router: {
    middleware: [],
    // scrollBehavior: (to, from, savedPosition) => {
    //   if (savedPosition) {
    //     return savedPosition;
    //   }
    //   if (to.hash) {
    //     return { selector: to.hash };
    //   }
    //   return { x: 0, y: 0 };
    // },
  },
  /* Customize the progress bar color */
  loading: { color: '#3B8070' },

  /* 引用全局的css */
  css: [
    // 'assets/stylus/app.styl',
    // 'assets/css/pretty-checkbox.min.css',
    // 'flatpickr/dist/flatpickr.min.css',
    // 'flatpickr/dist/themes/dark.css',
  ],

  modules: [
    // 'bootstrap-vue/nuxt',
  ],
  // bootstrapVue: {
  //   componentPlugins: [
  //     'ModalPlugin', 'CollapsePlugin', 'DropdownPlugin',
  //   ],
  //   directivePlugins: [],
  //   components: [],
  //   directives: [],
  // },
  styleResources: {
    sass: [],
    less: [],
    // stylus: ['./src/assets/css/common.styl'],
  },

  /* Build configuration */
  build: {
    babel: {
      plugins: babelrc.plugins,
      env: babelrc.env,
      // Nuxt目前還是使用core-js 2的版本，有時會跟一些已經使用core-js 3的版本衝突，所以需要指定core-js版本為3
      presets({ isServer }) {
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 },
            },
          ],
        ];
      },
    },
    // babel: { configFile: './.babelrc' },
    extractCSS: true,
  },
  /* 在root app啟動前，執行plugins裡的東西 */
  plugins: [
    { src: '~/plugins/SKGQL', mode: 'client' },
    { src: '~/plugins/SKAPI', mode: 'client' },
    // { src: '~/plugins/component', mode: 'client' },
    // { src: '~/plugins/swal', mode: 'client' },
    // { src: '~/plugins/dcp', mode: 'client' },
    // { src: '~/plugins/i18n' },
  ],
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_ENV: process.env.APP_ENV || 'development',
  },
};
