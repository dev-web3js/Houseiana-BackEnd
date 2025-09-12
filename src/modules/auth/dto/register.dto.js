import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email;

  @IsString()
  @MinLength(8)
  password;

  @IsOptional()
  @IsString()
  firstName;

  @IsOptional()
  @IsString()
  lastName;

  @IsOptional()
  @IsString()
  name;

  @IsOptional()
  @IsString()
  username;

  @IsOptional()
  @IsString()
  phone;

  @IsOptional()
  @IsString()
  phoneNumber;

  @IsOptional()
  @IsEnum(['guest', 'host', 'both'])
  role;

  @IsOptional()
  @IsString()
  bio;
}