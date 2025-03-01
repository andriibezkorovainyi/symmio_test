import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { VALIDATED_ENV_PROPNAME } from '@nestjs/config/dist/config.constants';
import { DotenvParseOutput, parse } from 'dotenv';

import * as fs from 'fs';
import path from 'path';
import {
  EnvironmentEnum,
  EnvironmentDTO,
  LoggingLevelsEnum,
  validate,
} from './config.validate';

@Injectable()
export class AppConfigService extends ConfigService<EnvironmentDTO> {
  private static instance: AppConfigService;

  constructor(internalConfig?: Record<string, any>) {
    super(internalConfig);

    // @ts-expect-error: @nestjs/config ALWAYS reads from process.env so this causes it to read internally
    this.getFromProcessEnv = () => undefined;
  }

  static getInstance() {
    const envPath = path.resolve(process.cwd(), '.env');

    let config: DotenvParseOutput = {};

    if (fs.existsSync(envPath)) {
      const envData = fs.readFileSync(envPath);
      config = fs.existsSync(envPath) ? parse(envData) : {};
    }

    AppConfigService.instance = new AppConfigService({
      [VALIDATED_ENV_PROPNAME]: validate({ ...process.env, ...config }),
    });

    return AppConfigService.instance;
  }

  get environment() {
    return <EnvironmentEnum>this.get('NODE_ENV');
  }

  get isTest() {
    return this.environment === EnvironmentEnum.TEST;
  }

  get isLocal() {
    return this.environment === EnvironmentEnum.LOCAL;
  }

  get isDevelopment() {
    return this.environment === EnvironmentEnum.DEVELOPMENT;
  }

  get isProduction() {
    return this.environment === EnvironmentEnum.PRODUCTION;
  }

  get isStaging() {
    return this.environment === EnvironmentEnum.STAGING;
  }

  get port() {
    return <number>this.get('PORT');
  }

  get logger() {
    return {
      level: <LoggingLevelsEnum>this.get('LOGGING_LEVEL'),
      transport: {
        console:
          this.isDevelopment ||
          this.isLocal ||
          this.isStaging ||
          this.isProduction,
        file: this.isLocal || this.isDevelopment || this.isProduction,
      },
      datePattern: 'YYYY-MM-DD',
      maxFiles: '90d',
      maxSize: '100m',
      logPath: 'logs',
    };
  }

  get apiRootUrl() {
    return <string>this.get('API_ROOT_URL');
  }

  get appName() {
    return <string>this.get('APP_NAME');
  }

  get database(): PostgresConnectionOptions {
    const master = this.getDbConfig(<string>this.get('DB_HOST'));

    return {
      logging: !this.isProduction,
      type: 'postgres',
      replication: { master, slaves: [master] },
    };
  }

  // get rabbitMq() {
  //   return {
  //     username: <string>this.get('RABBITMQ_USER'),
  //     password: <string>this.get('RABBITMQ_PASSWORD'),
  //     host: <string>this.get('RABBITMQ_HOST'),
  //     port: <string>this.get('RABBITMQ_PORT'),
  //     protocol: <string>this.get('RABBITMQ_PROTOCOL'),
  //   };
  // }

  private getDbConfig(host: string): PostgresConnectionCredentialsOptions {
    const masterConfig = {
      host: <string>this.get('DB_HOST'),
      port: <number>this.get('DB_PORT'),
      username: <string>this.get('DB_USERNAME'),
      password: <string>this.get('DB_PASSWORD'),
      database: <string>this.get('DB_DATABASE'),
      ...this.getDbSecureOptions(false),
    };

    try {
      const url = new URL(`http://${host}`);
      const ssl = url.searchParams.get('ssl');

      return {
        host: url.hostname || masterConfig.host,
        port: url.port ? +url.port : masterConfig.port,
        username: url.username || masterConfig.username,
        password: url.password || masterConfig.password,
        database: url.searchParams.get('database') || masterConfig.database,
        ...this.getDbSecureOptions(false),
      };
    } catch {
      return masterConfig;
    }
  }

  private getDbSecureOptions(ssl: boolean) {
    return (
      ssl && {
        ssl: {
          rejectUnauthorized: true,
          ca: fs
            .readFileSync(
              path.resolve(process.cwd(), 'src/etc', 'eu-central-1-bundle.pem'),
            )
            .toString(),
        },
        extra: {
          ssl: true,
        },
      }
    );
  }
}
