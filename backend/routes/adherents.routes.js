const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adherents.controller');
const { validateAdherent } = require('../middlewares/validation');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validateAdherent, ctrl.create);
router.put('/:id', validateAdherent, ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/emprunts', ctrl.getEmprunts);

module.exports = router;
