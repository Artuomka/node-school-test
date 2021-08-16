import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  try {
    const appOptions = { cors: true };
    const app = await NestFactory.create(AppModule, appOptions);

    app.useGlobalFilters(new AllExceptionsFilter());

    const options = new DocumentBuilder()
      .setTitle('Node School Test App')
      .setDescription('The Node School app API description')
      .setVersion('0.0.1')
      .addTag('node-school-test')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    app.use(helmet());
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
      }),
    );

    await app.listen(3000);
  } catch (e) {
    console.error(`Failed to initialize, due to ${e}`);
    process.exit(1);
  }
}

const temp = process.exit;

process.exit = () => {
  console.trace();
  process.exit = temp;
  process.exit();
};

bootstrap().catch((e) => {
  console.error(`Bootstrap promise failed with error: ${e}`);
  process.exit(1);
});
