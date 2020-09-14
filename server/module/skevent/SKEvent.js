class SKEvent extends Error {
  constructor(type, data) {
    super(type);

    this.type = type;
    this.data = data;

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = SKEvent;
