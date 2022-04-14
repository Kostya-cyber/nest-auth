import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = UserEntity & Document;
@Schema({
  collection: 'users',
  timestamps: false,
  versionKey: false,
})
export class UserEntity {
  readonly _id!: Types.ObjectId;

  @Prop()
  login: string;

  @Prop()
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
