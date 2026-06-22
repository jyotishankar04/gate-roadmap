#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect()
    .then(() => { client.end(); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done
echo "PostgreSQL is ready."

echo "Applying database schema..."
prisma db push --skip-generate
echo "Database schema is up to date."

echo "Starting Gatetrack..."
exec node server.js
