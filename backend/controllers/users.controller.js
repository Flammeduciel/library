const bcrypt = require('bcryptjs');
const pool = require('../db');
const response = require('../utils/response');
const { ROLES } = require('../middlewares/auth');

const SAFE_COLUMNS = 'id, nom, telephone, email, role, created_at';
const VALID_ROLES = Object.values(ROLES);

exports.getAll = async (req, res) => {
  try {
    const { role, q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (role) {
      if (!VALID_ROLES.includes(role)) return response.badRequest(res, 'Role invalide');
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(nom ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    let countQuery = 'SELECT COUNT(*) FROM users';
    if (conditions.length > 0) countQuery += ' WHERE ' + conditions.join(' AND ');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit);
    params.push(offset);
    let query = `SELECT ${SAFE_COLUMNS} FROM users`;
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ` ORDER BY id LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    response.success(res, { users: result.rows, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) } }, 'Liste des utilisateurs');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return response.notFound(res, 'Utilisateur non trouve');
    response.success(res, result.rows[0], 'Utilisateur recupere');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, telephone, email, password, role = ROLES.ADHERENT } = req.body;
    if (!VALID_ROLES.includes(role)) return response.badRequest(res, 'Role invalide');
    if (req.user.role !== ROLES.SUPERADMIN && role !== ROLES.ADHERENT) {
      return response.forbidden(res, 'Seul un superadmin peut creer ce role');
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) return response.badRequest(res, 'Cet email est deja utilise');

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (nom, telephone, email, password, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${SAFE_COLUMNS}`,
      [nom, telephone || null, email, hash, role]
    );
    response.created(res, result.rows[0], 'Utilisateur cree');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, telephone, email, password, role } = req.body;

    const existing = await pool.query(`SELECT id, role FROM users WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return response.notFound(res, 'Utilisateur non trouve');
    const currentUser = existing.rows[0];

    // superadmin : tout ; bibliothecaire : gestion des adherents uniquement
    if (req.user.role !== ROLES.SUPERADMIN) {
      if (req.user.role === ROLES.BIBLIOTHECAIRE && currentUser.role !== ROLES.ADHERENT) {
        return response.forbidden(res, 'Un bibliothecaire ne peut modifier que les adherents');
      }
      if (req.user.role === ROLES.ADHERENT && req.user.id !== +id) {
        return response.forbidden(res, 'Vous ne pouvez modifier que votre propre compte');
      }
    }

    // seuls les superadmin peuvent changer le role
    if (role && role !== currentUser.role && req.user.role !== ROLES.SUPERADMIN) {
      return response.forbidden(res, 'Seul un superadmin peut changer les roles');
    }
    if (role && !VALID_ROLES.includes(role)) return response.badRequest(res, 'Role invalide');

    // un utilisateur ne peut pas retirer son propre role superadmin
    if (req.user.id === +id && role && role !== ROLES.SUPERADMIN) {
      return response.forbidden(res, 'Vous ne pouvez pas retirer votre propre role superadmin');
    }

    const fields = [];
    const params = [];
    const values = { nom, telephone, email, role };

    if (password) {
      params.push(await bcrypt.hash(password, 10));
      fields.push(`password = $${params.length}`);
    }

    for (const [col, val] of Object.entries(values)) {
      if (val !== undefined) {
        params.push(val);
        fields.push(`${col} = $${params.length}`);
      }
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING ${SAFE_COLUMNS}`,
      params
    );
    response.success(res, result.rows[0], 'Utilisateur modifie');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === +id) return response.badRequest(res, 'Vous ne pouvez pas supprimer votre propre compte');

    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) return response.notFound(res, 'Utilisateur non trouve');
    response.success(res, { id: +id }, 'Utilisateur supprime');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.getEmprunts = async (req, res) => {
  try {
    const { id } = req.params;

    // un adherent ne consulte que son propre historique
    if (req.user.role === ROLES.ADHERENT && req.user.id !== +id) {
      return response.forbidden(res, 'Vous ne pouvez consulter que votre propre historique');
    }

    const user = await pool.query(`SELECT id FROM users WHERE id = $1`, [id]);
    if (user.rows.length === 0) return response.notFound(res, 'Utilisateur non trouve');

    const result = await pool.query(
      `SELECT e.*, l.titre AS livre_titre, a.nom AS auteur_nom
       FROM emprunts e
       JOIN livres l ON e.livre_id = l.id
       JOIN auteurs a ON l.auteur_id = a.id
       WHERE e.user_id = $1
       ORDER BY e.date_emprunt DESC`,
      [id]
    );
    response.success(res, result.rows, 'Historique des emprunts');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};