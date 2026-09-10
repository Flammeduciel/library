const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stats.controller');

router.get('/', ctrl.getStats);

module.exports = router;
