# Database Setup for Repositories

## Overview

Many repositories need a PostgreSQL database to run. The testing harness can automatically set up Docker PostgreSQL containers for each repository.

## Two Types of Database Needs

### 1. **Repository Databases** (for the actual applications)
- Many repositories store data in PostgreSQL
- Each repository might need its own database
- The harness can set this up automatically

### 2. **Langfuse Database** (NOT needed with Cloud)
- ❌ **You don't need this** - Langfuse Cloud handles its own database
- Only needed if you were self-hosting Langfuse (which we're not doing)

## Setting Up Database for a Repository

### Option 1: Automatic Setup (Recommended)

```bash
cd /path/to/repository
python ../testing_harness.py setup-postgres
```

This will:
- ✅ Create a `docker-compose.yml` in the repository
- ✅ Start a PostgreSQL container
- ✅ Create the database
- ✅ Update `.env` with database connection info

### Option 2: Use Shared Database

If multiple repositories can share a database, you can:

1. **Start a shared PostgreSQL** (from Research root):
   ```bash
   docker compose -f docker-compose.yml up -d
   ```

2. **All repositories will use it** (via `master.env`):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=test_user
   DB_PASSWORD=test_password
   DB_NAME=test_db
   ```

## Database Configuration in master.env

Your `master.env` already has database settings:

```env
# Database Configuration (shared across repositories)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=test_db
```

These values are automatically inherited by repositories when you run the harness.

## How It Works

### When You Run `setup-postgres`:

1. **Creates `docker-compose.yml`** in the repository:
   ```yaml
   services:
     postgres:
       image: postgres:15-alpine
       container_name: repo_name_postgres
       environment:
         POSTGRES_USER: test_user
         POSTGRES_PASSWORD: test_password
         POSTGRES_DB: repo_name_db
       ports:
         - "5432:5432"  # Or custom port
   ```

2. **Starts the container**:
   ```bash
   docker compose up -d
   ```

3. **Updates `.env`** with connection info:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=test_user
   DB_PASSWORD=test_password
   DB_NAME=repo_name_db
   ```

### When You Run Other Commands:

Commands like `setup-chatgpt`, `setup-azure-openai`, or `setup-langfuse` automatically include database configuration in the `.env` file from `master.env`.

## Do You Need a Database?

**Check if the repository needs a database:**

1. **Look for database migrations**:
   ```bash
   find . -name "*migration*" -o -name "*schema*" -o -name "*models.py"
   ```

2. **Check for database config**:
   ```bash
   grep -r "DATABASE_URL\|DB_HOST\|postgres" --include="*.py" --include="*.env*"
   ```

3. **Check README**:
   - Most repos document database requirements
   - Look for setup instructions

## Managing Databases

### Start Database
```bash
cd /path/to/repository
docker compose up -d
```

### Stop Database
```bash
cd /path/to/repository
python ../testing_harness.py stop-postgres
# Or manually:
docker compose down
```

### Check Status
```bash
docker ps | grep postgres
```

### View Logs
```bash
docker logs repo_name_postgres
```

### Connect to Database
```bash
docker exec -it repo_name_postgres psql -U test_user -d repo_name_db
```

## Port Conflicts

If port 5432 is already in use:

```bash
# Use a different port
python ../testing_harness.py setup-postgres --port 5433
```

The harness will update the `.env` file with the correct port.

## Multiple Repositories

Each repository can have its own database:

- **Repository 1**: `repo1_postgres` on port 5432
- **Repository 2**: `repo2_postgres` on port 5433
- **Repository 3**: `repo3_postgres` on port 5434

Or they can all share one database (if compatible).

## Summary

✅ **Database setup is automatic** - just run `setup-postgres`  
✅ **Configuration is inherited** - from `master.env`  
✅ **Each repo can have its own DB** - or share one  
✅ **Langfuse doesn't need a database** - it uses Langfuse Cloud  

## Quick Reference

```bash
# Setup database for a repository
cd /path/to/repo
python ../testing_harness.py setup-postgres

# Stop database
python ../testing_harness.py stop-postgres

# Check if database is running
docker ps | grep postgres
```
