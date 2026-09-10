const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/emprunts.controller');
const { validateEmprunt } = require('../middlewares/validation');

router.get('/', ctrl.getAll);
router.post('/', validateEmprunt, ctrl.create);
router.put('/:id/retour', ctrl.retour);

module.exports = router;
