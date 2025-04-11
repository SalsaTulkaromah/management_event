const jwt = require("jsonwebtoken");
var errorLog = require('../controllers/logger_controller').errorlog;
exports.verifyToken = function (req, res, next) {
    try {
        var tokenJWT = "";
        
        // tokenCookie = cookies.accessToken;
        const authHeader = req.headers['authorization'];
        tokenJWT = authHeader && authHeader.split(' ')[1];
        if (tokenJWT == null ) {
            res.status(401).json({ 
                message: "Anda tidak di izinkan untuk mengakses halaman ini.",
                code : 401
            });
        }else{
            if (tokenJWT == "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"){
                //req.userdata = decoded;
                // console.log(req.userdata);
                next();
            }else{
                jwt.verify(tokenJWT, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
                    if (err) {
                        res.status(403).json({ 
                            message: "Session anda telah habis, silahkan login kembali,",
                            code : 403
                        });
                    }else{
                        req.userdata = decoded;
                        // console.log(decoded);
                        next();
                    }
                    
                })
            }
        }
        
    } catch (error) {
        errorLog.error('login_controller.login query error  : ', error);
        res.status(403).json({ 
            message: "Forbidden",
            code : 403
        });
    }
    
}
// export const verifyToken = (req, res, next) => {
//     const authHeader = req.authHeader['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token == null) return res.sendStatus(401);
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
//         if (err) return res.senStatus(403);
//         req.userid = decoded.userid;
//         next();
//     })
// }