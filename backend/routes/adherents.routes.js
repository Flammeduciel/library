const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adherents.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/emprunts', ctrl.getEmprunts);

module.exports = router;
