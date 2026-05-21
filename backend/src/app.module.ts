import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  providers: [AppService],
})
export class AppModule {}
