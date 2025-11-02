-- Database initialization script for Docker
-- This script runs when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create additional databases for testing
CREATE DATABASE aivo_test;
CREATE DATABASE aivo_dev_shadow;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE aivo_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE aivo_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE aivo_dev_shadow TO postgres;

-- Create a dedicated user for the application (optional)
-- Uncomment if you want to use a separate user instead of postgres
-- CREATE USER aivo_user WITH PASSWORD 'aivo_password';
-- GRANT ALL PRIVILEGES ON DATABASE aivo_dev TO aivo_user;
-- GRANT ALL PRIVILEGES ON DATABASE aivo_test TO aivo_user;