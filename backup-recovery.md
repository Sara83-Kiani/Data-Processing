# Backup & Recovery Guide

This document describes how to create and restore backups for the StreamFlix MySQL database.

---
## Why Backups Are Needed
The StreamFlix database stores critical application data such as user accounts, profiles, subscriptions, watch history, and content metadata. If this data is lost due to accidental deletion, corrupted imports, failed migrations, or Docker volume removal, the API would no longer function correctly.

Backups ensure that the database can be restored to a known working state. This is especially important in a containerized environment where data volumes can be recreated or removed. Implementing backups demonstrates responsible data processing and database management practices.

## Backup Location

Backups are stored in the `backups/` folder in the project root. Create this folder if it doesn't exist:

```bash
mkdir backups
```

---

## Creating a Backup

Backups are performed using a dedicated database user with read access (e.g. `backup_user`). In local development environments, the root user may be used for simplicity, although a dedicated backup user is preferred.

Use `mysqldump` to export the database. Run this command from the project root:

```bash
docker exec data_processing_mysql mysqldump --no-tablespaces -u backup_user -p mydb > backups/mydb_backup_$(date +%Y%m%d_%H%M%S).sql
```
## Why This Backup Method Was Chosen
The `mysqldump` tool was chosen because it creates a logical SQL backup that is portable and easy to restore on any MySQL server. The backup file contains both the database structure and the stored data, making it suitable for full recovery.

This method was selected because:
- The backup is human-readable and easy to verify
- It works reliably inside Docker using `docker exec`
- A dedicated read-only backup user can be used, following the principle of least privilege
- It does not require special MySQL server access or binary files
- The `--no-tablespaces` option avoids requiring unnecessary privileges such as `PROCESS`

This approach provides a simple, secure, and reliable backup solution suitable for this project.

**Windows (PowerShell):**
```powershell
docker exec data_processing_mysql mysqldump --no-tablespaces -u backup_user -p mydb > backups/mydb_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

This creates a timestamped SQL file containing:
- All table structures (CREATE TABLE statements)
- All data (INSERT statements)
- Indexes and constraints

---

## Restoring from Backup

> ⚠️ **Warning:** Restoring a backup will overwrite existing data in the target database.

To restore the database from a backup file:

```bash
docker exec -i data_processing_mysql mysql -u backup_user -p mydb < backups/mydb_backup_YYYYMMDD_HHMMSS.sql
```

**Windows (PowerShell):**
```powershell
Get-Content backups/mydb_backup_YYYYMMDD_HHMMSS.sql | docker exec -i data_processing_mysql mysql -u backup_user -p mydb
```

> **Note:** Replace `YYYYMMDD_HHMMSS` with the actual timestamp of your backup file.

---

## Recovery Objectives

- **RPO (Recovery Point Objective):** Up to the last manual backup (maximum data loss depends on backup frequency).
- **RTO (Recovery Time Objective):** Approximately 5–10 minutes to restore the database using mysqldump.

---

## Backup Schedule

| Type | Frequency | Responsibility |
|------|-----------|----------------|
| Manual | As needed | Developer |
| Before major changes | Always | Developer |

**Recommended practice:** Create a backup before:
- Running database migrations
- Importing new data
- Making schema changes
- Deploying to production

---

## Verification Steps

After restoring a backup, verify it worked correctly:

### 1. Check Table Count
```bash
docker exec data_processing_mysql mysql -u backup_user -p -e "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'mydb';"
```

Expected output: 15+ tables

### 2. Check Record Counts
```bash
docker exec data_processing_mysql mysql -u backup_user -p mydb -e "SELECT 'accounts' AS tbl, COUNT(*) AS cnt FROM account UNION SELECT 'movies', COUNT(*) FROM movie UNION SELECT 'series', COUNT(*) FROM series;"
```

### 3. Test API Endpoints
After restore, verify the API returns data:
```bash
curl http://localhost:3000/content/movies
curl http://localhost:3000/content/genres
```

If these return data, the restore was successful.

---
## 3-2-1 Backup Rule
The 3-2-1 backup rule is a widely accepted best practice for data protection:

- 3 copies of the data (1 primary copy and 2 backups)
- 2 different types of storage
- 1 copy stored off-site

Due to the scope of this project, the off-site copy is documented but not automated.

**Current implementation:**
- Primary copy: The live MySQL database stored in the Docker volume
- Second copy: A SQL backup file stored locally in the `backups/` folder

**Recommended extension:**
- Third copy: Store an additional copy off-site (for example, cloud storage or external drive)

This strategy reduces the risk of total data loss caused by hardware failure, accidental deletion, or system misconfiguration.

---
## Troubleshooting

**"Access denied" error:**  
Ensure the password matches your `.env` file. For `backup_user`, check `DB_BACKUP_PASSWORD`; for local dev with root, check `DB_ROOT_PASSWORD`.

**"Unknown database" error:**  
The database may not exist. Create it first (requires elevated privileges):
```bash
docker exec data_processing_mysql mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mydb;"
```

**Container not running:**  
Start the containers first:
```bash
docker compose up -d mysql
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Create backup | `docker exec data_processing_mysql mysqldump --no-tablespaces -u backup_user -p mydb > backups/backup.sql` |
| Restore backup | `docker exec -i data_processing_mysql mysql -u backup_user -p mydb < backups/backup.sql` |
| List backups | `ls backups/` |
