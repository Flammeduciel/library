module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'JSON invalide', data: null });
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur',
    data: null,
  });
};
