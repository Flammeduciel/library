\c bibliotheque;

-- Auteurs
INSERT INTO auteurs (nom, nationalite) VALUES
('Chinua Achebe', 'Nigeria'),
('Ngugi wa Thiong''o', 'Kenya'),
('Mariama Ba', 'Senegal'),
('Ahmadou Kourouma', 'Cote d''Ivoire'),
('Boubacar Boris Diop', 'Senegal'),
('Yaa Gyasi', 'Ghana'),
('Chimamanda Ngozi Adichie', 'Nigeria');

-- Adherents
INSERT INTO adherents (nom, telephone, email) VALUES
('Aminata Diallo', '77 123 45 67', 'aminata.diallo@email.com'),
('Moussa Sow', '78 234 56 78', 'moussa.sow@email.com'),
('Fatou Ndiaye', '76 345 67 89', 'fatou.ndiaye@email.com'),
('Ibrahima Fall', '77 456 78 90', 'ibrahima.fall@email.com'),
('Aissatou Diop', '78 567 89 01', 'aissatou.diop@email.com'),
('Ousmane Ba', '76 678 90 12', 'ousmane.ba@email.com'),
('Khady Mane', '77 789 01 23', 'khady.mane@email.com'),
('Abdoulaye Sy', '78 890 12 34', 'abdoulaye.sy@email.com');

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

-- Emprunts
INSERT INTO emprunts (adherent_id, livre_id, date_emprunt, date_retour_prevue, date_retour_effective) VALUES
(1, 4, '2026-09-01', '2026-09-15', NULL),
(2, 9, '2026-09-03', '2026-09-17', NULL),
(3, 1, '2026-08-20', '2026-09-03', '2026-09-02'),
(4, 7, '2026-08-25', '2026-09-08', NULL),
(5, 3, '2026-09-05', '2026-09-19', NULL),
(1, 5, '2026-08-15', '2026-08-29', '2026-08-28'),
(6, 2, '2026-09-08', '2026-09-22', NULL),
(2, 6, '2026-09-07', '2026-09-21', NULL);
