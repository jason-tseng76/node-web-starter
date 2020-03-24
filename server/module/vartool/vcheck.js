const validator = require('validator');
const { DateTime } = require('luxon');

const vcheck = { ...validator };

vcheck.str = (str) => {
  let rs = '';
  if (str === undefined || str === null) return '';
  // rs = str.toString().trim().split(String.fromCharCode(8203)).join('');
  rs = str.toString().trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  return rs;
};

/* 只有英文字母跟數字 */
vcheck.alphanumeric = (str) => {
  const rs = vcheck.str(str);
  if (!validator.isAlphanumeric(rs)) return '';
  return rs;
};

/* 只有英文字母、數字、以及_ @ . - */
vcheck.normalStr = (str) => {
  const rs = vcheck.str(str);
  const regexp = '([^a-zA-Z0-9_@.-])';
  const reg = new RegExp(regexp);
  if (reg.test(rs)) return '';
  return rs;
};

vcheck.number = (str) => {
  const rs = vcheck.normalStr(str);
  if (rs === '') return NaN;
  return Number(rs);
};

vcheck.email = (str) => {
  const rs = vcheck.normalStr(str);
  if (validator.isEmail(rs)) return rs;
  return '';
};

vcheck.mongoID = (str) => {
  const rs = vcheck.str(str);
  if (validator.isMongoId(rs)) return rs;
  return '';
};

vcheck.url = (str, { noLocalhost } = { noLocalhost: true }) => {
  const rs = vcheck.str(str);
  const varray = rs.split('*');
  if (varray.length === 2) {
    if (varray[1].substr(0, 1) !== '.'
      || !(varray[0] === 'http://' || varray[0] === 'https://' || varray[0] === '')) {
      return '';
    }
  }

  let tmp = rs.replace('*', 'www');
  if (!noLocalhost) {
    if (tmp.indexOf('localhost') === 0 || tmp.indexOf('http://localhost') === 0 || tmp.indexOf('https://localhost') === 0) {
      tmp = tmp.replace('localhost', 'www.test.com');
    }
  }
  if (validator.isURL(tmp)) return rs;
  return '';
};

/* 除了'1'或true，都返回false */
vcheck.boolean = (str, restrict = true) => {
  if (str === undefined) return false;
  return validator.toBoolean(str.toString(), restrict);
};

vcheck.luxon = (str, fmt) => {
  if (Object.prototype.toString.call(str) === '[object Date]') return DateTime.fromJSDate(str);
  if (typeof str === 'object') return DateTime.fromObject(str);
  const rs = vcheck.str(str);
  if (fmt) return DateTime.fromFormat(str, fmt);
  return DateTime.fromISO(rs);
};

vcheck.json = (obj) => {
  try {
    if (typeof obj === 'string') return JSON.parse(obj);
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return null;
  }
};

vcheck.array = (obj) => {
  const tmp = vcheck.json(obj);
  if (!Array.isArray(tmp)) return null;
  return tmp;
};

vcheck.escapeRegex = (str) => {
  const rs = vcheck.str(str);
  return rs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/* replace <, >, &, ', " and / with HTML entities. */
vcheck.escape = (str) => validator.escape(vcheck.str(str));

module.exports = vcheck;
