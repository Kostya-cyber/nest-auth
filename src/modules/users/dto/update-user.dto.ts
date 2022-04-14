import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsEmail()
  login?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  lastName?: string;
}
