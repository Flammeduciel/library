exports.validateAuteur = (req, res, next) => {
  const { nom } = req.body;
  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le nom de l\'auteur est obligatoire' });
  }
  if (nom.length > 100) {
    return res.status(400).json({ error: 'Le nom ne peut depasser 100 caracteres' });
  }
  next();
};

exports.validateAdherent = (req, res, next) => {
  const { nom } = req.body;
  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le nom de l\'adherent est obligatoire' });
  }
  if (nom.length > 100) {
    return res.status(400).json({ error: 'Le nom ne peut depasser 100 caracteres' });
  }
  if (req.body.email && !req.body.email.includes('@')) {
    return res.status(400).json({ error: 'Format email invalide' });
  }
  next();
};

exports.validateLivre = (req, res, next) => {
  const { titre, auteur_id } = req.body;
  if (!titre || titre.trim().length === 0) {
    return res.status(400).json({ error: 'Le titre du livre est obligatoire' });
  }
  if (!auteur_id) {
    return res.status(400).json({ error: 'L\'auteur est obligatoire' });
  }
  next();
};

exports.validateEmprunt = (req, res, next) => {
  const { adherent_id, livre_id, date_retour_prevue } = req.body;
  if (!adherent_id) {
    return res.status(400).json({ error: 'L\'adherent est obligatoire' });
  }
  if (!livre_id) {
    return res.status(400).json({ error: 'Le livre est obligatoire' });
  }
  if (!date_retour_prevue) {
    return res.status(400).json({ error: 'La date de retour prevue est obligatoire' });
  }
  next();
};
