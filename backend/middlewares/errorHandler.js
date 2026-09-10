module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON invalide' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
};
