require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const auteursRoutes = require('./routes/auteurs.routes');
const livresRoutes = require('./routes/livres.routes');
const empruntsRoutes = require('./routes/emprunts.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS bloqué par défaut en production : n'autoriser que les origines listées
// dans CORS_ORIGIN (URLs publiques du frontend, https, sans slash final,
// séparées par des virgules). Vide = autorisation ouverte (pratique en
// développement local).
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(corsOrigins.length ? { origin: corsOrigins } : undefined));
app.use(express.json());
app.use(logger);
app.use(express.static(require('path').join(__dirname, '..', 'frontend')));

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auteurs', auteursRoutes);
app.use('/api/livres', livresRoutes);
app.use('/api/emprunts', empruntsRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});