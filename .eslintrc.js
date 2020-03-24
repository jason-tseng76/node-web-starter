module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: ['airbnb-base', 'plugin:vue/recommended'],
  settings: {
    // 使用在.babelrc設定的alias
    'import/resolver': {
      'babel-module': {
        // 不知道為何在某次更新package時故障了，只好自己寫alias
        alias: {
          '~': './src',
          '~root': './',
          '~server': './server',
        },
      },
    },
    // 加入core-modules，import時才不會報錯(nuxtjs內建vue與vuex)
    'import/core-modules': ['vue', 'vuex'],
  },
  // required to lint *.vue files
  plugins: ['vue'],
  // custom rules here
  rules: {
    'no-underscore-dangle': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-throw-literal': 0,
    // max-len很煩，雖然取消，但還是盡量遵守比較好
    'max-len': 0,
    camelcase: 0,
  },
  globals: {
    // $: true,
  },
};
