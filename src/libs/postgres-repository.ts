import { Pool } from 'pg';
import { Repository } from './repository';

export class PostgresRepository<T> implements Repository<T> {
  constructor(
    private tableName: string,
    private schema: string,
    private pool: Pool,
  ) {}

  private serialize(value: unknown): string {
    if (typeof value === 'string') {
      return `'${value}'`;
    }
    if (value === null || value === undefined) {
      return 'null';
    }
    return String(value);
  }

  async createTable(): Promise<void> {
    await this.pool.query(this.schema);
  }

  async ensureTableExists(): Promise<void> {
    const tableExists = await this.pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [this.tableName],
    );

    if (!tableExists.rows[0].exists) {
      await this.createTable();
    }
  }

  async find(): Promise<T[]> {
    const res = await this.pool.query(`SELECT * FROM ${this.tableName}`);
    return res.rows;
  }

  async findById(id: string): Promise<T | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
    return res.rows[0] || null;
  }

  async create(entity: Partial<T>): Promise<boolean> {
    const keys = Object.keys(entity as Record<string, unknown>);
    const values = Object.values(entity as Record<string, unknown>);
    const serializedValues = values.map((value) => this.serialize(value));

    const res = await this.pool.query(
      `INSERT INTO ${this.tableName} (${keys.join(
        ', ',
      )}) VALUES (${serializedValues.join(', ')})`,
    );
    return (res.rowCount || 0) > 0;
  }

  async update(id: string, entity: Partial<T>): Promise<boolean> {
    const setClause = Object.entries(entity)
      .map(([key, value]) => `${key} = ${this.serialize(value)}`)
      .join(', ');

    const res = await this.pool.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ${this.serialize(
        id,
      )}`,
    );
    return (res.rowCount || 0) > 0;
  }

  async delete(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }
}
