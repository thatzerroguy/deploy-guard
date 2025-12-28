import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MeModule } from './me/me.module';
import { DatabaseModule } from './database/database.module';
import config from './config/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['src/config/.env.development.local'],
      load: [config],
      expandVariables: true,
    }),
    MeModule,
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
