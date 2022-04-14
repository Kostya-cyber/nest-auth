import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GetUsers } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(body: CreateUserDto): Promise<UserEntity> {
    try {
      const result = await this.usersRepository.createUser(body);
      return result;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getUsers(query: GetUsers): Promise<UserEntity[]> {
    return this.usersRepository.getUsers(query);
  }

  async getUserById(id: string): Promise<UserEntity> {
    return this.usersRepository.getUserById(id);
  }

  async updateUserById(body: UpdateUserDto): Promise<UserEntity> {
    return this.usersRepository.updateUserById(body);
  }

  async updateUserPasswordByEmail(
    email: string,
    password: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(password, 10);
    await this.usersRepository.updateUserPasswordByEmail(email, hash);
  }

  async deleteUserById(body: DeleteUserDto) {
    return this.usersRepository.deleteUserById(body);
  }

  async findUserByLogin(login: string): Promise<UserEntity | undefined> {
    return this.usersRepository.findUserByLogin(login);
  }
}
