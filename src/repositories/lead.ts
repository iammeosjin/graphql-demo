import { Pool } from 'pg';
import pool from '../libs/pool';
import { PostgresRepository } from '../libs/postgres-repository';

export enum LeadService {
  DELIVERY = 'DELIVERY',
  PICK_UP = 'PICK_UP',
  PAYMENT = 'PAYMENT',
}

export type Lead = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  createdAt: Date;
  service: LeadService;
};

function LeadRepository(pool: Pool) {
  return new PostgresRepository<Lead>(
    'leads',
    'CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, mobile VARCHAR(50) NOT NULL, postcode VARCHAR(20) NOT NULL, service VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    pool,
  );
}

export default LeadRepository(pool);
