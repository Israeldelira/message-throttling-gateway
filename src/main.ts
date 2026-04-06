import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  const serverUrl = `http://localhost:${port}`;
  const swaggerUrl = `${serverUrl}/docs`;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Message Throttling Gateway')
    .setDescription(
      'API para la gestión de envío de mensajes con control de tasa, entrega garantizada y trazabilidad.',
    )
    .setVersion('1.0')
    .addServer(serverUrl, 'Servidor local')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);

  console.log(`Server URL: ${serverUrl}`);
  console.log(`Swagger URL: ${swaggerUrl}`);
}
bootstrap();
