const plugin = (schema) => {
  schema.statics.findMany = async function findMany({
    field = '_id', ids = [], condition = {}, select = '_id',
  }) {
    console.log('findMany');
    console.log(ids);

    const oids = [...ids];
    const Model = this;
    const queries = [];

    // 把query的條件拆成30個一組，以免長度過長發生錯誤
    while (oids.length > 0) {
      const _ids = oids.splice(0, 30);
      const _condition = { ...condition };
      _condition[field] = _ids;
      const query = Model.find(_condition).select(select).lean().exec();
      queries.push(query);
    }

    // 執行完畢後彙整全部的資料
    const rs = await Promise.all(queries);
    let result = [];
    rs.forEach((v) => {
      result = [...result, ...v];
    });
    return result;
  };
};

module.exports = plugin;
