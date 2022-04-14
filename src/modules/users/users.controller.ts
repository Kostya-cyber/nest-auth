import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FailInterface, SuccessInterface } from 'src/core/interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GetUsers } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('createUser')
  @ApiOkResponse({ type: UserEntity })
  public async create(@Body() body: CreateUserDto): Promise<UserEntity> {
    return await this.usersService.createUser(body);
  }

  @Get('getUsers')
  @ApiResponse({ type: UserEntity })
  public async findAll(@Query() query: GetUsers): Promise<UserEntity[]> {
    return await this.usersService.getUsers(query);
  }

  @Get('getUserById')
  @ApiResponse({ type: UserEntity })
  public async findOne(@Query('id') id: string): Promise<UserEntity> {
    return await this.usersService.getUserById(id);
  }

  @Patch('updateUser')
  @ApiResponse({ type: UserEntity })
  public async updateUserById(
    @Body() body: UpdateUserDto,
  ): Promise<UserEntity> {
    return await this.usersService.updateUserById(body);
  }

  @Delete('deleteUserById')
  @ApiBadRequestResponse({ type: FailInterface })
  public async remove(
    @Body() body: DeleteUserDto,
  ): Promise<SuccessInterface<any> | FailInterface> {
    const deleteResult = await this.usersService.deleteUserById(body);
    if (!deleteResult.deletedCount) {
      return { status: 'fail', message: 'user with id was not found' };
    } else {
      return { status: 'success', data: deleteResult };
    }
  }
}
