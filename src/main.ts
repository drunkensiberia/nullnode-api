import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials:true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT);
}
bootstrap();
