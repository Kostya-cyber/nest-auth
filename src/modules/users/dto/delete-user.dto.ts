import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
