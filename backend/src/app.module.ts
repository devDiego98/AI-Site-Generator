import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { GenerateUiModule } from './generate-ui/generate-ui.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GenerateUiModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
