import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
// import { JWT_SECRET } from 'src/config';
import configuration from '../config/configuration';
import { UserResponseInterface } from './types/user-response.interface';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    const userByUserName = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });
    if (userByEmail || userByUserName) {
      throw new HttpException(
        'Email or username already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return this.userRepository.save(newUser);
  }

  generateJwt(user: UserEntity): string {
    const jwtSecret = this.configService.get<string>('app.jwtSecret');
    return sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: '7d' },
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    const result = {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };

    return result;
  }

  async login(loginUserDto: LoginUserDto) {
    // const users = await this.userRepository.find();

    // const user = await this.userRepository.findOne(
    //   {
    //     email: loginUserDto.email,
    //   },
    //   { select: ['id', 'username', 'email', 'password', 'bio', 'image'] },
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: ['id', 'username', 'email', 'password', 'bio', 'image'],
    });
    if (!user) {
      throw new HttpException('No such user', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const isValidPassword = await compare(loginUserDto.password, user.password);

    if (!isValidPassword) {
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
    }
    delete user.password;
    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}
