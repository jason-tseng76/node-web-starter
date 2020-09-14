const { ApolloServer } = require('apollo-server-express');
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas');
const path = require('path');
const skCors = require('../../middleware/skCors');
const skRateLimit = require('~server/app/middleware/skRatelimit');
const SKError = require('~server/module/errorHandler/SKError');
const auth = require('./directive/auth');
const queryNumber = require('./directive/queryNumber');

const apply = (app) => {
  // 合併typedef與resolver
  const typesArray = fileLoader(path.join(__dirname, 'typedef'), { recursive: true });
  const typeDefs = mergeTypes(typesArray);
  const resolversArray = fileLoader(path.join(__dirname, 'resolver'), { recursive: true });
  const resolvers = mergeResolvers(resolversArray);

  const apolloOption = {
    typeDefs,
    resolvers,

    // tracing: true,
    // cacheControl: { // 加這個tracing才會有效
    //   defaultMaxAge: 30 * 1000,
    //   calculateHttpHeaders: false,
    //   stripFormattedExtensions: false,
    // },

    debug: false, // 關閉詳細的stack

    // __schema及playground是否可以使用(預設為true)
    // 若 NODE_ENV=production 則自動為 fasle，如果要強制打開就設為true
    // introspection: true,
    // playground: true,

    // 加入directives
    schemaDirectives: {
      auth,
      queryNumber,
    },

    context: async ({ req, res }) => {
      const __context = {
        dataloaders: {},
        req,
        res,
        // 統一處理錯誤的方式
        // resolver可以呼叫context.throw拋出錯誤
        // 把這個方式獨立出來的原因是為了要讓錯誤訊息可以方便的使用多國語言
        // 因為只有這裡可以接觸到res，取得使用者的語系
        throw: (e) => {
          let newError = e;
          if (e instanceof Error) {
            if (e instanceof SKError) {
              newError = e.toLang(res.locals.__lang || 'zh');
            }
          } else {
            newError = new Error(e);
          }
          throw newError;
        },
      };
      return __context;
    },

    /*
    把errors裡的錯誤統一格式：
    {
      message: 'message',
      path: '第一個path',
      code: '如果是SKError，回傳錯誤碼'
    }
    */
    formatError: (err) => {
      const res = { message: err.message, path: (err.path || [])[0] };
      if (err.extensions.exception && err.extensions.exception.code) {
        res.code = err.extensions.exception.code;
      }
      return res;
    },

    /*
    把相同path簡化成一條 (path原本是array，不過為了簡化，使用formatError只取出第一層的path)
    並將對應的data資料設成null
    */
    formatResponse: (response /* , context */) => {
      if (response.errors && response.errors.length > 0) {
        const errors = [];
        const { data } = response;
        response.errors.forEach((v) => {
          data[v.path] = null;
          const found = errors.find((f) => f.path === v.path);
          if (!found) errors.push(v);
        });
        return {
          data,
          errors,
        };
      }
      return response;
    },
  };

  const apollo = new ApolloServer(apolloOption);

  // 套用cors
  const cors = skCors(['http://localhost:8080']);
  app.options('/gql/v1.0', cors);
  app.use('/gql/v1.0', cors);

  const limiter1 = skRateLimit({ windowMs: 1000 * 60, max: 50 });
  app.use('/gql/v1.0', limiter1);

  apollo.applyMiddleware({
    app,
    path: '/gql/v1.0',
    cors: {
      origin: true,
      credentials: true,
    },
  });
};

module.exports = apply;
