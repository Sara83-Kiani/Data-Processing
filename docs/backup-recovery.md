# Backup & Recovery Guide

This document describes how to create and restore backups for the StreamFlix MySQL database.

---

## Backup Location

Backups are stored in the `backups/` folder in the project root. Create this folder if it doesn't exist:

```bash
mkdir backups
```

---

## Creating a Backup

Use `mysqldump` to export the database. Run this command from the project root:

```bash
docker exec data_processing_mysql mysqldump -u root -prootpassword streamflix > backups/streamflix_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Windows (PowerShell):**
```powershell
docker exec data_processing_mysql mysqldump -u root -prootpassword streamflix > backups/streamflix_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
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
docker exec -i data_processing_mysql mysql -u root -prootpassword streamflix < backups/streamflix_backup_YYYYMMDD_HHMMSS.sql
```

**Windows (PowerShell):**
```powershell
Get-Content backups/streamflix_backup_YYYYMMDD_HHMMSS.sql | docker exec -i data_processing_mysql mysql -u root -prootpassword streamflix
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
docker exec data_processing_mysql mysql -u root -prootpassword -e "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'streamflix';"
```

Expected output: 15+ tables

### 2. Check Record Counts
```bash
docker exec data_processing_mysql mysql -u root -prootpassword streamflix -e "SELECT 'accounts' AS tbl, COUNT(*) AS cnt FROM account UNION SELECT 'movies', COUNT(*) FROM movie UNION SELECT 'series', COUNT(*) FROM series;"
```

### 3. Test API Endpoints
After restore, verify the API returns data:
```bash
curl http://localhost:3000/content/movies
curl http://localhost:3000/content/genres
```

If these return data, the restore was successful.

---

## Troubleshooting

**"Access denied" error:**  
Ensure the password matches your `.env` file (`DB_ROOT_PASSWORD`).

**"Unknown database" error:**  
The database may not exist. Create it first:
```bash
docker exec data_processing_mysql mysql -u root -prootpassword -e "CREATE DATABASE IF NOT EXISTS streamflix;"
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
| Create backup | `docker exec data_processing_mysql mysqldump -u root -prootpassword streamflix > backups/backup.sql` |
| Restore backup | `docker exec -i data_processing_mysql mysql -u root -prootpassword streamflix < backups/backup.sql` |
| List backups | `ls backups/` |
