import * as path from 'path';
import {
  Get,
  Post,
  Body,
  Param,
  Controller,
  UsePipes,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
} from '@nestjs/common';
import { CreateUserDto } from './dto';
import { createReadStream } from 'fs';
import { IUserRO } from './user.interface';
import { UserService } from './user.service';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
  })
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file'))
  @Post('user')
  async create(
    @Body('firstName') firstName: string,
    @Body('secondName') secondName: string,
    @Body('email') email: string,
    @UploadedFile('file') photo: Express.Multer.File,
  ): Promise<IUserRO> {
    return this.userService.create({ firstName, secondName, email, photo });
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @Get('users')
  async findAll(): Promise<Array<IUserRO>> {
    return await this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user' })
  @ApiResponse({ status: 200, description: 'Return found user' })
  @Get('user/:id')
  async findOne(@Param() params): Promise<IUserRO> {
    return await this.userService.findOne(params.id);
  }

  @ApiOperation({ summary: 'Get user photo' })
  @ApiResponse({ status: 200, description: 'Return found user photo' })
  @Get('user/photo/:id')
  async findOnePhoto(@Param() params): Promise<StreamableFile> {
    const fileName = await this.userService.findPhotoName(params.id);
    const filesPatch = path.join(process.cwd(), 'storage', fileName);
    const file = createReadStream(filesPatch);
    return new StreamableFile(file);
  }
}
