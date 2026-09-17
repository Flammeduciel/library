const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stats.controller');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/', ctrl.getStats);

module.exports = router;