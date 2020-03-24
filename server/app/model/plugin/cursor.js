const plugin = (schema, options) => {
  schema.statics.cursor = async function cursor({
    find = {}, select = '', sort = '-_id', first = 0, after = '', last = 0, before = '',
  }) {
    const Model = this;

    let firstNum = (first === undefined || first === null) ? 0 : first;
    if (Number.isNaN(Number(firstNum))) firstNum = 0;
    let lastNum = (last === undefined || last === null) ? 0 : last;
    if (Number.isNaN(Number(lastNum))) lastNum = 0;
    // 如果first及last都是0，就預設first 10
    if (firstNum <= 0 && lastNum <= 0) firstNum = 10;

    // 取得cursor從base64 decode之後的真正值
    let field_id = '';
    if (firstNum > 0) {
      field_id = after ? Buffer.from(after, 'base64').toString() : '';
      lastNum = 0;
    } else if (lastNum > 0) {
      field_id = before ? Buffer.from(before, 'base64').toString() : '';
    }

    // 排序的欄位
    const field = sort.split(' ')[0].replace('-', '');
    const fieldSort = sort.indexOf('-') === 0 ? -1 : 1;

    let realSort = sort;

    // 因為cursor是依照field的值來做排序，所以如果select裡沒有該欄位，就需要把它加到select裡
    let realSelect = select;
    if (realSelect.indexOf(field) < 0) {
      if (realSelect !== '') realSelect += ' ';
      realSelect += field;
    }

    let limitNum = firstNum + 1;
    const condition = { ...find };

    if (firstNum > 0 && field_id) {
      if (fieldSort === -1) {
        condition[field] = { $lt: field_id };
      } else {
        condition[field] = { $gt: field_id };
      }
    }
    if (lastNum > 0) {
      limitNum = lastNum + 1;
      if (fieldSort === -1) {
        realSort = field;
        if (field_id) condition[field] = { $gt: field_id };
      } else {
        realSort = `-${field}`;
        if (field_id) condition[field] = { $lt: field_id };
      }
    }

    const edges = [];
    const pageInfo = {};

    const rs = await Model.find(condition).sort(realSort).select(realSelect).limit(limitNum)
      .lean()
      .exec();

    if (rs.length >= limitNum + 1) {
      rs.pop();
      pageInfo.hasNextPage = true;
    } else {
      pageInfo.hasNextPage = false;
    }

    if (lastNum > 0) {
      rs.sort((a, b) => {
        if (a[field].toString() > b[field].toString()) return fieldSort;
        if (a[field].toString() < b[field].toString()) return -fieldSort;
        return 0;
      });
    }

    rs.forEach((v, index) => {
      let cursorStr = '';
      try {
        // 如果是JS Date，轉成time
        cursorStr = Buffer.from(v[field].getTime().toString()).toString('base64');
      } catch (e) {
        cursorStr = Buffer.from(v[field].toString()).toString('base64');
      }

      edges.push({
        node: v,
        cursor: cursorStr,
      });

      if (firstNum > 0 && index === first - 1 && pageInfo.hasNextPage) {
        pageInfo.endCursor = cursorStr;
      }
      if (lastNum > 0 && index === 0 && pageInfo.hasNextPage) {
        pageInfo.endCursor = cursorStr;
      }
    });

    return { edges, pageInfo };
  };
};

module.exports = plugin;
