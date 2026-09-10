const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { statut } = req.query;
    let query = `
      SELECT e.*, l.titre AS livre_titre, l.disponible,
             a.nom AS auteur_nom, ad.nom AS adherent_nom
      FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      JOIN auteurs a ON l.auteur_id = a.id
      JOIN adherents ad ON e.adherent_id = ad.id
    `;

    if (statut === 'en_cours') {
      query += ' WHERE e.date_retour_effective IS NULL';
    } else if (statut === 'en_retard') {
      query += ' WHERE e.date_retour_effective IS NULL AND e.date_retour_prevue < NOW()';
    }

    query += ' ORDER BY e.date_emprunt DESC';

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { adherent_id, livre_id, date_retour_prevue } = req.body;

    if (!adherent_id || !livre_id || !date_retour_prevue) {
      return res.status(400).json({ error: 'adherent_id, livre_id et date_retour_prevue sont obligatoires' });
    }

    const adherentCheck = await pool.query('SELECT id FROM adherents WHERE id = $1', [adherent_id]);
    if (adherentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Adherent inexistant' });
    }

    const livreCheck = await pool.query('SELECT id, disponible FROM livres WHERE id = $1', [livre_id]);
    if (livreCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Livre inexistant' });
    }
    if (!livreCheck.rows[0].disponible) {
      return res.status(400).json({ error: 'Ce livre est deja emprunte et indisponible' });
    }

    const emprunt = await pool.query(
      'INSERT INTO emprunts (adherent_id, livre_id, date_retour_prevue) VALUES ($1, $2, $3) RETURNING *',
      [adherent_id, livre_id, date_retour_prevue]
    );

    await pool.query('UPDATE livres SET disponible = FALSE WHERE id = $1', [livre_id]);

    res.status(201).json(emprunt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.retour = async (req, res) => {
  try {
    const { id } = req.params;

    const empruntCheck = await pool.query(
      'SELECT * FROM emprunts WHERE id = $1',
      [id]
    );
    if (empruntCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Emprunt non trouve' });
    }
    if (empruntCheck.rows[0].date_retour_effective) {
      return res.status(400).json({ error: 'Ce livre a deja ete rendu' });
    }

    const result = await pool.query(
      'UPDATE emprunts SET date_retour_effective = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    await pool.query('UPDATE livres SET disponible = TRUE WHERE id = $1', [empruntCheck.rows[0].livre_id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
