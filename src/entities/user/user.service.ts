import { CreateUserDto } from './dto';
import { forwardRef, HttpStatus, Inject } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ImageService } from '../image/image.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserRO } from './user.interface';
import { Messages } from '../../exceptions/text/messages';
import { UserEntity } from './user.entity';
import { validate } from 'class-validator';

export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => ImageService))
    private readonly imageService: ImageService,
  ) {
  }

  async findAll(): Promise<Array<IUserRO>> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      return this.buildUserRO(user);
    });
  }

  async findOne(userId: string): Promise<IUserRO> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new HttpException(
        {
          message: Messages.USER_NOT_FOUND,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.buildUserRO(user);
  }

  async findPhotoName(userId: string): Promise<any> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new HttpException(
        {
          message: Messages.USER_NOT_FOUND,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.imageService.getPhotoName(userId);
  }

  async create(dto: CreateUserDto): Promise<IUserRO> {
    const { firstName, secondName, email, photo } = dto;
    // prettier-ignore
    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.email = :userEmail', { userEmail: email });
    const user = await qb.getOne();
    if (user) {
      throw new HttpException(
        {
          message: Messages.USER_EXISTS,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = new UserEntity();
    newUser.firstName = firstName;
    newUser.secondName = secondName;
    newUser.email = email;

    const errors = await validate(newUser);
    if (errors.length > 0) {
      throw new HttpException(
        {
          message: Messages.USER_VALIDATION_FILED(errors),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const savedUser = await this.userRepository.save(newUser);
    await this.imageService.saveImage(savedUser.id, photo);
    return this.buildUserRO(savedUser);
  }

  private buildUserRO(user: UserEntity): IUserRO {
    const userRO = {
      id: user.id,
      firstName: user.firstName,
      secondName: user.secondName,
      email: user.email,
    };
    return { user: userRO };
  }
}
