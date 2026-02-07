#!/bin/sh

# Environment check
echo "Starting backend service..."
echo "Database URL: $DATABASE_URL"

# Wait for Postgres to be ready (naive check, usually handled by depends_on condition or restart_policy, but explicit wait is safer)
# Since we don't have netcat (nc), we can retry connections with Prisma

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Running seed script..."
npx tsx prisma/seed.ts

echo "Starting application in watch mode..."
exec npx tsx watch src/server.ts
