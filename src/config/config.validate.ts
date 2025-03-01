import { plainToInstance } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

export enum EnvironmentEnum {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
  TEST = 'test',
}

export enum LoggingLevelsEnum {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export class EnvironmentDTO {
  // Server
  @IsDefined()
  @IsEnum(EnvironmentEnum)
  NODE_ENV: EnvironmentEnum = EnvironmentEnum.LOCAL;

  @IsDefined()
  @IsNumberString()
  PORT = 3003;

  @IsDefined()
  @IsEnum(LoggingLevelsEnum)
  LOGGING_LEVEL: LoggingLevelsEnum = LoggingLevelsEnum.HTTP;

  @IsDefined()
  @IsUrl({ require_tld: false })
  API_ROOT_URL = 'http://localhost:3003';

  @IsDefined()
  @IsString()
  APP_NAME = 'Symmio Test';

  // ## DATABASE ##
  // MASTER
  @IsDefined()
  @IsString()
  DB_HOST!: string;

  @IsDefined()
  @IsNumber()
  DB_PORT!: number;

  @IsDefined()
  @IsString()
  DB_DATABASE!: string;

  @IsDefined()
  @IsString()
  DB_USERNAME!: string;

  @IsDefined()
  @IsString()
  DB_PASSWORD!: string;

  //
  // // RABBITMQ
  // @IsDefined()
  // @IsString()
  // RABBITMQ_USER!: string;
  //
  // @IsDefined()
  // @IsString()
  // RABBITMQ_PASSWORD!: string;
  //
  // @IsDefined()
  // @IsString()
  // RABBITMQ_HOST!: string;
  //
  // @IsDefined()
  // @IsString()
  // RABBITMQ_PORT!: string;
  //
  // @IsDefined()
  // @IsString()
  // RABBITMQ_PROTOCOL!: string;
}

export function validate(config: Record<string, unknown>): EnvironmentDTO {
  const validatedConfig = plainToInstance(EnvironmentDTO, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    whitelist: true,
    forbidUnknownValues: true,
    validationError: {
      target: false,
    },
  });

  if (errors.length > 0) {
    throw new Error(String(errors));
  }

  return validatedConfig;
}
