const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// ─── Import Routes ───
const userRoutes = require('./routes/userRoutes');

// ─── Import Middleware ───
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');

const app = express();

// ─── Rate Limiter ───
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests. Try again after 5 minutes.' }
});

// ─── Middleware ───
app.use(cors());
app.use(morgan('short'));
app.use(requestLogger);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(hpp());

// ─── Remove Fingerprinting ───
app.use(function(req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
});

// ─── Serve Frontend ───
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Routes ───
app.use('/api/users', userRoutes);

// ─── Health Check ───
app.get('/api/health', function(req, res) {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// ─── Error Handling ───
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

let server;

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(function() {
        console.log('✅ Connected to MongoDB');
        console.log('📁 Database: StudentDB');
        server = app.listen(PORT, function() {
            console.log('\n🚀 Server on http://localhost:' + PORT);
            console.log('📚 API: http://localhost:' + PORT + '/api/users');
            console.log('❤️ Health: http://localhost:' + PORT + '/api/health');
            console.log('🛡️ Rate Limiter: 100 requests per 5 minute(s) per IP\n');
        });
    })
    .catch(function(err) {
        console.error('❌ MongoDB Error:', err.message);
    });

// ─── Graceful Shutdown ───
const gracefulShutdown = async function(signal) {
    console.log('\n⚠️ Received ' + signal + '. Shutting down...');
    setTimeout(function() {
        process.exit(1);
    }, 10000);
    if (server) server.close();
    await mongoose.disconnect();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
};

process.on('SIGINT', function() {
    gracefulShutdown('SIGINT');
});

process.on('SIGTERM', function() {
    gracefulShutdown('SIGTERM');
});