# HackMate AI Database Setup (Neon PostgreSQL)

This directory contains the production-grade database schema scripts for HackMate AI, optimized for deployment on **Neon PostgreSQL**.

---

## 1. Setup Instructions (Step-by-Step)

### A. Create a Neon Project
1. Log in to the [Neon Console](https://console.neon.tech/).
2. Click **Create Project** and specify:
   * **Project Name**: `hackmate-db`
   * **PostgreSQL Version**: `15` or newer.
   * **Region**: Select the region closest to your application host.
3. Click **Create Project**.
4. Neon will display your **Connection String**. Copy it for the configuration phase.

### B. Run SQL Scripts
Deploy the SQL scripts in the following exact order:

```bash
# 1. Enable Required Extensions
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/001_extensions.sql

# 2. Build Schema Tables (3NF)
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/002_tables.sql

# 3. Apply Constraints & Validation Rules
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/003_constraints.sql

# 4. Generate B-Tree and GIN Indexes
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/004_indexes.sql

# 5. Compile Trigger Functions
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/007_functions.sql

# 6. Bind Triggers to Table Actions
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/006_triggers.sql

# 7. Compile Core Views
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/schema/005_views.sql

# 8. Seed Default System Configurations
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/seed/001_seed_data.sql

# 9. Seed Mock Test Records (matches Frontend mockup states)
psql -d "YOUR_NEON_CONNECTION_STRING" -f database/seed/002_test_data.sql
```

---

## 2. Configuration Settings

### Connection Pool Configuration
To prevent asynchronous FastAPI servers from exhausting Neon connections under load, configure the database connection string to utilize the built-in **PGBouncer** pooler:
* **Standard URL**: `postgres://[user]:[password]@[host]/[dbname]`
* **Pooled URL (PGBouncer)**: `postgres://[user]:[password]@[host]-pooler/[dbname]?sslmode=require`

### Environment Variables Template
Store these variables inside your `.env` configuration file in the project backend folder:

```env
# Database Credentials
DATABASE_URL="postgres://user:password@ep-cool-snowflake-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgres://user:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Security
JWT_SECRET_KEY="replace-this-with-a-secure-random-64-character-hex-string"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## 3. Database Verification Checklist

To confirm that the database is fully operational, run these queries inside the Neon SQL console:

✔ **Check Table Registries**:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Expected outcome: Return 34 tables.
```

✔ **Verify Team Progress Trigger**:
```sql
-- Completed tasks automatically calculate team progress.
-- Run an insert check:
INSERT INTO tasks (team_id, title, status, progress_percentage) 
VALUES ('t-1-bytecraft-workspace-id', 'Test Task Progress Recalculation', 'completed', 100);

-- Query the parent team progress:
SELECT name, progress_percentage FROM teams WHERE id = 't-1-bytecraft-workspace-id';
-- Expected outcome: progress_percentage has been updated.
```

✔ **Query Leaderboard View**:
```sql
SELECT * FROM view_leaderboard_rankings;
-- Expected outcome: Displays ranked standings for active teams.
```
