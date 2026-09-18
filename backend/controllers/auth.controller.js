const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const response = require('../utils/response');
const { ROLES } = require('../middlewares/auth');

const SAFE_COLUMNS = 'id, nom, telephone, email, role, created_at';

function signToken(user) {
  return jwt.sign(
    { id: user.id, nom: user.nom, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { nom, telephone, email, password, role } = req.body;
    const finalRole = role === ROLES.ADHERENT ? role : ROLES.ADHERENT;

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return response.badRequest(res, 'Cet email est deja utilise');
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (nom, telephone, email, password, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${SAFE_COLUMNS}`,
      [nom, telephone || null, email, hash, finalRole]
    );

    const user = result.rows[0];
    const token = signToken(user);
    response.created(res, { user, token }, 'Compte cree avec succes');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (result.rows.length === 0) {
      return response.unauthorized(res, 'Email ou mot de passe incorrect');
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return response.unauthorized(res, 'Email ou mot de passe incorrect');
    }

    const token = signToken(user);
    const { password: _pw, ...safeUser } = user;
    response.success(res, { user: safeUser, token }, 'Connexion reussie');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return response.notFound(res, 'Utilisateur introuvable');
    }
    response.success(res, result.rows[0], 'Profil recupere');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};