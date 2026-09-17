const pool = require('../db');
const response = require('../utils/response');
const { ROLES } = require('../middlewares/auth');

exports.getAll = async (req, res) => {
  try {
    const { statut } = req.query;
    let query = `
      SELECT e.*, l.titre AS livre_titre, l.disponible,
             a.nom AS auteur_nom, u.nom AS user_nom, u.role AS user_role
      FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      JOIN auteurs a ON l.auteur_id = a.id
      JOIN users u ON e.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (req.user.role === ROLES.ADHERENT) {
      params.push(req.user.id);
      conditions.push(`e.user_id = $${params.length}`);
    }

    if (statut === 'en_cours') {
      conditions.push('e.date_retour_effective IS NULL');
    } else if (statut === 'en_retard') {
      conditions.push('e.date_retour_effective IS NULL AND e.date_retour_prevue < NOW()');
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.date_emprunt DESC';

    const result = await pool.query(query, params);
    response.success(res, result.rows, 'Liste des emprunts');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { user_id, livre_id, date_retour_prevue } = req.body;

    if (!user_id || !livre_id || !date_retour_prevue) {
      return response.badRequest(res, 'user_id, livre_id et date_retour_prevue sont obligatoires');
    }

    // un adherent ne peut emprunter que pour lui-meme
    if (req.user.role === ROLES.ADHERENT && req.user.id !== +user_id) {
      return response.forbidden(res, 'Un adherent ne peut emprunter que pour lui-meme');
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) return response.badRequest(res, 'Utilisateur inexistant');

    const livreCheck = await pool.query('SELECT id, disponible FROM livres WHERE id = $1', [livre_id]);
    if (livreCheck.rows.length === 0) return response.badRequest(res, 'Livre inexistant');
    if (!livreCheck.rows[0].disponible) {
      return response.badRequest(res, 'Ce livre est deja emprunte et indisponible');
    }

    const emprunt = await pool.query(
      'INSERT INTO emprunts (user_id, livre_id, date_retour_prevue) VALUES ($1, $2, $3) RETURNING *',
      [user_id, livre_id, date_retour_prevue]
    );

    await pool.query('UPDATE livres SET disponible = FALSE WHERE id = $1', [livre_id]);

    response.created(res, emprunt.rows[0], 'Emprunt cree, livre marque indisponible');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.retour = async (req, res) => {
  try {
    const { id } = req.params;

    const empruntCheck = await pool.query(
      'SELECT * FROM emprunts WHERE id = $1',
      [id]
    );
    if (empruntCheck.rows.length === 0) return response.notFound(res, 'Emprunt non trouve');
    if (empruntCheck.rows[0].date_retour_effective) {
      return response.badRequest(res, 'Ce livre a deja ete rendu');
    }

    // un adherent ne peut rendre que ses propres emprunts
    if (req.user.role === ROLES.ADHERENT && req.user.id !== empruntCheck.rows[0].user_id) {
      return response.forbidden(res, 'Vous ne pouvez rendre que vos propres emprunts');
    }

    const result = await pool.query(
      'UPDATE emprunts SET date_retour_effective = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    await pool.query('UPDATE livres SET disponible = TRUE WHERE id = $1', [empruntCheck.rows[0].livre_id]);

    response.success(res, result.rows[0], 'Retour enregistre, livre remis a disposition');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};