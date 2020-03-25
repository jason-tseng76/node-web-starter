const crypto = require('crypto');
const vcheck = require('./vcheck');

const fn = {};

/**
 * 產生亂數字串，產生的字元預設為[a-zA-Z0-9]。
 *
 * @param {Number} length - 產生的字串長度，預設為10
 * @param {String} addchars - 除了預設的字元以外，還要加入的字元組
 * @returns {String} result string
*/
fn.randomStr = (length = 10, addchars = '') => {
  let allowstr = '';
  for (let i = 0; i < 26; i += 1) {
    allowstr += String.fromCharCode(97 + i);
    allowstr += String.fromCharCode(65 + i);
  }
  allowstr += `0123456789${addchars}`;
  let id = '';
  while (id.length < length) {
    const ra = Math.floor(Math.random() * allowstr.length);
    id += allowstr.substr(ra, 1);
  }
  return id;
};

/**
 * 依照timestamp加上亂數產生ID，長度最少為15。
 *
 * @param {Number} length - 產生的字串長度，預設為15，不可低於15
 * @returns {String} result string
*/
fn.newID = (length = 15) => {
  let len = length < 15 ? 15 : length;
  const timestamp = new Date().getTime().toString(36);
  len -= timestamp.length;
  const rand = fn.randomStr(len);
  return `${timestamp}${rand}`;
};

/**
 * 依照傳入字串產生可驗證ID，驗證碼會加在原始字串後，共三碼。
 *
 * 要驗證該ID是否正確，使用verifyVaID進行驗證。
 *
 * @param {String} origin_id - 原始字串
 * @returns {String} result string
*/
fn.newVaID = (origin_id) => {
  let sum = 0;
  for (let i = 0; i < origin_id.length; i += 1) {
    sum += origin_id.charCodeAt(i);
  }
  sum += sum % 10;
  let ext = sum.toString(36).substr(0, 3);
  if (ext.length < 3) ext = `0${ext}`;
  return `${origin_id}${ext}`;
};

/**
 * 驗證是否由newVaID所產生的ID。
 *
 * @param {String} vaid - 輸入字串
 * @returns {Boolean} result
*/
fn.verifyVaID = (vaid) => {
  const pre = vaid.substr(0, vaid.length - 3);

  const regen = fn.newVaID(pre);
  return vaid === regen;
};

/**
 * 對字串進行MD5加密。
 *
 * @param {String} str - 輸入字串
 * @returns {String} result
*/
fn.md5 = (str) => {
  const newstr = vcheck.str(str);
  if (newstr === '') return '';
  const md5 = crypto.createHash('md5');
  return md5.update(newstr).digest('hex');
};

// 將敏感資料中間的字元用o取代
fn.hashName = (param, replace = '○') => {
  const str = vcheck.str(param);
  if (str === '') return '';
  if (str.length <= 2) return `${str.substr(0, 1)}${replace}`;
  const cut = Math.floor(str.length / 3);
  let bstr = str.substr(0, cut);
  const estr = str.substr(str.length - cut);
  while (bstr.length + estr.length < str.length) {
    bstr += replace;
  }
  bstr += estr;
  return bstr;
};

// 將email@之後的字元用o取代
fn.hashEmail = (param, replace = '○') => {
  const str = vcheck.str(param);
  if (!vcheck.email(str)) return '';
  const sarray = str.split('@');
  const cut = Math.ceil(sarray[0].length / 3);
  let out = sarray[0].substr(0, (sarray[0].length - cut));
  for (let i = 0; i < cut; i += 1) {
    out += replace;
  }
  out += '@';
  out += fn.hashName(sarray[1], replace);
  return out;
};

fn.clientIP = (req) => {
  const ip = req.headers['x-forwarded-for']
    || req.connection.remoteAddress
    || req.socket.remoteAddress
    || req.connection.socket.remoteAddress;
  return ip.split(',')[0];
};

fn.datesBetween = (startDate, endDate) => {
  const dates = [];
  const eDate = vcheck.luxon(endDate);
  let dateCursor = vcheck.luxon(startDate);
  while (dateCursor <= eDate) {
    dates.push(dateCursor.toFormat('yyyy-MM-dd'));
    dateCursor = dateCursor.plus({ days: 1 });
  }
  return dates;
};

// 傳入多個array，並指定keyfield(非必要)
// 回傳一個keyfield為unique的array
// 如果沒有指定keyfield，直接比對陣列值
fn.arrayUnique = (arrays = [], keyfield) => {
  const obj = {};
  const result = [];
  arrays.forEach((ar) => {
    const arCopy = vcheck.array(ar) || [];
    arCopy.forEach((v) => {
      let keyvalue = v;
      if (keyfield) keyvalue = v[keyfield];
      if (keyvalue && !obj[keyvalue]) {
        obj[keyvalue] = true;
        result.push(v);
      }
    });
  });

  return result;
};

module.exports = fn;
