import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config/app.config';
import { databaseConfig, getTypeOrmConfig } from './config/database.config';
import { DispatcherModule } from './modules/dispatcher/dispatcher.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MockProviderModule } from './modules/mock-provider/mock-provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    MessagesModule,
    DispatcherModule,
    MockProviderModule,
  ],
})
export class AppModule {}
