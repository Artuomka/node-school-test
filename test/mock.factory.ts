import * as faker from 'faker';
import { CreateUserDto } from '../src/entities/user/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockFactory {
  generateCreateUserDto(): CreateUserDto {
    const newCreateUserDto = new CreateUserDto();
    newCreateUserDto.firstName = faker.name.firstName();
    newCreateUserDto.secondName = faker.name.lastName();
    newCreateUserDto.email = faker.internet.email();
    return newCreateUserDto;
  }
}
