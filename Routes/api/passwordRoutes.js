// routes/passwordRoutes.js

const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
var verify = require('../middleware/verifyHeader');

router.get('/password',verify.verifyHeader, passwordController.getAllPassword);
router.post('/generate',verify.verifyHeader, passwordController.generatePassword);
router.post('/validate_password',verify.verifyHeader, passwordController.validatePassword);
router.post('/getLogTamu',verify.verifyHeader, passwordController.getLogTamu);
router.post('/getLogTamuByID',verify.verifyHeader, passwordController.getLogTamuByID);
router.post('/updateDisconnectLogTamu',verify.verifyHeader, passwordController.updateDisconnectLogTamu);
module.exports = router;
