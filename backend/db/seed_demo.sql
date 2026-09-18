-- Seed de démonstration complet pour la bibliothèque.
-- NOTE : réplique de db/seed.sql (garder les deux en synchro).
-- ATTENTION : conçu pour tourner APRÈS un TRUNCATE ... RESTART IDENTITY
-- (les identifiants sont codés en dur). start.sh ne l'exécute que si
-- SEED_ON_START=true, après avoir vidé les tables (idempotent).
-- Détruit donc toutes les données existantes au chargement.
-- Comptes staff : admin@biblio.fr / superadmin123 et biblio@biblio.fr / biblio123
-- Adhérents : mot de passe commun "adherent123" (public, à changer en prod).

-- Utilisateurs
-- hash bcrypt de "superadmin123", "biblio123", "adherent123"
INSERT INTO users (nom, telephone, email, password, role) VALUES
('Mabiala Nzau'        , '81 100 00 01', 'admin@biblio.fr'     , '$2b$10$sKg.Uviz8EgdcCA2PvKSvej3rSXdErgAApM9ZFFPo3oX2MCY85EBG', 'superadmin'),
('Esther Lumbu'        , '81 100 00 02', 'biblio@biblio.fr'    , '$2b$10$xRWAcKEANK5GfpuZNsvScenlKraOujuUVl/eu2YTlAfDNl9EQimkq', 'bibliothecaire'),
('Kimbangu Mwamba'     , '81 234 56 78', 'k.mwamba@mail.cd'    , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Nsimba Mbuyi'        , '82 345 67 89', 'n.mbuyi@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Kazadi Ilunga'       , '84 456 78 90', 'k.ilunga@mail.cd'    , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Mulumba Ngoie'       , '85 567 89 01', 'm.ngoie@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Kalonda Bibiche'     , '89 678 90 12', 'k.bibiche@mail.cd'   , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Mbala Kanza'         , '90 789 01 23', 'm.kanza@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Tshibanda Lunda'     , '97 890 12 34', 't.lunda@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Bakala Songa'        , '99 901 23 45', 'b.songa@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Nkulu Kanku'         , '81 012 34 56', 'n.kanku@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Mwela Manga'         , '82 123 45 67', 'm.manga@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Tshimanga Kabongo'   , '84 234 56 78', 't.kabongo@mail.cd'   , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent'),
('Lusamba Nzuzi'       , '85 345 67 89', 'l.nzuzi@mail.cd'     , '$2b$10$U005tSbISlvKfTP9XnBv.evJ0rws3cU9Hxd3CDZsXbhSLcC/0ZUKW', 'adherent');

-- Auteurs français
INSERT INTO auteurs (nom, nationalite) VALUES
('Victor Hugo'                , 'Française'),
('Alexandre Dumas'            , 'Française'),
('Jules Verne'                , 'Française'),
('Gustave Flaubert'           , 'Française'),
('Honoré de Balzac'           , 'Française'),
('Émile Zola'                 , 'Française'),
('Molière'                    , 'Française'),
('Guy de Maupassant'          , 'Française'),
('Marcel Proust'              , 'Française'),
('Albert Camus'               , 'Française'),
('Antoine de Saint-Exupéry'   , 'Française'),
('Voltaire'                   , 'Française'),
('Jean-Paul Sartre'           , 'Française'),
('Marguerite Duras'           , 'Française');

-- Livres
INSERT INTO livres (titre, auteur_id, annee_publication, disponible) VALUES
('Les Misérables'                     , 1 , 1862, TRUE),
('Notre-Dame de Paris'                , 1 , 1831, TRUE),
('Les Contemplations'                 , 1 , 1856, TRUE),
('L''Homme qui rit'                   , 1 , 1869, TRUE),
('Les Trois Mousquetaires'            , 2 , 1844, TRUE),
('Le Comte de Monte-Cristo'           , 2 , 1844, TRUE),
('La Reine Margot'                    , 2 , 1845, FALSE),
('Vingt Ans après'                    , 2 , 1845, TRUE),
('Vingt Mille Lieues sous les mers'   , 3 , 1870, TRUE),
('Le Tour du monde en quatre-vingts jours', 3, 1872, TRUE),
('Voyage au centre de la Terre'       , 3 , 1864, TRUE),
('L''Île mystérieuse'                 , 3 , 1874, FALSE),
('De la Terre à la Lune'              , 3 , 1865, TRUE),
('Madame Bovary'                      , 4 , 1856, TRUE),
('L''Éducation sentimentale'          , 4 , 1869, TRUE),
('Salammbô'                           , 4 , 1862, FALSE),
('Trois Contes'                       , 4 , 1877, TRUE),
('Le Père Goriot'                     , 5 , 1835, FALSE),
('Eugénie Grandet'                    , 5 , 1833, TRUE),
('Illusions perdues'                  , 5 , 1843, TRUE),
('La Peau de chagrin'                 , 5 , 1831, TRUE),
('Germinal'                           , 6 , 1885, FALSE),
('L''Assommoir'                       , 6 , 1877, TRUE),
('Nana'                               , 6 , 1880, FALSE),
('Au Bonheur des Dames'               , 6 , 1883, TRUE),
('Le Misanthrope'                     , 7 , 1666, TRUE),
('Tartuffe ou l''Imposteur'           , 7 , 1664, TRUE),
('L''Avare'                           , 7 , 1668, FALSE),
('Le Malade imaginaire'               , 7 , 1673, TRUE),
('Bel-Ami'                            , 8 , 1885, TRUE),
('Une vie'                            , 8 , 1883, TRUE),
('Boule de Suif'                      , 8 , 1880, TRUE),
('Du côté de chez Swann'              , 9 , 1913, FALSE),
('À l''ombre des jeunes filles en fleurs', 9, 1919, TRUE),
('L''Étranger'                        , 10, 1942, TRUE),
('La Peste'                           , 10, 1947, TRUE),
('La Chute'                           , 10, 1956, TRUE),
('Le Petit Prince'                    , 11, 1943, FALSE),
('Terre des hommes'                   , 11, 1939, TRUE),
('Vol de nuit'                        , 11, 1931, TRUE),
('Candide'                            , 12, 1759, FALSE),
('Zadig ou la Destinée'               , 12, 1747, TRUE),
('La Nausée'                          , 13, 1938, TRUE),
('Les Mains sales'                    , 13, 1948, FALSE),
('L''Amant'                           , 14, 1984, TRUE),
('Moderato cantabile'                 , 14, 1958, TRUE);

