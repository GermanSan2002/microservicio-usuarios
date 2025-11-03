import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'src/modules/client/entities/Client';
import { Role } from 'src/modules/roles/entities/Role';
import { Operation } from 'src/modules/user/entities/Operation';
import { User } from 'src/modules/user/entities/User';
import { DataSource, DataSourceOptions } from 'typeorm';

ConfigModule.forRoot({
  envFilePath: ['.env'],
});

const configService = new ConfigService();

export const DataSourceConfig: DataSourceOptions = {
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [User, Operation, Role, Client],
  synchronize: true,
};

export const AppDS = new DataSource(DataSourceConfig);
