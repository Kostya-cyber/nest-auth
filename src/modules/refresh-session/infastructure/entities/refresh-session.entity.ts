import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshSessionDocument = RefreshSessionEntity & Document;
@Schema({
  collection: 'refresh_session',
  timestamps: false,
  versionKey: false,
})
export class RefreshSessionEntity {
  readonly _id!: Types.ObjectId;

  @Prop()
  userId: string;

  @Prop()
  refreshToken: string;

  @Prop()
  ua: string;

  @Prop()
  ip: string;
}

export const RefreshSessionSchema =
  SchemaFactory.createForClass(RefreshSessionEntity);
