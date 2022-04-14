import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshSessionService } from './application';
import {
  RefreshSessionEntity,
  RefreshSessionRepository,
  RefreshSessionSchema,
} from './infastructure';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshSessionEntity.name, schema: RefreshSessionSchema },
    ]),
  ],
  providers: [RefreshSessionService, RefreshSessionRepository],
  exports: [RefreshSessionService],
})
export class RefreshSessionModule {}
