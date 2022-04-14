import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repository } from 'src/core/mongoose/repository/repository';
import { RefreshSessionDocument, RefreshSessionEntity } from '..';

@Injectable()
export class RefreshSessionRepository extends Repository<
  RefreshSessionEntity,
  RefreshSessionDocument
> {
  constructor(
    @InjectModel(RefreshSessionEntity.name)
    private refreshSessionEntity: Model<RefreshSessionDocument>,
  ) {
    super(refreshSessionEntity, { baseClass: RefreshSessionEntity });
  }
}
