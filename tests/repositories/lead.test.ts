import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { PostgresRepository } from '../../src/libs/postgres-repository';
import { LeadService, type Lead } from '../../src/repositories/lead';

async function fixtures() {
  const dbName = process.env.POSTGRES_DB || faker.string.alpha(7);
  const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: dbName,
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  };

  const adminPool = new Pool({
    ...config,
    database: 'postgres',
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

  const pool = new Pool(config);

  const repository = new PostgresRepository<Lead>(
    'leads',
    'CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, mobile VARCHAR(50) NOT NULL, postcode VARCHAR(20) NOT NULL, service VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    pool,
  );

  await pool.query('DELETE FROM leads');

  return {
    pool,
    repository,
    async teardown() {
      await pool.query('DELETE FROM leads');
      await pool.end();
    },
  };
}

describe('LeadRepository', () => {
  describe('create', () => {
    it('should create a new lead', async () => {
      const { repository, teardown } = await fixtures();
      const leadData: Partial<Lead> = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        mobile: faker.phone.number(),
        postcode: faker.location.zipCode(),
        service: faker.helpers.arrayElement(Object.values(LeadService)),
      };

      const result = await repository.create(leadData);
      expect(result).toBe(true);

      const leads = await repository.find();
      expect(leads.length).toBe(1);
      expect(leads[0].name).toBe(leadData.name);
      expect(leads[0].email).toBe(leadData.email);

      await teardown();
    });
  });

  describe('find', () => {
    it('should return empty array when no leads exist', async () => {
      const { repository, teardown } = await fixtures();
      const leads = await repository.find();
      expect(leads).toEqual([]);
      await teardown();
    });

    it('should return all leads', async () => {
      const { repository, teardown } = await fixtures();

      await Promise.all(
        Array.from({ length: 10 }, () =>
          repository.create({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            mobile: faker.phone.number(),
            postcode: faker.location.zipCode(),
            service: faker.helpers.arrayElement(Object.values(LeadService)),
          }),
        ),
      );

      const leads = await repository.find();
      expect(leads.length).toBe(10);
      await teardown();
    });
  });

  describe('findById', () => {
    it('should return null when lead does not exist', async () => {
      const { repository, teardown } = await fixtures();
      const lead = await repository.findById('999');
      expect(lead).toBeNull();
      await teardown();
    });

    it('should return a lead by id', async () => {
      const { repository, teardown } = await fixtures();
      const leadData: Partial<Lead> = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        mobile: faker.phone.number(),
        postcode: faker.location.zipCode(),
        service: faker.helpers.arrayElement(Object.values(LeadService)),
      };

      await repository.create(leadData);
      const leads = await repository.find();
      const createdLead = leads[0];

      const foundLead = await repository.findById(String(createdLead.id));
      expect(foundLead).not.toBeNull();
      expect(foundLead?.name).toBe(leadData.name);
      expect(foundLead?.email).toBe(leadData.email);
      await teardown();
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const { repository, teardown } = await fixtures();
      const leadData: Partial<Lead> = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        mobile: faker.phone.number(),
        postcode: faker.location.zipCode(),
        service: faker.helpers.arrayElement(Object.values(LeadService)),
      };

      await repository.create(leadData);
      const leads = await repository.find();
      const createdLead = leads[0];

      const updateData: Partial<Lead> = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const result = await repository.update(
        String(createdLead.id),
        updateData,
      );
      expect(result).toBe(true);

      const updatedLead = await repository.findById(String(createdLead.id));
      expect(updatedLead?.name).toBe('Jane Doe');
      expect(updatedLead?.email).toBe('jane@example.com');
      await teardown();
    });
  });

  describe('delete', () => {
    it('should delete a lead', async () => {
      const { repository, teardown } = await fixtures();
      const leadData: Partial<Lead> = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        mobile: faker.phone.number(),
        postcode: faker.location.zipCode(),
        service: faker.helpers.arrayElement(Object.values(LeadService)),
      };

      await repository.create(leadData);
      const leads = await repository.find();
      const createdLead = leads[0];

      await repository.delete(String(createdLead.id));

      const deletedLead = await repository.findById(String(createdLead.id));
      expect(deletedLead).toBeNull();
      await teardown();
    });
  });
});
