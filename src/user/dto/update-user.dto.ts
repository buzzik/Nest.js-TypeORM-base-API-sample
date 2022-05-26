import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly username: string;

  @IsEmail()
  @IsOptional()
  readonly email: string;

  readonly image: string;

  @IsString()
  @IsOptional()
  readonly bio: string;
}
