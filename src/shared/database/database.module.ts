import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.test.env' }), TypeOrmModule.forRoot()],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
