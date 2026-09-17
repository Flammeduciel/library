const pool = require('../db');
const response = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM auteurs ORDER BY id');
    response.success(res, result.rows, 'Liste des auteurs');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM auteurs WHERE id = $1', [id]);
    if (result.rows.length === 0) return response.notFound(res, 'Auteur non trouve');
    response.success(res, result.rows[0], 'Auteur recupere');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, nationalite } = req.body;
    if (!nom) return response.badRequest(res, 'Le nom est obligatoire');
    const result = await pool.query(
      'INSERT INTO auteurs (nom, nationalite) VALUES ($1, $2) RETURNING *',
      [nom, nationalite || null]
    );
    response.created(res, result.rows[0], 'Auteur cree');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, nationalite } = req.body;
    if (!nom) return response.badRequest(res, 'Le nom est obligatoire');
    const result = await pool.query(
      'UPDATE auteurs SET nom = $1, nationalite = $2 WHERE id = $3 RETURNING *',
      [nom, nationalite || null, id]
    );
    if (result.rows.length === 0) return response.notFound(res, 'Auteur non trouve');
    response.success(res, result.rows[0], 'Auteur modifie');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM auteurs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return response.notFound(res, 'Auteur non trouve');
    response.success(res, { id: +id }, 'Auteur supprime');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};