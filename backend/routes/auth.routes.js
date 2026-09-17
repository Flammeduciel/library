const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { validateUser, validateLogin } = require('../middlewares/validation');
const { auth } = require('../middlewares/auth');

router.post('/register', validateUser, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.get('/me', auth, ctrl.me);

module.exports = router;