import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from './token.dto';

export class LoginTokenDto {
  @ApiProperty({ type: TokenDto })
  accessToken: TokenDto;

  @ApiProperty({ type: TokenDto })
  refreshToken: TokenDto;
}
