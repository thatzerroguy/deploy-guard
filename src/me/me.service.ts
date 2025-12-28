import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleDatabase } from 'src/database/database.types';
import { user } from 'src/database/schema';

@Injectable()
export class MeService {
  private readonly logger = new Logger(MeService.name);
  constructor(
    @Inject('DRIZZLE')
    private readonly db: DrizzleDatabase,
  ) {}

  async getUser(api_key: string) {
    const result = await this.db.query.user.findFirst({
      where: eq(user.api_key, api_key),
    });

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }
}
