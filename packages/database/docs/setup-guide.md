# Database Setup Guide

## Overview
This guide helps you set up the PostgreSQL database for the Aivo Platform development environment.

## Prerequisites
- PostgreSQL 14+ installed locally
- Node.js and pnpm installed
- Docker (optional, for containerized setup)

## Setup Options

### Option 1: Local PostgreSQL Installation

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:
   - Windows: Service should start automatically
   - macOS: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

3. **Create database and user**:
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres
   
   -- Create database
   CREATE DATABASE aivo_dev;
   
   -- Create user (optional, for better security)
   CREATE USER aivo_user WITH PASSWORD 'aivo_password';
   GRANT ALL PRIVILEGES ON DATABASE aivo_dev TO aivo_user;
   
   -- Exit psql
   \q
   ```

4. **Configure environment**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your database credentials
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aivo_dev?schema=public"
   ```

### Option 2: Docker Setup (Recommended for Development)

1. **Create Docker Compose file**:
   ```yaml
   # docker-compose.yml in packages/database/
   version: '3.8'
   services:
     postgres:
       image: postgres:15-alpine
       environment:
         POSTGRES_DB: aivo_dev
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
   
   volumes:
     postgres_data:
   ```

2. **Start the database**:
   ```bash
   docker-compose up -d
   ```

3. **Configure environment**:
   ```bash
   # Use the Docker database URL
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aivo_dev?schema=public"
   ```

## Database Migration and Setup

### 1. Validate Schema
```bash
cd packages/database
npx prisma validate
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Migrations
```bash
# Push schema to database (for development)
npx prisma db push

# OR create and run migrations (for production)
npx prisma migrate dev --name init
```

### 4. Seed Database (Optional)
```bash
npx prisma db seed
```

### 5. Open Prisma Studio
```bash
npx prisma studio
```

## Environment Variables

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `PRISMA_STUDIO_PORT`: Port for Prisma Studio (default: 5555)

### Optional Variables
- `SHADOW_DATABASE_URL`: Shadow database for migrations
- `LOG_LEVEL`: Database logging level (info, warn, error)

### Example .env File
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aivo_dev?schema=public"

# Prisma
PRISMA_STUDIO_PORT=5555

# Optional: Shadow database for migrations
# SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aivo_dev_shadow?schema=public"

# Optional: Logging
LOG_LEVEL=info
```

## Common Commands

### Development Workflow
```bash
# Validate schema
npx prisma validate

# Generate client
npx prisma generate

# Push schema changes (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Reset database (careful!)
npx prisma migrate reset

# Open database browser
npx prisma studio

# View current schema
npx prisma introspect
```

### Production Commands
```bash
# Deploy migrations
npx prisma migrate deploy

# Generate client for production
npx prisma generate

# Check migration status
npx prisma migrate status
```

## Schema Features

### Multi-Tenancy
- All data is isolated by `tenant_id`
- Row-level security policies ensure data isolation
- Hierarchical organization: Tenant → District → School → Classroom

### Phase 1 Features
- **Focus Guardian**: Attention monitoring and interventions
- **Game Generation**: AI-powered educational games
- **Homework Helper**: Step-by-step homework assistance
- **Writing Pad**: Collaborative writing with AI feedback

### Security Features
- COPPA-compliant consent management
- MFA support with TOTP and backup codes
- Comprehensive audit trails
- Soft delete support

### Performance Optimization
- Strategic compound indexes
- JSONB fields for flexible data
- Optimized query patterns

## Troubleshooting

### Common Issues

1. **Connection refused**:
   - Ensure PostgreSQL is running
   - Check host and port in DATABASE_URL
   - Verify firewall settings

2. **Authentication failed**:
   - Check username and password
   - Verify user permissions
   - Check pg_hba.conf configuration

3. **Database does not exist**:
   - Create database manually
   - Check database name in URL
   - Ensure proper permissions

4. **Migration errors**:
   - Check for conflicting schema changes
   - Reset database if needed (development only)
   - Review migration logs

### Useful SQL Commands
```sql
-- Check database connections
SELECT * FROM pg_stat_activity WHERE datname = 'aivo_dev';

-- Check database size
SELECT pg_size_pretty(pg_database_size('aivo_dev'));

-- List all tables
\dt

-- Describe table structure
\d+ users

-- Check indexes
\di
```

## Production Considerations

### Security
- Use strong passwords and connection encryption
- Enable SSL/TLS connections
- Configure proper firewall rules
- Use connection pooling
- Enable query logging and monitoring

### Performance
- Configure appropriate memory settings
- Set up connection pooling (PgBouncer)
- Monitor query performance
- Regular maintenance (VACUUM, ANALYZE)
- Set up read replicas if needed

### Backup and Recovery
- Configure automated backups
- Test restore procedures
- Set up point-in-time recovery
- Monitor backup integrity

## Support

For additional help:
1. Check Prisma documentation: https://prisma.io/docs
2. PostgreSQL documentation: https://postgresql.org/docs
3. Review error logs in PostgreSQL log directory
4. Use Prisma Studio for database exploration