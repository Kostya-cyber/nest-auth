import { ApiProperty } from '@nestjs/swagger';

export class StatusInterface {
  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: String })
  message: string;
}
