const jwt = require('jsonwebtoken');
const response = require('../utils/response');

exports.auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return response.unauthorized(res, 'Token manquant');
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return response.unauthorized(res, 'Token invalide ou expire');
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return response.unauthorized(res, 'Authentification requise');
  if (!roles.includes(req.user.role)) {
    return response.forbidden(res, 'Vos droits ne permettent pas cette action');
  }
  next();
};

exports.ROLES = {
  ADHERENT: 'adherent',
  BIBLIOTHECAIRE: 'bibliothecaire',
  SUPERADMIN: 'superadmin',
};

exports.isAdherent = (req, res, next) => exports.requireRole(...Object.values(exports.ROLES))(req, res, next);