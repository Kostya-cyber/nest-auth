import { ApiProperty } from '@nestjs/swagger';

export class FailInterface {
  @ApiProperty({ type: 'fail' })
  status: 'fail';

  @ApiProperty({ type: String })
  message: string;
}
