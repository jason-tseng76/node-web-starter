const validator = require('validator');
const { DateTime } = require('luxon');

const vcheck = {};

/**
 * 轉換成字串，undefined或null都會變成空字串。
 *
 * @param {String} str - 來源字串
 * @returns {String} result string
*/
vcheck.str = (str) => {
  let rs = '';
  if (str === undefined || str === null) return '';
  rs = str.toString().trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  return rs;
};

/**
 * 轉換成字串，如果字串裡有【非英文字母或數字】，則回傳空字串。
 *
 * @param {String} str - 來源字串
 * @returns {String} result string
*/
vcheck.alphanumeric = (str) => {
  const rs = vcheck.str(str);
  if (!validator.isAlphanumeric(rs)) return '';
  return rs;
};

/**
 * 轉換成字串，字串裡只能有【英文字母、數字、、以及_ @ . -】，否則回傳空字串。
 *
 * @param {String} str - 來源字串
 * @returns {String} result string
*/
vcheck.normalStr = (str) => {
  const rs = vcheck.str(str);
  const regexp = '([^a-zA-Z0-9_@.-])';
  const reg = new RegExp(regexp);
  if (reg.test(rs)) return '';
  return rs;
};

/**
 * 轉換成數字，如果非數字，會回傳NaN。
 *
 * @param {String|Number} str - 來源字串或數字
 * @returns {Number} result
*/
vcheck.number = (str) => {
  const rs = vcheck.normalStr(str);
  if (rs === '') return NaN;
  return Number(rs);
};

/**
 * 轉換成email，如果是不合法的格式，則回傳空字串。
 *
 * @param {String} str - 來源字串
 * @returns {String} result
*/
vcheck.email = (str) => {
  const rs = vcheck.normalStr(str);
  if (validator.isEmail(rs)) return rs;
  return '';
};

/**
 * 轉換成mongoID，如果是不合法的格式，則回傳空字串。
 *
 * @param {String} str - 來源字串
 * @returns {String} result
*/
vcheck.mongoID = (str) => {
  const rs = vcheck.str(str);
  if (validator.isMongoId(rs)) return rs;
  return '';
};

/**
 * 轉換成url，如果是不合法的格式，則回傳空字串。
 *
 * - 參數:
 *  - str: 來源網址
 *  - options: 額外參數
 *    - localhost: 是否允許'localhost'，預設true
 *    - wildcard: 是否允許子網域有*，預設false
 *    - protocols: 允許的protocal，預設為['http','https']
 *
 * @param {String} str - 來源網址
 * @param {Object} options - 參數
 * @param {Boolean} options.localhost - 是否允許'localhost'，預設true
 * @param {Boolean} options.wildcard - 是否允許子網域有*，預設false
 * @param {String[]} options.protocols - 允許的protocal，預設為['http','https']
 * @returns {String} result
*/
vcheck.url = (str, { localhost = true, wildcard = false, protocols = ['http', 'https'] } = {}) => {
  const protocolsAllow = Array.isArray(protocols) ? protocols.map((v) => v.toString()) : ['http', 'https'];
  const rs = vcheck.str(str);
  let protocol = '';
  let tmpurl = rs;
  if (rs.indexOf('://') > 0) {
    if (rs.split('://').length > 2) return '';
    [protocol, tmpurl] = rs.split('://');
  }

  const ns = tmpurl.split('.');
  const globalNames = ['com', 'gov', 'org', 'co', 'idv'];

  if (tmpurl.indexOf('*') >= 0) {
    if (!wildcard) return '';
    // 不允許除了subdomain以外的*
    if (tmpurl.indexOf('*') > 0) return '';
    // 不允許*後面不是接.
    if (tmpurl.match(/\*(?!\.)/)) return '';
    // 不允許 *.com 或 *.tw 這種沒有主domain的網域
    if (ns.length <= 2) return '';
    // 不允許 *.com.tw 或 *.co.jp 或 *.org.tw 這種沒有主domain的網域
    if (globalNames.includes(ns[1])) return '';

    tmpurl = tmpurl.replace('*', 'star');
  } else if (globalNames.includes(ns[0])) return '';

  if (localhost) {
    if (tmpurl.indexOf('localhost') === 0) tmpurl = tmpurl.replace('localhost', 'test.com');
  }

  if (validator.isURL(protocol ? `${protocol}://${tmpurl}` : tmpurl, { protocols: protocolsAllow })) return rs;
  return '';
};

/**
 * 轉換成Boolean，預設除了1,'1','true',或true，都返回false
 *
 * - 參數:
 *  - str: 來源字、數字、Boolean
 *  - restrict: 如果是false，除了0,'0','false',false,或''，其餘都返回true。預設true。
 *
 * @param {String|Number|Boolean} str - 來源字、數字、Boolean
 * @param {Boolean=} restrict - 如果是false，除了0,'0','false',false,或''，其餘都返回true。預設true。
 * @returns {Boolean} result
*/
vcheck.boolean = (str, restrict = true) => {
  if (str === undefined) return false;
  return validator.toBoolean(str.toString(), restrict);
};

/**
 * 轉換成Luxon的DateTime。
 * 傳入的obj可以是JS Date或ISO String，或是物件(請參考Luxon的DateTime建構說明)
 *
 * @param {Object|Date|String} obj - 可以是Object、JS Date或String
 * @return {DateTime} result
*/
vcheck.luxon = (obj, fmt) => {
  if (Object.prototype.toString.call(obj) === '[object Date]') return DateTime.fromJSDate(obj);
  if (typeof obj === 'object') return DateTime.fromObject(obj);
  const rs = vcheck.str(obj);
  if (fmt) return DateTime.fromFormat(obj, fmt);
  return DateTime.fromISO(rs);
};

/**
 * 轉換成json，轉換出來的物件會是原物件的deep copy。失敗的話會回傳null。
 *
 * @param {Object|String} obj - 來源物件或字串
 * @return {Object} result
*/
vcheck.json = (obj) => {
  try {
    if (typeof obj === 'string') return JSON.parse(obj);
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return null;
  }
};

/**
 * 轉換成Array，轉換出來的物件會是原物件的deep copy。如果不是Array的話會回傳null。
 *
 * @param {Array|String} obj - 來源Array或字串
 * @return {Array} result
*/
vcheck.array = (obj) => {
  const tmp = vcheck.json(obj);
  if (!Array.isArray(tmp)) return null;
  return tmp;
};

/**
 * 過濾掉危險的Regex，用來保護資料庫避免惡意query。
 *
 * @param {String} str - 來源字串
 * @return {String} result
*/
vcheck.escapeRegex = (str) => {
  const rs = vcheck.str(str);
  return rs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 將 <, >, &, ', " 以及 / 取代成HTML編碼
 *
 * @param {String} str - 來源字串
 * @return {String} result
*/
vcheck.escape = (str) => validator.escape(vcheck.str(str));

module.exports = { ...validator, ...vcheck };
