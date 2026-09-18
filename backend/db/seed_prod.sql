-- Contes d'administration prêts pour la production.
-- Idempotent (ON CONFLICT) et sans \c : peut être lancé plusieurs fois.
-- N'est JAMAIS exécuté automatiquement au démarrage : il faut SEED_ON_START=true
-- (voir backend/scripts/start.sh et deploy.md).

-- hash bcrypt de "superadmin123", "biblio123"
INSERT INTO users (nom, telephone, email, password, role) VALUES
('Super Admin', '77 000 00 00', 'admin@biblio.fr', '$2b$10$sKg.Uviz8EgdcCA2PvKSvej3rSXdErgAApM9ZFFPo3oX2MCY85EBG', 'superadmin'),
('Biblio Principal', '77 000 00 01', 'biblio@biblio.fr', '$2b$10$xRWAcKEANK5GfpuZNsvScenlKraOujuUVl/eu2YTlAfDNl9EQimkq', 'bibliothecaire')
ON CONFLICT (email) DO NOTHING;