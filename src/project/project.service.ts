import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleDatabase } from 'src/database/database.types';
import { environmentSchema, project, user } from 'src/database/schema';
import { CreateEnvironmentDto } from './dto/environment.dto';
import dotenv from 'dotenv';

type EnvFieldType = 'string' | 'number' | 'boolean';

interface EnvSchemaField {
  type: EnvFieldType;
  required: boolean;
}

type EnvSchema = Record<string, EnvSchemaField>;

type ValidationStatus = 'pass' | 'fail';

interface ValidationError {
  key: string;
  message: string;
}

interface ValidationWarning {
  key: string;
  message: string;
}

export interface ValidationResults {
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  constructor(
    @Inject('DRIZZLE')
    private readonly db: DrizzleDatabase,
  ) {}

  async createProject(name: string, user_id: string) {
    try {
      // Find user
      const owner = await this.db.query.user.findFirst({
        where: eq(user.api_key, user_id),
      });
      if (!owner) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Create project
      const [projects] = await this.db
        .insert(project)
        .values({
          name,
          owner_id: owner.id,
        })
        .returning({
          name: project.name,
          id: project.id,
        });

      return {
        name: projects.name,
        id: projects.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async createEnvironmentSchema(
    id: string,
    environmentDto: CreateEnvironmentDto,
    user_id: string,
  ) {
    try {
      // Check user
      const owner = await this.db.query.user.findFirst({
        where: eq(user.api_key, user_id),
        with: {
          projects: {
            columns: {
              id: true,
              owner_id: true,
            },
          },
        },
      });
      if (!owner) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Check if project exists
      const projectt = await this.db.query.project.findFirst({
        where: eq(project.id, id),
        with: {
          owner: {
            columns: {
              id: true,
            },
          },
        },
      });
      if (!projectt) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }
      if (projectt.owner.id !== owner.id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      // Create environment schema
      const [environment] = await this.db
        .insert(environmentSchema)
        .values({
          environment_name: environmentDto.environment_name,
          schema: environmentDto.schema,
          project_id: projectt.id,
        })
        .returning();

      return {
        name: environment.environment_name,
        id: environment.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to create environment schema', error);
      throw new InternalServerErrorException(
        'Failed to create environment schema',
      );
    }
  }

  private parseEnv(env: string): Record<string, string> {
    return dotenv.parse(env);
  }

  private validateEnvAgainstSchema(
    env: string,
    schema: EnvSchema,
  ): ValidationResults {
    const parsedEnv = this.parseEnv(env);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = parsedEnv[key];
      const { type, required } = rules;

      // 1. Required check
      if (required && (value === undefined || value === '')) {
        errors.push({
          key,
          message: `Missing required field ${key}`,
        });
        continue;
      }

      // Check optional env missing
      if (!required && value === undefined) {
        warnings.push({
          key,
          message: `Optional environment variable ${key} is missing`,
        });
        continue;
      }

      // 2. Skip type checks if value is empty & not required
      if (value === undefined || value === '') {
        continue;
      }

      // 3. Type validation
      if (type === 'number') {
        if (isNaN(Number(value))) {
          errors.push({
            key,
            message: `Invalid type for ${key}, expected number`,
          });
        }
      }

      if (type === 'boolean') {
        if (value !== 'true' && value !== 'false') {
          errors.push({
            key,
            message: `Invalid type for ${key}, expected boolean`,
          });
        }
      }
    }

    // Check for extra env and throw warning
    for (const key of Object.keys(parsedEnv)) {
      if (!schema[key]) {
        warnings.push({
          key,
          message: `Extra environment variable ${key} found`,
        });
      }
    }

    // Return type based on pass or fail
    if (errors.length === 0) {
      return {
        status: 'pass',
        errors: [],
        warnings,
      };
    } else {
      return {
        status: 'fail',
        errors,
        warnings,
      };
    }
  }

  public async validateEnv(project_id: string, env: string) {
    const envSchema = await this.db.query.environmentSchema.findFirst({
      where: eq(project.id, project_id),
    });

    if (!envSchema) {
      throw new NotFoundException('Project not found');
    }

    return this.validateEnvAgainstSchema(env, envSchema.schema as EnvSchema);
  }
}
