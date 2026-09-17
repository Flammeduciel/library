const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/emprunts.controller');
const { validateEmprunt } = require('../middlewares/validation');
const { auth, requireRole, ROLES } = require('../middlewares/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.post('/', validateEmprunt, ctrl.create);
router.put('/:id/retour', ctrl.retour);

module.exports = router;