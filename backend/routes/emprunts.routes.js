const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/emprunts.controller');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id/retour', ctrl.retour);

module.exports = router;
