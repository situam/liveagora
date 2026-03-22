
/*
Usage: sqlite3 db.sqlite < 20260321_remove_open_prefix.sql
*/

BEGIN TRANSACTION;
PRAGMA foreign_keys = OFF;

UPDATE agora_passwords
SET id = REPLACE(id, 'open/', '')
WHERE id LIKE '%open/%';

UPDATE documents
SET name = REPLACE(name, 'open/', '')
WHERE name LIKE '%open/%';

UPDATE space_passwords
SET id = REPLACE(id, 'open/', '')
WHERE id LIKE '%open/%';

PRAGMA foreign_keys = ON;
COMMIT;