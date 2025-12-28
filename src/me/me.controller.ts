import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

export interface AuthenticatedRequest extends Request {
  user: {
    api_key: string;
    id: string;
  };
}

@Controller('me')
export class MeController {
  private readonly logger = new Logger(MeController.name);

  constructor(private readonly meService: MeService) {}

  @UseGuards(AuthGuard)
  @UseGuards(ThrottlerGuard)
  @Get()
  getMe(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return req.user;
  }
}
