import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendToEmail(data: ISendMailOptions): Promise<void> {
    this.mailerService.sendMail(data).catch((err) => {
      throw new BadRequestException('message not sent');
    });
  }
}
