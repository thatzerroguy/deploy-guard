import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { MeService } from 'src/me/me.service';
import { Logger } from '@nestjs/common';

@Injectable()
/**
 * @description - API guard for reading API keys from request headers.
 */
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly meService: MeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader) {
      throw new UnauthorizedException('API key is missing');
    }

    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    try {
      const user = await this.meService.getUser(apiKey);

      (request as any).user = user;
      return true;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw new UnauthorizedException('Invalid API key');
      }
      throw error;
    }
  }
}
