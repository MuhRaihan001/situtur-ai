exports.GET = function (req, res, next) {
    // Biarkan React SPA menangani rute ini jika request adalah HTML
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return next();
    }
    
    res.json({
        success: true,
        message: "Situtur AI - Homepage API"
    });
};