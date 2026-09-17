const pool = require('../db');
const response = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { q, auteur, disponible, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT l.*, a.nom AS auteur_nom
      FROM livres l
      JOIN auteurs a ON l.auteur_id = a.id
    `;
    const params = [];
    const conditions = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`l.titre ILIKE $${params.length}`);
    }
    if (auteur) {
      params.push(`%${auteur}%`);
      conditions.push(`a.nom ILIKE $${params.length}`);
    }
    if (disponible === 'true' || disponible === 'false') {
      params.push(disponible === 'true');
      conditions.push(`l.disponible = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const countQuery = query.replace('SELECT l.*, a.nom AS auteur_nom', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit);
    params.push(offset);
    query += ` ORDER BY l.id LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    response.success(res, {
      livres: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Liste des livres');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT l.*, a.nom AS auteur_nom
       FROM livres l
       JOIN auteurs a ON l.auteur_id = a.id
       WHERE l.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return response.notFound(res, 'Livre non trouve');
    response.success(res, result.rows[0], 'Livre recupere');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { titre, auteur_id, annee_publication } = req.body;
    if (!titre || !auteur_id) return response.badRequest(res, 'Le titre et l\'auteur sont obligatoires');

    const auteurCheck = await pool.query('SELECT id FROM auteurs WHERE id = $1', [auteur_id]);
    if (auteurCheck.rows.length === 0) return response.badRequest(res, 'Auteur inexistant');

    const result = await pool.query(
      'INSERT INTO livres (titre, auteur_id, annee_publication) VALUES ($1, $2, $3) RETURNING *',
      [titre, auteur_id, annee_publication || null]
    );
    response.created(res, result.rows[0], 'Livre cree');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, auteur_id, annee_publication } = req.body;
    if (!titre || !auteur_id) return response.badRequest(res, 'Le titre et l\'auteur sont obligatoires');

    const result = await pool.query(
      'UPDATE livres SET titre = $1, auteur_id = $2, annee_publication = $3 WHERE id = $4 RETURNING *',
      [titre, auteur_id, annee_publication || null, id]
    );
    if (result.rows.length === 0) return response.notFound(res, 'Livre non trouve');
    response.success(res, result.rows[0], 'Livre modifie');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM livres WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return response.notFound(res, 'Livre non trouve');
    response.success(res, { id: +id }, 'Livre supprime');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};