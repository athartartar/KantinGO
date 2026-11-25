CREATE USER IF NOT EXISTS 'kantingo_app'@'localhost' IDENTIFIED BY 'GantiDenganPasswordKuat!2026';

GRANT SELECT, INSERT, UPDATE, DELETE
ON kantingo.*
TO 'kantingo_app'@'localhost';

FLUSH PRIVILEGES;
