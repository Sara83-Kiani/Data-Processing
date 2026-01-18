-- roles
CREATE ROLE IF NOT EXISTS junior_role;
CREATE ROLE IF NOT EXISTS mid_role;
CREATE ROLE IF NOT EXISTS senior_role;
CREATE ROLE IF NOT EXISTS api_user_account;
CREATE ROLE IF NOT EXISTS backup_role;

-- junior role:
-- - Can read limited fields from Account
-- - Can read all fields from Profile
-- - Cannot update anything
-- - Cannot see financial data (Subscription.price, payments, etc.)
GRANT SELECT (account_id, email, is_activated, registration_date)
ON mydb.Account TO junior_role;

GRANT SELECT ON mydb.Profile TO junior_role;

-- mid role:
-- - Inherits junior_role privileges
-- - Can update activation / block status on Account
-- - Can update basic profile data
GRANT junior_role TO mid_role;

GRANT UPDATE (is_activated, is_blocked)
ON mydb.Account TO mid_role;

GRANT UPDATE (name, age, language)
ON mydb.Profile TO mid_role;

-- Senior role:
-- - Full access on the project database
GRANT ALL PRIVILEGES ON mydb.* TO senior_role;

-- dev role:
-- - Full access on the project database
GRANT senior_role TO api_user_account;

-- Backup role:
-- - Read-only access for database backups
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON mydb.* TO backup_role;

CREATE USER IF NOT EXISTS 'junior1'@'%' IDENTIFIED BY 'juniorpwd';
CREATE USER IF NOT EXISTS 'mid1'@'%'    IDENTIFIED BY 'midpwd';
CREATE USER IF NOT EXISTS 'senior1'@'%' IDENTIFIED BY 'seniorpwd';
CREATE USER IF NOT EXISTS 'apiuser1'@'%' IDENTIFIED BY 'apiuserpwd';
CREATE USER IF NOT EXISTS 'backup_user'@'%' IDENTIFIED BY 'backuppwd';

GRANT junior_role TO 'junior1'@'%';
GRANT mid_role    TO 'mid1'@'%';
GRANT senior_role TO 'senior1'@'%';
GRANT api_user_account TO 'apiuser1'@'%';
GRANT backup_role TO 'backup_user'@'%';

-- Make the roles active by default when the users log in
SET DEFAULT ROLE junior_role TO 'junior1'@'%';
SET DEFAULT ROLE mid_role    TO 'mid1'@'%';
SET DEFAULT ROLE senior_role TO 'senior1'@'%';
SET DEFAULT ROLE api_user_account TO 'apiuser1'@'%';
SET DEFAULT ROLE backup_role TO 'backup_user'@'%';