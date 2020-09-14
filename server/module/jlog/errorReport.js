const { ErrorReporting } = require('@google-cloud/error-reporting');
const skevent = require('~server/module/skevent');

let errors;

/**
 shortUrlMen
 =Ms2cnPW6&L7Kwa8yxA6D]
 =Ms2cnPW6&L7Kwa8yxA6D]
Sample params:
  serviceContext: {
    service: 'SkyID',
    version: process.env.APP_ENV,
  },
  projectId: 'meshplus',
  keyFilename: './server/MeshPlus-27b4a8e9ee7a.json',
  reportMode: 'production', // always, never
*/
const init = (params = {}) => {
  errors = new ErrorReporting(params);
};

const report = (e) => {
  try {
    if (errors) {
      errors.report(e);
      console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '===== /jlog/errorReport =====');
      console.log('\x1b[1m\x1b[31m%s', e);
      console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '=============================');
    }
  } catch (err) { /* */ }
};

skevent.on(skevent.types.REPORT_ERROR, (e) => {
  report(e.data);
});
// event.dispatcher.on(event.type.REPORT_ERROR, (e) => {
//   report(e);
// });

module.exports = {
  init,
  report,
};
