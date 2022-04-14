import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadUserDto } from '.';

export const Payload = createParamDecorator(function (
  data: unknown,
  context: ExecutionContext,
): PayloadUserDto {
  const req = context.switchToHttp().getRequest();
  return req.user;
});
