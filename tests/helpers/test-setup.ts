import { ApolloServer } from '@apollo/server';
import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { PostgresRepository } from '../../src/libs/postgres-repository';
import type { Lead } from '../../src/repositories/lead';
import { createTestServer } from './test-server';

export interface TestContext {
  server: ApolloServer;
  pool: Pool;
  repository: PostgresRepository<Lead>;
  database: string;
  user: string;
  host: string;
  password: string;
  port: number;
}

async function ensureDatabaseExists(
  dbName: string,
  user: string,
  host: string,
  password: string,
  port: number,
): Promise<void> {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) {
    throw new Error(`Invalid database name: ${dbName}`);
  }

  const adminPool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  });

  try {
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (result.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await adminPool.end();
  }
}

export async function setupTestContext(): Promise<TestContext> {
  const server = await createTestServer();

  const user = process.env.POSTGRES_USER || 'postgres';
  const host = process.env.POSTGRES_HOST || 'localhost';
  const database = process.env.POSTGRES_DB || faker.string.alpha(7);
  const password = process.env.POSTGRES_PASSWORD || 'password';
  const port = parseInt(process.env.POSTGRES_PORT || '5432');

  await ensureDatabaseExists(database, user, host, password, port);

  const pool = new Pool({
    user,
    host,
    database,
    password,
    port,
    idleTimeoutMillis: 100,
    connectionTimeoutMillis: 1000,
  });

  const repository = new PostgresRepository<Lead>(
    'leads',
    'CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, mobile VARCHAR(50) NOT NULL, postcode VARCHAR(20) NOT NULL, service VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    pool,
  );

  await repository.ensureTableExists();

  return { server, pool, repository, database, user, host, password, port };
}

export async function cleanupTestContext(context: TestContext): Promise<void> {
  await context.server.stop();

  await context.pool.query('DELETE FROM leads');

  await context.pool.end();
}
