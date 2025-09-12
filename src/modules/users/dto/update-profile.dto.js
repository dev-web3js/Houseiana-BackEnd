import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class UpdateProfileDto {
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
  @IsEmail()
  email;

  @IsOptional()
  @IsString()
  phone;

  @IsOptional()
  @IsString()
  phoneNumber;

  @IsOptional()
  @IsString()
  bio;

  @IsOptional()
  @IsString()
  profileImage;

  @IsOptional()
  @IsString()
  coverImage;

  @IsOptional()
  @IsString()
  language;

  @IsOptional()
  @IsString()
  currency;

  @IsOptional()
  @IsString()
  timezone;

  @IsOptional()
  @IsBoolean()
  emailNotifications;

  @IsOptional()
  @IsBoolean()
  smsNotifications;

  @IsOptional()
  @IsBoolean()
  pushNotifications;

  @IsOptional()
  @IsBoolean()
  marketingEmails;
}