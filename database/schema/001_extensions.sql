-- HackMate AI — Neon PostgreSQL Extensions Setup
-- 001_extensions.sql
-- Enables core cryptographic and UUID extension layers in PostgreSQL.

-- Enable extension for generating UUID v4 keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable extension for cryptographic hashes (used for password crypt/hashing if done inside DB)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable case-insensitive text extension (useful for unique emails or domains validation)
CREATE EXTENSION IF NOT EXISTS "citext";