-- Emprunts : historique sur environ deux semaines (>= 1 semaine complète).
-- Retournés (rendus à l'heure ou en retard), en cours, et en retard.
INSERT INTO emprunts (user_id, livre_id, date_emprunt, date_retour_prevue, date_retour_effective) VALUES
-- retournés à l'heure
(3 , 1 , NOW() - INTERVAL '12 days', NOW() + INTERVAL '2 days',  NOW() - INTERVAL '10 days'),
(4 , 6 , NOW() - INTERVAL '11 days', NOW() + INTERVAL '3 days',  NOW() - INTERVAL '8 days'),
(5 , 10, NOW() - INTERVAL '10 days', NOW() + INTERVAL '4 days',  NOW() - INTERVAL '6 days'),
(3 , 15, NOW() - INTERVAL '9 days',  NOW() + INTERVAL '5 days',  NOW() - INTERVAL '7 days'),
(6 , 20, NOW() - INTERVAL '8 days',  NOW() + INTERVAL '6 days',  NOW() - INTERVAL '4 days'),
(7 , 25, NOW() - INTERVAL '8 days',  NOW() + INTERVAL '6 days',  NOW() - INTERVAL '3 days'),
(8 , 30, NOW() - INTERVAL '7 days',  NOW() + INTERVAL '7 days',  NOW() - INTERVAL '2 days'),
(9 , 35, NOW() - INTERVAL '7 days',  NOW() + INTERVAL '7 days',  NOW() - INTERVAL '5 days'),
(10, 40, NOW() - INTERVAL '6 days',  NOW() + INTERVAL '8 days',  NOW() - INTERVAL '4 days'),
(11, 3 , NOW() - INTERVAL '6 days',  NOW() + INTERVAL '8 days',  NOW() - INTERVAL '1 day'),
-- retournés en retard
(11, 5 , NOW() - INTERVAL '13 days', NOW() - INTERVAL '4 days',  NOW() - INTERVAL '2 days'),
(12, 9 , NOW() - INTERVAL '12 days', NOW() - INTERVAL '3 days',  NOW() - INTERVAL '1 day'),
-- en cours (retour prévue dans le futur)
(12, 12, NOW() - INTERVAL '5 days',  NOW() + INTERVAL '9 days',  NULL),
(13, 18, NOW() - INTERVAL '5 days',  NOW() + INTERVAL '9 days',  NULL),
(14, 22, NOW() - INTERVAL '4 days',  NOW() + INTERVAL '10 days', NULL),
(3 , 28, NOW() - INTERVAL '4 days',  NOW() + INTERVAL '10 days', NULL),
(4 , 33, NOW() - INTERVAL '3 days',  NOW() + INTERVAL '11 days', NULL),
(5 , 38, NOW() - INTERVAL '3 days',  NOW() + INTERVAL '11 days', NULL),
(6 , 41, NOW() - INTERVAL '2 days',  NOW() + INTERVAL '12 days', NULL),
(7 , 44, NOW() - INTERVAL '2 days',  NOW() + INTERVAL '12 days', NULL),
-- en retard (non rendus, retour prévue dépassée)
(8 , 7 , NOW() - INTERVAL '12 days', NOW() - INTERVAL '1 day',   NULL),
(9 , 16, NOW() - INTERVAL '11 days', NOW() - INTERVAL '2 days',  NULL),
(10, 24, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days',  NULL);