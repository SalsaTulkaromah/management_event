const db = require('../libs/db');
const crypto = require('crypto');

// Get all patients
exports.getAllPassword = async function (req, res) {
    try {
        const result = await db.query('SELECT * FROM ms_password order by expire_date desc');
        res.status(200).json({ 
            success: true,
            message: "Success",
            data: result.rows,
            rowCount: result.rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false,
            message: "Server error",
            data: null,
            rowCount: 0
        });
    }
};

// Fungsi untuk generate password acak
function generateRandomPassword(length = 4) {
    return crypto.randomBytes(length).toString('hex');
}

// API untuk generate dan menyimpan password
exports.generatePassword = async (req, res) => {
    const password = generateRandomPassword();  // Menghasilkan password 16 karakter (8 byte hex)
    const expired_time = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expired time 24 jam dari sekarang

    try {
        const result = await db.query(
            `INSERT INTO ms_password (password_gen, expire_date, user_entry) 
            VALUES ($1, $2, 'admin') RETURNING *`,
            [password, expired_time]
        );

        res.status(201).json({
            success: true,
            message: "Password generated successfully",
            data: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

exports.validatePassword = async (req, res) => {
    const params = req.body;
    try {
        // Query untuk mendapatkan data password dan tanggal expired berdasarkan ID
        const query = 'SELECT password_gen, expire_date FROM ms_password WHERE password_gen = $1';
        const result = await db.query(query, [params.password]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Password tidak ditemukan.",
                flag: 1
            });
        }

        const user = result.rows[0];

        // Cek apakah password sudah expired
        const currentDate = new Date();
        const expiredDate = new Date(user.expire_date);

        if (currentDate > expiredDate) {
            return res.status(200).json({
                success: true,
                message: "Password sudah expired.",
                flag: 2
            });
        }

        if (user.password_gen != params.password) {
            return res.status(200).json({
                success: true,
                message: "Password salah.",
                flag: 3
            });
        }

        res.status(200).json({
            success: true,
            message: "Success",
            data: result.rows[0],
            rowCount:result.rows.length,
            flag: 4
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

exports.getLogTamu = async function (req, res) {
    const { start, length, search, order, columns } = req.body;

    // Pastikan `start` dan `length` memiliki nilai default jika tidak ada
    const offset = parseInt(start) || 0;
    const limit = parseInt(length) || 10;

    let query = `SELECT * FROM tamu`;
    let queryParams = [];

    // Pencarian global
    if (search && search.value) {
        query += ` WHERE name ILIKE $1`;
        queryParams.push(`%${search.value}%`);
    }

    // Pengurutan
    if (order && order.length > 0) {
        const orderByColumn = columns[order[0].column].data;
        const orderDirection = order[0].dir.toUpperCase();
        
        if (orderByColumn) {
            query += ` ORDER BY ${orderByColumn} ${orderDirection}`;
        }
    } else {
        query += ` ORDER BY id DESC`;
    }    

    // Pagination
    query += ` OFFSET $${queryParams.length + 1} LIMIT $${queryParams.length + 2}`;
    queryParams.push(offset);
    queryParams.push(limit);

    try {
        const dataResult = await db.query(query, queryParams);
        const countResult = await db.query(`SELECT COUNT(*) FROM tamu`);
        const recordsTotal = parseInt(countResult.rows[0].count, 10);

        res.status(200).json({
            success: true,
            message: "Success",
            data: dataResult.rows,
            draw: req.body.draw, // Mengembalikan draw untuk sinkronisasi dengan DataTables
            recordsTotal: recordsTotal, // Total data di database tanpa filtering
            recordsFiltered: search && search.value ? dataResult.rowCount : recordsTotal, // Total data setelah filtering
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
            recordsTotal: 0,
            recordsFiltered: 0
        });
    }
};

exports.getLogTamuByID = async function (req, res) {
    const params = req.body;
    try {
        const result = await db.query('SELECT * FROM tamu WHERE id = $1', [params.id]);

        res.status(200).json({
            success: true,
            message: "Success",
            data: result.rows[0],
            rowCount:result.rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null
        });
    }
};

exports.updateDisconnectLogTamu = async function (req, res) {
    const params = req.body;
    try {
        const result = await db.query(
            `UPDATE tamu 
             SET flagdisconnect = 1
             WHERE id = $1 RETURNING *`,
            [params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Log Tamu not found');
        }
        res.status(200).json({
            success: true,
            message: "Success",
            data: result.rows[0],
            rowCount:result.rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};