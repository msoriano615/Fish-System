class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle duplicate key errors (MongoDB)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;
    }

    // Handle Mongoose Validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors);
        const messages = errors.map(e => e.message);
        message = messages.join(', ');
    }

    // Handle invalid ObjectId errors
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
}

function notFound(req, res, next) {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

function catchAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
}

module.exports = { errorHandler, notFound, catchAsync, AppError };