const pool = require('../db');
const response = require('../utils/response');

exports.getStats = async (req, res) => {
  try {
    const totalLivres = await pool.query('SELECT COUNT(*) FROM livres');
    const totalAdherents = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'adherent'");
    const empruntsEnCours = await pool.query(
      'SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL'
    );
    const empruntsEnRetard = await pool.query(
      'SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL AND date_retour_prevue < NOW()'
    );

    const livrePlusEmprunte = await pool.query(
      `SELECT l.titre, COUNT(e.id) AS nombre_emprunts
       FROM livres l
       JOIN emprunts e ON l.id = e.livre_id
       GROUP BY l.id, l.titre
       ORDER BY nombre_emprunts DESC
       LIMIT 1`
    );

    const adherentPlusActif = await pool.query(
      `SELECT u.nom, COUNT(e.id) AS nombre_emprunts
       FROM users u
       JOIN emprunts e ON u.id = e.user_id
       WHERE u.role = 'adherent'
       GROUP BY u.id, u.nom
       ORDER BY nombre_emprunts DESC
       LIMIT 1`
    );

    response.success(res, {
      total_livres: parseInt(totalLivres.rows[0].count),
      total_adherents: parseInt(totalAdherents.rows[0].count),
      emprunts_en_cours: parseInt(empruntsEnCours.rows[0].count),
      emprunts_en_retard: parseInt(empruntsEnRetard.rows[0].count),
      livre_plus_emprunte: livrePlusEmprunte.rows[0] || null,
      adherent_plus_actif: adherentPlusActif.rows[0] || null,
    }, 'Statistiques de la bibliotheque');
  } catch (err) {
    response.failure(res, err.message, 500);
  }
};