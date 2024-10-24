class CustomError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message); // Call the parent class constructor (Error)
        this.statusCode = statusCode;

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;

        // Capture the stack trace (helps with debugging)
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;
