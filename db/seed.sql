\c bibliotheque;

-- Utilisateurs (roles : adherent, bibliothecaire, superadmin)
-- hash bcrypt de "superadmin123", "biblio123", "adherent123"
INSERT INTO users (nom, telephone, email, password, role) VALUES
('Super Admin', '77 000 00 00', 'admin@biblio.fr', '$2b$10$sKg.Uviz8EgdcCA2PvKSvej3rSXdErgAApM9ZFFPo3oX2MCY85EBG', 'superadmin'),
('Biblio Principal', '77 000 00 01', 'biblio@biblio.fr', '$2b$10$xRWAcKEANK5GfpuZNsvScenlKraOujuUVl/eu2YTlAfDNl9EQimkq', 'bibliothecaire'),
('Aminata Diallo', '77 123 45 67', 'aminata.diallo@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Moussa Sow', '78 234 56 78', 'moussa.sow@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Fatou Ndiaye', '76 345 67 89', 'fatou.ndiaye@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Ibrahima Fall', '77 456 78 90', 'ibrahima.fall@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Aissatou Diop', '78 567 89 01', 'aissatou.diop@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Ousmane Ba', '76 678 90 12', 'ousmane.ba@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Khady Mane', '77 789 01 23', 'khady.mane@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Abdoulaye Sy', '78 890 12 34', 'abdoulaye.sy@email.com', '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent');

-- Auteurs
INSERT INTO auteurs (nom, nationalite) VALUES
('Chinua Achebe', 'Nigeria'),
('Ngugi wa Thiong''o', 'Kenya'),
('Mariama Ba', 'Senegal'),
('Ahmadou Kourouma', 'Cote d''Ivoire'),
('Boubacar Boris Diop', 'Senegal'),
('Yaa Gyasi', 'Ghana'),
('Chimamanda Ngozi Adichie', 'Nigeria');

-- Livres
INSERT INTO livres (titre, auteur_id, annee_publication, disponible) VALUES
('Things Fall Apart', 1, 1958, TRUE),
('A Grain of Wheat', 2, 1967, TRUE),
('So Long a Letter', 3, 1979, TRUE),
('Les soleils des independances', 4, 1968, FALSE),
('Murambi, le livre des ossements', 5, 2000, TRUE),
('Homegoing', 6, 2016, TRUE),
('Americanah', 7, 2013, TRUE),
('Purple Hibiscus', 7, 2003, TRUE),
('We Need New Names', 6, 2013, FALSE),
('The Secret Lives of Baba Segi''s Wives', 3, 2009, TRUE);

-- Emprunts (user_id = adherents 3..10)
INSERT INTO emprunts (user_id, livre_id, date_emprunt, date_retour_prevue, date_retour_effective) VALUES
(3, 4, '2026-09-01', '2026-09-15', NULL),
(4, 9, '2026-09-03', '2026-09-17', NULL),
(5, 1, '2026-08-20', '2026-09-03', '2026-09-02'),
(6, 7, '2026-08-25', '2026-09-08', NULL),
(7, 3, '2026-09-05', '2026-09-19', NULL),
(3, 5, '2026-08-15', '2026-08-29', '2026-08-28'),
(8, 2, '2026-09-08', '2026-09-22', NULL),
(4, 6, '2026-09-07', '2026-09-21', NULL);