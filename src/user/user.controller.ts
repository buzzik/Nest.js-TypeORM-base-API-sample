import { Get, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseInterface } from './types/user-response.interface';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { Request } from 'express';
import { ExpressRequestInterface } from 'src/types/express-request.interface';
import { User } from './decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const newUser: UserEntity = await this.userService.createUser(
      createUserDto,
    );
    const response = this.userService.buildUserResponse(newUser);
    return response;
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user: UserEntity = await this.userService.login(loginUserDto);
    const response: UserResponseInterface =
      this.userService.buildUserResponse(user);
    return response;
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getCurrentUser(
    // @Req() request: ExpressRequestInterface,
    @User() user: UserEntity,
    @User('id') id: number,
  ): Promise<UserResponseInterface> {
    console.log('id', id);
    // return this.userService.buildUserResponse(request.user);
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') userDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateUser(
      currentUserId,
      userDto,
    );
    return this.userService.buildUserResponse(updatedUser);
  }
}
