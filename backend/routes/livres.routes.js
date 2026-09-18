const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/livres.controller');
const { validateLivre } = require('../middlewares/validation');
const { auth, requireRole, ROLES } = require('../middlewares/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', requireRole(ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), validateLivre, ctrl.create);
router.put('/:id', requireRole(ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), validateLivre, ctrl.update);
router.delete('/:id', requireRole(ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), ctrl.remove);

module.exports = router;