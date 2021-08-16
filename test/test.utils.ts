import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../src/shared/database/database.service';

@Injectable()
export class TestUtils {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Utils only for testing');
    }
    this.databaseService = databaseService;
  }

  async shutdownServer(server: any): Promise<void> {
    await server.httpServer.close();
    await this.closeDbConnection();
  }

  async closeDbConnection(): Promise<void> {
    const connection = await this.databaseService.connection;
    if (connection.isConnected) {
      await (await this.databaseService.connection).close();
    }
  }

  private async getEntities() {
    const entities = [];
    (await this.databaseService.connection).entityMetadatas.forEach((x) =>
      entities.push({ name: x.name, tableName: x.tableName }),
    );
    return entities;
  }

  async resetDb(): Promise<void> {
    const entities = await this.getEntities();
    await this.cleanAll(entities);
  }

  private async cleanAll(entities) {
    let repository;
    try {
      for (let i = 0; i < entities.length; i++) {
        repository = await this.databaseService.getRepository(entities[i].name);
        await repository.query(`DELETE FROM "${entities[i].tableName}";`);
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }
}
