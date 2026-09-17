const CONTENT_TYPE = 'application/json';

function send(res, status, payload) {
  res.status(status).json(payload);
}

// Succes : { status: 'success', message, data }
exports.success = (res, data, message = 'OK', status = 200) => {
  send(res, status, { status: 'success', message, data });
};

exports.created = (res, data, message = 'Ressource creee') => {
  exports.success(res, data, message, 201);
};

// Erreur : { status: 'error', message, data: null }
exports.failure = (res, message = 'Erreur', status = 500, data = null) => {
  send(res, status, { status: 'error', message, data });
};

exports.badRequest = (res, message) => exports.failure(res, message, 400);
exports.unauthorized = (res, message = 'Non autorise') => exports.failure(res, message, 401);
exports.forbidden = (res, message = 'Acces refuse') => exports.failure(res, message, 403);
exports.notFound = (res, message = 'Ressource introuvable') => exports.failure(res, message, 404);