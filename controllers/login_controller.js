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

        // buat JWT token
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET || "rahasia", // pastikan sudah diset di .env
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};
