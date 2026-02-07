#!/bin/sh

# Environment check
echo "Starting backend service..."
echo "Database URL: $DATABASE_URL"

# Wait for Postgres to be ready
echo "Waiting for database to be ready..."
until npx tsx -e "require('net').createConnection(5432, 'postgres').on('connect', () => { process.exit(0) }).on('error', () => { process.exit(1) })"; do
  echo "Database not ready yet. Retrying in 2 seconds..."
  sleep 2
done
echo "Database is ready!"

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Running seed script..."
npx tsx prisma/seed.ts

echo "Starting application in watch mode..."
exec npx tsx watch src/server.ts
