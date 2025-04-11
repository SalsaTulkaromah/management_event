const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

exports.verifyHeader = function (req, res, next) {
    try {
        const expectedHeaderValue = process.env.X_PERTAMEDIKA_KEY; // Nilai yang diharapkan
        const headerValue = req.get('X-PERTAMEDIKA-KEY'); // Mengambil nilai header dari request

        // Menetapkan header jika belum ada
        if (!headerValue) {
            return res.status(400).json({message : "Bad Request - Header Key is required",code : 400});
        }

        // Melakukan validasi
        if (headerValue !== expectedHeaderValue) {
            return res.status(401).json({message : "Unauthorized - Invalid Header Value",code : 401});
        }

        next();
        
    } catch (error) {
        res.status(403).json({ 
            message: "Forbidden",
            code : 403,
            error : error
        });
    }
    
}