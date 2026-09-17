const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users.controller');
const { validateUser } = require('../middlewares/validation');
const { auth, requireRole, ROLES } = require('../middlewares/auth');

router.use(auth);

router.get('/', requireRole(ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), ctrl.getAll);
router.get('/:id', requireRole(ROLES.ADHERENT, ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), ctrl.getById);
router.get('/:id/emprunts', requireRole(ROLES.ADHERENT, ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), ctrl.getEmprunts);
router.post('/', requireRole(ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), validateUser, ctrl.create);
router.put('/:id', requireRole(ROLES.ADHERENT, ROLES.BIBLIOTHECAIRE, ROLES.SUPERADMIN), ctrl.update);
router.delete('/:id', requireRole(ROLES.SUPERADMIN), ctrl.remove);

module.exports = router;