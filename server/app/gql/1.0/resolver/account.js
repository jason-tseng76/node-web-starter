const Account = require('~server/app/model/account');
const qfields = require('../util/qfields');
const SKError = require('~server/module/errorHandler/SKError');

const resolvers = {
  Query: {
    accounts: async (rootValue, args, context, info) => {
      const fields = qfields(info, '', { account_id: '_id' });

      const rs = await Account.find({}).select(fields).sort('-_id').lean()
        .exec();

      return rs.map((v) => ({ ...v, account_id: v._id }));
    },
    accountsPagenate: async (rootValue, args, context, info) => {
      const fields = qfields(info, 'data', { account_id: '_id' });
      const { offset, limit } = args;

      const rs = await Account.pagenate({
        find: {}, select: fields, offset, limit,
      });
      rs.data = rs.data.map((v) => ({ ...v, account_id: v._id.toString() }));
      return rs;
    },
    accountCursor: async (rootValue, args, context, info) => {
      const fields = qfields(info, ['edges', 'node'], { account_id: '_id' });
      const {
        first, after, last, before,
      } = args;

      const rs = await Account.cursor({
        find: {}, select: fields, first, after, last, before, sort: '-_id',
      });
      rs.edges = rs.edges.map((v) => {
        v.node.account_id = v.node._id.toString();
        return v;
      });
      return rs;
    },
  },

  Mutation: {
    createAccount: async (rootValue, args, context, info) => {
      const { email, role } = args;
      if (!email) {
        return context.throw(new SKError('E001006'));
      }
      const realRole = role || 'user';

      const rs = await Account.findOne({ email }).lean().exec();
      if (rs) {
        return context.throw(new Error('已經有了'));
      }
      const newAccount = new Account({ email, role: realRole });
      await newAccount.save();

      newAccount.account_id = newAccount._id.toString();
      return newAccount;
    },
  },
};

module.exports = resolvers;
