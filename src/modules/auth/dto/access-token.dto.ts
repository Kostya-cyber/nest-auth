import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from '.';

export class AccessTokenDto {
  @ApiProperty({ type: TokenDto })
  accessToken: TokenDto;
}
