import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Usar ConfigService para obtener el puerto desde las variables de entorno
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.enableCors({
    origin: ['http://localhost:5000', 'http://localhost:3000'], // Cambia esto a la URL de tu frontend, o añadela manualmente
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
