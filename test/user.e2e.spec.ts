import * as request from 'supertest';
import * as sharp from 'sharp';
import { AppModule } from '../src/app.module';
import { Connection } from 'typeorm';
import { DatabaseModule } from '../src/shared/database/database.module';
import { DatabaseService } from '../src/shared/database/database.service';
import { INestApplication } from '@nestjs/common';
import { Messages } from '../src/exceptions/text/messages';
import { MockFactory } from './mock.factory';
import { Test } from '@nestjs/testing';
import { TestUtils } from './test.utils';

describe('User (e2e)', () => {
  let app: INestApplication;
  let testUtils: TestUtils;
  const mockFactory = new MockFactory();
  let createUserDto;
  let secondUserDto;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [DatabaseService, TestUtils],
    }).compile();
    createUserDto = mockFactory.generateCreateUserDto();
    secondUserDto = mockFactory.generateCreateUserDto();
    testUtils = moduleFixture.get<TestUtils>(TestUtils);
    await testUtils.resetDb();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async (done) => {
    await testUtils.closeDbConnection();
    done();
  });

  afterAll(async () => {
    await testUtils.resetDb();
    await testUtils.shutdownServer(app.getHttpAdapter());
    const connect = await app.get(Connection);
    await connect.close();
    await app.close();
  });

  describe('POST /user', () => {
    it('should return created user', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);

      expect(createUserResponse.status).toBe(201);
      const createUserRO = JSON.parse(createUserResponse.text);
      expect(createUserRO.hasOwnProperty('user')).toBeTruthy();
      const { user } = createUserRO;
      expect(uuidRegex.test(user.id)).toBeTruthy();
      expect(user.firstName).toBe(createUserDto.firstName);
      expect(user.secondName).toBe(createUserDto.secondName);
      expect(user.email).toBe(createUserDto.email);
      expect(uuidRegex.test(user.id)).toBeTruthy();
      try {
      } catch (err) {
        throw err;
      }
    });

    it('should throw an exception when try create one more user with the same email', async () => {
      let createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(201);

      createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(400);
      const createUserRO = JSON.parse(createUserResponse.text);
      expect(createUserRO.message).toBe(Messages.USER_EXISTS);
      try {
      } catch (err) {
        throw err;
      }
    });

    it('should throw an exception when firstName is not passed in request', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(400);
      const createUserRO = JSON.parse(createUserResponse.text);
      expect(createUserRO.message).toBe(Messages.REQUIRED_VALUE_MISSING);
      try {
      } catch (err) {
        throw err;
      }
    });

    it('should throw an exception when user email is not passed in request', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(400);
      const createUserRO = JSON.parse(createUserResponse.text);
      expect(createUserRO.message).toBe(Messages.REQUIRED_VALUE_MISSING);
      try {
      } catch (err) {
        throw err;
      }
    });

    it('should throw an exception when file not attached', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .set('Accept', 'application/json');
      expect(createUserResponse.status).toBe(400);
      const createUserRO = JSON.parse(createUserResponse.text);
      expect(createUserRO.message).toBe(Messages.REQUIRED_VALUE_MISSING);
      try {
      } catch (err) {
        throw err;
      }
    });
  });

  describe('GET /users', () => {
    it('should return found users', async () => {
      let createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(201);

      createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', secondUserDto.firstName)
        .field('secondName', secondUserDto.secondName)
        .field('email', secondUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(201);

      const getUsersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      const getUsersRO = JSON.parse(getUsersResponse.text);
      expect(Array.isArray(getUsersRO)).toBeTruthy();
      expect(getUsersRO.length).toBe(2);
      expect(getUsersRO[0].user.firstName).toBe(createUserDto.firstName);
      expect(getUsersRO[0].user.secondName).toBe(createUserDto.secondName);
      expect(getUsersRO[0].user.email).toBe(createUserDto.email);
      expect(getUsersRO[1].user.firstName).toBe(secondUserDto.firstName);
      expect(getUsersRO[1].user.secondName).toBe(secondUserDto.secondName);
      expect(getUsersRO[1].user.email).toBe(secondUserDto.email);
      try {
      } catch (err) {
        throw err;
      }
    });
  });

  describe('GET /user/:id', () => {
    it('should return found user', async () => {
      let createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(201);

      createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', secondUserDto.firstName)
        .field('secondName', secondUserDto.secondName)
        .field('email', secondUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(201);
      const createUserRo = JSON.parse(createUserResponse.text);
      const searchedUserId = createUserRo.user.id;

      const getUsersResponse = await request(app.getHttpServer())
        .get(`/user/${searchedUserId}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      const getUsersRO = JSON.parse(getUsersResponse.text);
      const {
        user: { id, firstName, secondName, email },
      } = getUsersRO;
      expect(id).toBe(searchedUserId);
      expect(firstName).toBe(secondUserDto.firstName);
      expect(secondName).toBe(secondUserDto.secondName);
      expect(email).toBe(secondUserDto.email);
      try {
      } catch (err) {
        throw err;
      }
    });
  });

  describe('GET /user/photo/:id', () => {
    it('should return found user', async () => {
      const createUserResponse = await request(app.getHttpServer())
        .post('/user')
        .set('Content-Type', 'application/json')
        .field('firstName', createUserDto.firstName)
        .field('secondName', createUserDto.secondName)
        .field('email', createUserDto.email)
        .set('Accept', 'application/json')
        .attach('file', `${process.cwd()}/test/test-files/testImg.jpeg`);
      expect(createUserResponse.status).toBe(201);
      const createUserRo = JSON.parse(createUserResponse.text);
      const searchedUserId = createUserRo.user.id;
      const getUsersResponse = await request(app.getHttpServer())
        .get(`/user/photo/${searchedUserId}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      await sharp(getUsersResponse.body).toFile(
        `${process.cwd()}/test/test-files/response-files/response.jpeg`,
        (err, info) => {
          if (err) console.log('-> err', err);
          if (info) console.log('-> info', info);
        },
      );
      try {
      } catch (err) {
        throw err;
      }
    });
  });
});
