const response = require('../utils/response');
const ROLES = ['adherent', 'bibliothecaire', 'superadmin'];

exports.validateAuteur = (req, res, next) => {
  const { nom } = req.body;
  if (!nom || nom.trim().length === 0) {
    return response.badRequest(res, 'Le nom de l\'auteur est obligatoire');
  }
  if (nom.length > 100) {
    return response.badRequest(res, 'Le nom ne peut depasser 100 caracteres');
  }
  next();
};

exports.validateUser = (req, res, next) => {
  const { nom, email, password, role } = req.body;
  if (!nom || nom.trim().length === 0) {
    return response.badRequest(res, 'Le nom de l\'utilisateur est obligatoire');
  }
  if (!email || !email.includes('@')) {
    return response.badRequest(res, 'Format email invalide');
  }
  if (!password || password.length < 6) {
    return response.badRequest(res, 'Le mot de passe doit contenir au moins 6 caracteres');
  }
  if (role && !ROLES.includes(role)) {
    return response.badRequest(res, 'Role invalide (adherent, bibliothecaire, superadmin)');
  }
  next();
};

exports.validateLivre = (req, res, next) => {
  const { titre, auteur_id } = req.body;
  if (!titre || titre.trim().length === 0) {
    return response.badRequest(res, 'Le titre du livre est obligatoire');
  }
  if (!auteur_id) {
    return response.badRequest(res, 'L\'auteur est obligatoire');
  }
  next();
};

exports.validateEmprunt = (req, res, next) => {
  const { user_id, livre_id, date_retour_prevue } = req.body;
  if (!user_id) {
    return response.badRequest(res, 'L\'utilisateur est obligatoire');
  }
  if (!livre_id) {
    return response.badRequest(res, 'Le livre est obligatoire');
  }
  if (!date_retour_prevue) {
    return response.badRequest(res, 'La date de retour prevue est obligatoire');
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.includes('@')) {
    return response.badRequest(res, 'Format email invalide');
  }
  if (!password) {
    return response.badRequest(res, 'Le mot de passe est obligatoire');
  }
  next();
};