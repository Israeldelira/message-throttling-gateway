import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    const messageLimit = this.configService.get<number>('messageLimit');
    const nodeEnv = this.configService.get<string>('nodeEnv');
    const port = this.configService.get<number>('port');

    console.log('NODE_ENV:', nodeEnv);
    console.log('PORT:', port);
    console.log('MESSAGE_LIMIT:', messageLimit);
    return 'Hello World!';
  }
}
