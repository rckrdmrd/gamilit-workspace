/**
 * TypeORM Mock for Jest
 *
 * @description Mocks TypeORM to avoid path-scurry compatibility issues with Node 20+
 * This mock provides stub implementations for commonly used TypeORM exports.
 *
 * SUBTASK-004: Fix TypeORM Compatibility
 */

// Mock decorators
export const Entity = () => jest.fn();
export const Column = () => jest.fn();
export const PrimaryColumn = () => jest.fn();
export const PrimaryGeneratedColumn = () => jest.fn();
export const CreateDateColumn = () => jest.fn();
export const UpdateDateColumn = () => jest.fn();
export const DeleteDateColumn = () => jest.fn();
export const ManyToOne = () => jest.fn();
export const OneToMany = () => jest.fn();
export const OneToOne = () => jest.fn();
export const ManyToMany = () => jest.fn();
export const JoinColumn = () => jest.fn();
export const JoinTable = () => jest.fn();
export const Index = () => jest.fn();
export const Unique = () => jest.fn();
export const Check = () => jest.fn();
export const Exclusion = () => jest.fn();
export const BeforeInsert = () => jest.fn();
export const BeforeUpdate = () => jest.fn();
export const AfterInsert = () => jest.fn();
export const AfterUpdate = () => jest.fn();
export const AfterLoad = () => jest.fn();

// Mock operators
export const LessThan = jest.fn((value) => ({ _type: 'lessThan', _value: value }));
export const LessThanOrEqual = jest.fn((value) => ({ _type: 'lessThanOrEqual', _value: value }));
export const MoreThan = jest.fn((value) => ({ _type: 'moreThan', _value: value }));
export const MoreThanOrEqual = jest.fn((value) => ({ _type: 'moreThanOrEqual', _value: value }));
export const Equal = jest.fn((value) => ({ _type: 'equal', _value: value }));
export const Not = jest.fn((value) => ({ _type: 'not', _value: value }));
export const Like = jest.fn((value) => ({ _type: 'like', _value: value }));
export const ILike = jest.fn((value) => ({ _type: 'ilike', _value: value }));
export const Between = jest.fn((from, to) => ({ _type: 'between', _from: from, _to: to }));
export const In = jest.fn((values) => ({ _type: 'in', _values: values }));
export const IsNull = jest.fn(() => ({ _type: 'isNull' }));
export const Raw = jest.fn((value) => ({ _type: 'raw', _value: value }));

// Mock Repository class - must be a proper class for instanceof checks
export class Repository<T = any> {
  target: any;
  manager: any;
  metadata: any;

  find = jest.fn();
  findOne = jest.fn();
  findOneBy = jest.fn();
  findAndCount = jest.fn();
  findBy = jest.fn();
  save = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  remove = jest.fn();
  count = jest.fn();
  increment = jest.fn();
  decrement = jest.fn();
  createQueryBuilder = jest.fn();
  query = jest.fn();
  clear = jest.fn();
  insert = jest.fn();
  preload = jest.fn();
  softDelete = jest.fn();
  softRemove = jest.fn();
  restore = jest.fn();
  recover = jest.fn();
  getId = jest.fn();
  hasId = jest.fn();
  merge = jest.fn();
  extend = jest.fn();
}

// Mock AbstractRepository class (for custom repository pattern)
export class AbstractRepository<T = any> {
  repository: Repository<T> = new Repository<T>();
}

// Mock EntitySchema class
export class EntitySchema<T = any> {
  options: any;
  constructor(options: any) {
    this.options = options;
  }
}

// Mock DataSource class
export class DataSource {
  isInitialized = false;
  options = {};

  initialize = jest.fn().mockResolvedValue(this);
  destroy = jest.fn().mockResolvedValue(undefined);
  getRepository = jest.fn().mockReturnValue(new Repository());
  createQueryRunner = jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      findOne: jest.fn(),
    },
  });
  manager = {
    transaction: jest.fn((cb) => cb({
      save: jest.fn(),
      findOne: jest.fn(),
    })),
  };
}

// Mock EntityManager
export class EntityManager {
  save = jest.fn();
  findOne = jest.fn();
  find = jest.fn();
  remove = jest.fn();
  delete = jest.fn();
  transaction = jest.fn();
}

// Mock SelectQueryBuilder
export class SelectQueryBuilder<T = any> {
  select = jest.fn().mockReturnThis();
  addSelect = jest.fn().mockReturnThis();
  where = jest.fn().mockReturnThis();
  andWhere = jest.fn().mockReturnThis();
  orWhere = jest.fn().mockReturnThis();
  orderBy = jest.fn().mockReturnThis();
  addOrderBy = jest.fn().mockReturnThis();
  groupBy = jest.fn().mockReturnThis();
  having = jest.fn().mockReturnThis();
  limit = jest.fn().mockReturnThis();
  offset = jest.fn().mockReturnThis();
  take = jest.fn().mockReturnThis();
  skip = jest.fn().mockReturnThis();
  leftJoin = jest.fn().mockReturnThis();
  leftJoinAndSelect = jest.fn().mockReturnThis();
  innerJoin = jest.fn().mockReturnThis();
  innerJoinAndSelect = jest.fn().mockReturnThis();
  getOne = jest.fn();
  getMany = jest.fn();
  getManyAndCount = jest.fn();
  getRawOne = jest.fn();
  getRawMany = jest.fn();
  getCount = jest.fn();
  execute = jest.fn();
}

// Mock ObjectLiteral type
export type ObjectLiteral = Record<string, any>;

// Mock DeepPartial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

// Mock FindOptionsWhere
export type FindOptionsWhere<T> = {
  [P in keyof T]?: T[P] | any;
};

// Mock getMetadataArgsStorage (needed by some decorators)
export const getMetadataArgsStorage = jest.fn().mockReturnValue({
  tables: [],
  columns: [],
  relations: [],
  joinColumns: [],
  indices: [],
});
