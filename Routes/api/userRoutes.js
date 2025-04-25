const express = require('express');
const route = express.Router();
const userController = require('../../controllers/user_controller');

route.get('/getUsers', userController.getUsers);
route.get('/getUserById/:id', userController.getUserById);
route.post('/upsertUser', userController.upsertUser);
route.post('/deleteUser/:id', userController.deleteUser);

module.exports = route;
