import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateEnvironmentDto } from './dto/environment.dto';

export interface AuthenticatedRequest extends Request {
  user: {
    api_key: string;
    id: string;
  };
}

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createProject(
    @Body('name') name: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const api_key = req.user.api_key;
    return await this.projectService.createProject(name, api_key);
  }

  @UseGuards(AuthGuard)
  @Post('/:id/schema')
  async createSchema(
    @Param('id') id: string,
    @Body() schema: CreateEnvironmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user_id = req.user.api_key;
    return await this.projectService.createEnvironmentSchema(
      id,
      schema,
      user_id,
    );
  }
}
