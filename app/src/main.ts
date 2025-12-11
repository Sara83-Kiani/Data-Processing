import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { XmlResponseInterceptor } from './common/interceptors/xml-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend access
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Enable global validation pipes for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  app.useGlobalInterceptors(new XmlResponseInterceptor());
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 StreamFlix API is running on: http://localhost:${port}`);
}
bootstrap();
