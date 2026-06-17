function requestLogger(req, res, next) {
    const start = Date.now();
    const clientIp = req.ip || req.socket.remoteAddress;
    console.log(`[${new Date().toISOString()}] → ${clientIp} ${req.method} ${req.url}`);

    res.on('finish', function() {
        const duration = Date.now() - start;
        const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
        console.log(`[${new Date().toISOString()}] ${statusIcon} ${clientIp} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });

    next();
}

module.exports = requestLogger;