const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { catchAsync, AppError } = require('./errorHandler');

// ─── Protect Routes ───
const protect = catchAsync(async function(req, res, next) {

    // Check if token exists in the request header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('You are not logged in. Please log in to continue.', 401);
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
        throw new AppError('User no longer exists', 401);
    }

    // Attach user to request
    req.user = user;
    next();
});

module.exports = { protect };