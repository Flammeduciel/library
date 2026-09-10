const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM adherents ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM adherents WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Adherent non trouve' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, telephone, email } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom est obligatoire' });
    const result = await pool.query(
      'INSERT INTO adherents (nom, telephone, email) VALUES ($1, $2, $3) RETURNING *',
      [nom, telephone || null, email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, telephone, email } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom est obligatoire' });
    const result = await pool.query(
      'UPDATE adherents SET nom = $1, telephone = $2, email = $3 WHERE id = $4 RETURNING *',
      [nom, telephone || null, email || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Adherent non trouve' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM adherents WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Adherent non trouve' });
    res.json({ message: 'Adherent supprime' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEmprunts = async (req, res) => {
  try {
    const { id } = req.params;
    const adherent = await pool.query('SELECT * FROM adherents WHERE id = $1', [id]);
    if (adherent.rows.length === 0) return res.status(404).json({ error: 'Adherent non trouve' });

    const result = await pool.query(
      `SELECT e.*, l.titre AS livre_titre, a.nom AS auteur_nom
       FROM emprunts e
       JOIN livres l ON e.livre_id = l.id
       JOIN auteurs a ON l.auteur_id = a.id
       WHERE e.adherent_id = $1
       ORDER BY e.date_emprunt DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
