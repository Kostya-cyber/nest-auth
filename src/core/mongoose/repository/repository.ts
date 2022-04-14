// import { Ability } from '@casl/ability'
import { NotFoundException } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import {
  Model,
  Types,
  Document,
  FilterQuery,
  UpdateQuery,
  ClientSession,
} from 'mongoose';
// import { Action } from '../casl/casl-ability.factory'

export interface QueryOptions<T> {
  // ability?: Ability
  // skipCache?: boolean;
  projectColumns?: Array<keyof T>;
  session?: ClientSession;
  skipColumns?: Array<keyof T>;
}

export interface RepositoryOptions<T> {
  // useCache?: boolean;
  baseClass: ClassConstructor<T>;
  caslClass?: ClassConstructor<T>;
}

export class Repository<T, D extends Document> {
  constructor(
    private model: Model<T & D>,
    private options: RepositoryOptions<T>,
  ) {}

  private expandProjection(options?: QueryOptions<T>) {
    if (!options) {
      return {};
    }

    const include = options.projectColumns?.map((projectColumn) => ({
      [projectColumn]: 1,
    }));
    const exclude = options.skipColumns?.map((projectColumn) => ({
      [projectColumn]: 0,
    }));

    return { ...include, ...exclude };
  }

  async aggregate(pipeline: any[]) {
    return this.model.aggregate(pipeline);
  }

  async getById(id: Types.ObjectId, options?: QueryOptions<T>) {
    const document = await this.model
      .findById(id, this.expandProjection(options))
      .exec();

    if (!document) {
      throw new Error(
        `Document of type ${this.model.name} with ID ${id} not found`,
      );
    }

    return document;
  }

  async findOne(filter: FilterQuery<T & D>, options?: QueryOptions<T>) {
    const baseQuery = this.model.findOne(
      filter,
      this.expandProjection(options),
    );

    // if (options?.ability) {
    //   baseQuery = baseQuery.accessibleBy(options.ability)
    // }

    return baseQuery.lean().exec();
  }

  async exists(filter: FilterQuery<T & D>, options?: QueryOptions<T>) {
    let baseQuery = this.model.countDocuments(filter);

    // if (options?.ability) {
    //   baseQuery = baseQuery.accessibleBy(options.ability)
    // }

    if (options?.session) {
      baseQuery = baseQuery.session(options.session);
    }

    return (await baseQuery.exec()) > 0;
  }

  async findOneOrFail(filter: FilterQuery<T & D>, options?: QueryOptions<T>) {
    let baseQuery = this.model.findOne(filter);

    // if (options?.ability) {
    //   baseQuery = baseQuery.accessibleBy(options.ability)
    // }

    if (options?.session) {
      baseQuery = baseQuery.session(options.session);
    }

    const document = await baseQuery.lean().exec();

    if (!document) {
      throw new NotFoundException(
        `Document of type ${
          this.model.modelName
        } with filter criteria ${JSON.stringify(filter)} not found`,
      );
    }

    return document;
  }

  async find(filter: FilterQuery<T & D> = {}, options?: QueryOptions<T>) {
    const basicQuery = this.model.find(filter, this.expandProjection(options));

    // if (options?.ability) {
    //   basicQuery = basicQuery.accessibleBy(options.ability)
    // }

    const documents = await basicQuery.lean().exec();

    return plainToClass(this.options.baseClass, documents, {
      excludeExtraneousValues: false,
    });
  }

  async delete(filter: FilterQuery<T & D>, options?: QueryOptions<T>) {
    const exists = await this.exists(filter, options);

    if (!exists) {
      throw new NotFoundException(
        `Document of type ${this.model.modelName} not found`,
      );
    }

    let basicQuery = this.model.deleteMany(filter);

    // if (options?.ability) {
    //   basicQuery = basicQuery.accessibleBy(options.ability, Action.Delete)
    // }

    if (options?.session) {
      basicQuery = basicQuery.session(options.session);
    }

    return basicQuery.exec();
  }

  async update(
    filter: FilterQuery<T & D>,
    updateQuery: UpdateQuery<T & D>,
    options?: QueryOptions<T>,
  ) {
    const exists = await this.exists(filter, options);

    if (!exists) {
      throw new NotFoundException(
        `Document of type ${this.model.modelName} not found`,
      );
    }

    const basicQuery = this.model.updateOne(filter, updateQuery);

    // if (options?.ability) {
    //   basicQuery.accessibleBy(options.ability, Action.Update)
    // }

    if (options?.session) {
      basicQuery.session(options.session);
    }

    return basicQuery.exec();
  }

  async updateMany(
    filter: FilterQuery<T & D>,
    updateQuery: UpdateQuery<T & D>,
    options?: QueryOptions<T>,
  ) {
    const basicQuery = this.model.updateMany(filter, updateQuery);

    // if (options?.ability) {
    //   basicQuery.accessibleBy(options.ability, Action.Update)
    // }

    if (options?.session) {
      basicQuery.session(options.session);
    }

    return basicQuery.exec();
  }

  async create(document: Partial<T>) {
    const createdDocument = await this.model.create(document);

    return this.model.findOne({ _id: createdDocument._id }).lean().exec();
  }

  async findOneOrCreate(filter: FilterQuery<T & D>, document: Partial<T>) {
    const doc = await this.findOne(filter);

    if (doc) {
      return doc;
    }

    return this.create(document);
  }

  async updateAndGet(
    filter: FilterQuery<T & D>,
    updateQuery: UpdateQuery<T & D>,
    options?: QueryOptions<T>,
  ) {
    await this.update(filter, updateQuery, options);

    return this.findOneOrFail(filter, options);
  }

  /**
   *
   * @deprecated This method should be used only for debugging purpose
   */
  getMongooseModel() {
    return this.model;
  }
}
