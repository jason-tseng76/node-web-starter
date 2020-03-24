const errorCodes = require('~server/module/errorHandler/errorCodes');

class SKError extends Error {
  constructor(code, texts = []) {
    super(code);

    this.code = code;
    this.texts = (Array.isArray(texts) ? texts : [texts]);

    const errobj = errorCodes.get(code);
    this.httpStatus = errobj.http;
    this.message = errorCodes.toMessage(errobj, texts);

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }

  toLang(lang = 'zh') {
    const msg = errorCodes.codeMessage(this.code, this.texts, lang);
    this.message = msg;
    return this;
  }
}

module.exports = SKError;
