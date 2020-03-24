const async = require('async');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const events = require('events');

const emitter = new events.EventEmitter();
let storage;
let bucket;
let _rPath;
let _logPath;

// 把local的log file檔名轉換成GCS上存檔的路徑
// 從檔名拆解出日期與小時，遠端儲存時以 【日期】/【小時】/ 的目錄結構儲存檔案
const parseRemoteFilePath = (logfileName, remoteBaseDir) => {
  const names = logfileName.split('.');
  let datestr = names[names.length - 2];
  if (!Number.isNaN(Number(datestr))) datestr = names[names.length - 3];

  const dates = datestr.substr(0, 10);
  const hour = datestr.substr(11);

  return `${remoteBaseDir}/${dates}/${hour}/${logfileName}`;
};

// 比較兩個檔案的大小
// const compareFileSize = async (localFileName, remoteFileName) => {
//   const localfile = fs.statSync(localFileName);
//   let rf;
//   try {
//     rf = await bucket.file(remoteFileName).getMetadata();
//   } catch (e) {
//     throw new Error(`GCS ${remoteFileName} not exist`);
//   }
//   const remotefile = rf[0];
//   if (Number(localfile.size) !== Number(remotefile.size)) throw new Error(`${localFileName}[${localfile.size}] size not equal to ${remoteFileName}[${remotefile.size}]`);
// };

const uploadLogs = (filepath, files) => new Promise((resolve, reject) => {
  if (files.length === 0) {
    resolve();
    return;
  }
  async.eachLimit(files, 5, async (f) => {
    const localFileName = path.join(filepath, f);
    const remoteFileName = parseRemoteFilePath(f, _rPath);

    const localStat = fs.statSync(localFileName);
    await bucket
      .upload(localFileName, { destination: remoteFileName });

    // 確認遠端的log檔案大小跟本機的一樣
    const rf = await bucket.file(remoteFileName).getMetadata();
    const remoteStat = rf[0];
    if (Number(localStat.size) !== Number(remoteStat.size)) throw new Error(`${localFileName}[${localStat.size}] size not equal to ${remoteFileName}[${remoteStat.size}]`);
  }, (err) => {
    if (err) {
      // 重新產生Error (主要是希望能產生新的stack，方便知道這Error是哪裡噴出來的)
      reject(new Error(`[E011005] Write to GCS failure : ${err.message}`));
    } else {
      resolve();
    }
  });
});

let lastcheck = (new Date()).getTime();
let timer = 0;

// 先檢查GCS上與本機的log是否同步
// 如果有不同步的，就把本機log上傳GCS
const precheck = () => new Promise(async (resolve, reject) => {
  try {
    if (!fs.existsSync(_logPath)) {
      resolve();
      return;
    }
    const allfiles = fs.readdirSync(_logPath);

    for (let i = 0; i < allfiles.length; i += 1) {
      const v = allfiles[i];
      const localFileName = path.join(_logPath, v);
      const remoteFileName = parseRemoteFilePath(v, _rPath);
      let toupload = false;

      // 檢查是否有檔案跟GCS不同步，有的話就設為toupload=true，準備上傳到GCS
      try {
        const localStat = fs.statSync(localFileName);
        const rf = await bucket.file(remoteFileName).getMetadata();
        const remoteStat = rf[0];
        if (Number(localStat.size) !== Number(remoteStat.size)) throw new Error(`${localFileName}[${localStat.size}] size not equal to ${remoteFileName}[${remoteStat.size}]`);
        // await compareFileSize(localFileName, remoteFileName);
      } catch (err) {
        emitter.emit('warn', new Error(err.message));
        toupload = true;
      }

      if (toupload) {
        try {
          await bucket
            .upload(localFileName, { destination: remoteFileName });
        } catch (err) {
          emitter.emit('error', new Error(err.message));
        }
      }
    }

    resolve();
  } catch (e) {
    reject(e);
  }
});

const checkLog = async () => {
  clearTimeout(timer);
  try {
    const toUpload = [];
    // 紀錄目前的檢查時間
    const ntime = (new Date()).getTime();
    // 檢查log目錄下的檔案修改時間比目前時間還新的
    // 是的話就列入上傳的名單
    fs.readdirSync(_logPath).forEach((v) => {
      const stats = fs.statSync(path.join(_logPath, v));
      if (stats.mtimeMs > lastcheck || stats.ctimeMs > lastcheck) {
        toUpload.push(v);
      }
    });
    await uploadLogs(_logPath, toUpload);

    // 上傳確認無誤後才改寫檢查的更新時間
    lastcheck = ntime;
  } catch (e) {
    emitter.emit('error', e);
  }
  timer = setTimeout(checkLog, 1000 * 10);
};

const __export = {
  // 開始啟動log備份程序
  start: ({
    logPath, projectId, keyFilename, bucketName, remotePath,
  } = {}) => {
    try {
      _logPath = logPath;
      _rPath = remotePath;
      storage = new Storage({
        projectId,
        keyFilename,
      });
      bucket = storage.bucket(bucketName);

      setTimeout(() => {
        precheck().catch((err) => {
          emitter.emit('warn', err);
        });
        setTimeout(checkLog, 1000 * 10);
      }, 1000 * 5);
    } catch (e) {
      emitter.emit('error', new Error(e.message));
      // throw e;
    }
    return __export;
  },

  // 註冊錯誤監聽事件
  on: (type, callback) => {
    emitter.on(type, callback);
    return __export;
  },
  off: (type, callback) => {
    emitter.removeListener(type, callback);
    return __export;
  },
};

module.exports = __export;
