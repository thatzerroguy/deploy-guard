import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('health')
export class AppController {
  constructor() {}

  @Get()
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      status: 'OK',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}
