import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MeModule } from 'src/me/me.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [MeModule],
})
export class ProjectModule {}
