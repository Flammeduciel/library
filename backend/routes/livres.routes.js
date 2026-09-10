const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/livres.controller');
const { validateLivre } = require('../middlewares/validation');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validateLivre, ctrl.create);
router.put('/:id', validateLivre, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
