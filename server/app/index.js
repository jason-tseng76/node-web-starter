/* eslint global-require:0 */
const { Nuxt, Builder } = require('nuxt');
const http404 = require('~server/module/errorHandler/http404');
const http500 = require('~server/module/errorHandler/http500');
const errorMiddleware = require('~server/module/errorHandler/errorMiddleware');
const nuxtConfig = require('~root/nuxt.config.js');

// 如果command line有帶'-server'參數，就跳過nuxt的build (純粹加速後端開發debug用)
let noBuild = false;
process.argv.forEach((v) => {
  if (v === '-server') noBuild = true;
});

module.exports = (app) => {
  // app.use(express.static(path.join(__dirname, '../public')));
  // app.use('/css', express.static(path.join(__dirname, '../../static/css')));

  app.use((req, res, next) => {
    const lang = req.acceptsLanguages('zh', 'en') || 'en';
    res.locals.__lang = lang;

    next();
  });

  // 套用GraphQL
  require('./gql/1.0')(app);
  // 套用router
  require('./router/1.0')(app);

  // require('~root/server/app/controller/1.0/account/defaultSu').check();

  // Nuxt要最後掛，否則其它router都會被Nuxt擋住，變成404
  const nuxt = new Nuxt(nuxtConfig);
  if (process.env.NODE_ENV !== 'production') {
    const builder = new Builder(nuxt);
    if (!noBuild) builder.build();
  }
  app.use(nuxt.render);

  app.use(http404);
  // 在500之前加入自行定義的錯誤處理middleware
  app.use(errorMiddleware);
  app.use(http500);
};
