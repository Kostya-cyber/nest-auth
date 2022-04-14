import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repository } from 'src/core/mongoose/repository/repository';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GetUsers } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument, UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<UserEntity, UserDocument> {
  constructor(
    @InjectModel(UserEntity.name)
    private userEntity: Model<UserDocument>,
  ) {
    super(userEntity, { baseClass: UserEntity });
  }

  async createUser(body: CreateUserDto): Promise<UserEntity> {
    return this.userEntity.create(body);
  }

  async getUserById(id: string): Promise<UserEntity> {
    return this.userEntity.findOne({ _id: id });
  }

  async getUsers(query: GetUsers): Promise<UserEntity[]> {
    return this.userEntity.find(query);
  }

  async updateUserById(body: UpdateUserDto): Promise<UserEntity> {
    const { id, ...data } = body;
    return this.userEntity.findByIdAndUpdate(id, data, { new: true });
  }

  async updateUserPasswordByEmail(
    email: string,
    password: string,
  ): Promise<void> {
    await this.userEntity.updateOne({ email }, { password });
  }

  async deleteUserById(body: DeleteUserDto) {
    return this.userEntity.deleteOne({ _id: body.id });
  }

  async findUserByLogin(login: string): Promise<UserEntity | undefined> {
    return this.userEntity.findOne({ login });
  }
}
