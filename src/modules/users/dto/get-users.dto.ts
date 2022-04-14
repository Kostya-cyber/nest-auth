import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUsers {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  login?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
}
