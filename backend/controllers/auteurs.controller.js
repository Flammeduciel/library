const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM auteurs ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM auteurs WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Auteur non trouve' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, nationalite } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom est obligatoire' });
    const result = await pool.query(
      'INSERT INTO auteurs (nom, nationalite) VALUES ($1, $2) RETURNING *',
      [nom, nationalite || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, nationalite } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom est obligatoire' });
    const result = await pool.query(
      'UPDATE auteurs SET nom = $1, nationalite = $2 WHERE id = $3 RETURNING *',
      [nom, nationalite || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Auteur non trouve' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM auteurs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Auteur non trouve' });
    res.json({ message: 'Auteur supprime' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
