const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auteurs.controller');
const { validateAuteur } = require('../middlewares/validation');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validateAuteur, ctrl.create);
router.put('/:id', validateAuteur, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
