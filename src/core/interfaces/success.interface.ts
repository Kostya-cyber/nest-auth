import { ApiProperty } from '@nestjs/swagger';

export class SuccessInterface<T> {
  @ApiProperty({ type: 'success' })
  status: 'success';

  @ApiProperty({ type: Object })
  data: T;
}
