import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  environment_name: string;

  @IsJSON()
  schema: JSON;
}
