type FilterCondition<T> = {
  eq?: T;
  ne?: T;
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  in?: T[];
  notIn?: T[];
};

type Filter<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? U
    : T[P] | FilterCondition<T[P]>;
};

interface Repository<T> {
  find(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<boolean>;
  update(id: string, entity: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<void>;
}
