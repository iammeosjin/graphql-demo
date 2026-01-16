export interface Repository<T> {
  find(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<boolean>;
  update(id: string, entity: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<void>;
}
