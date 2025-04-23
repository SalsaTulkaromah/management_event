const jwt = require("jsonwebtoken");
const db = require('../libs/db');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

exports.loginManagementEvent = async function (req, res) {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM tbl_login WHERE email = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(200).json({
                success: false,
                message: "Pengguna tidak ditemukan",
            });
        }

        if (user.password !== password) { // GANTI dengan hash password jika pakai bcrypt
            return res.status(200).json({
                success: false,
                message: "Password salah",
            });
        }

        const accessToken = jwt.sign({username},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '1d'
        })
        res.clearCookie('event_objectCookie');
        res.clearCookie('accessToken');

        var object = {
            "email" : user.email,
            "role" :user.role,
            "fullname" : user.fullname,
            "token" : accessToken
        }

        res.cookie('event_objectCookie', object,{
            httpOnly: true,
            maxAge : 24 * 60 * 60 * 1000 //5*1000 //
            // secure: true
        });

        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            accessToken,
            user: { id: user.id, email: user.email, role: user.role, fullname: user.fullname }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};