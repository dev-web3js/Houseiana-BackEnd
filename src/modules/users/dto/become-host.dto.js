import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class BecomeHostDto {
  @IsOptional()
  @IsString()
  bio;

  @IsOptional()
  @IsString()
  governmentId;

  @IsOptional()
  @IsString()
  governmentIdType;

  @IsOptional()
  @IsString()
  tradeLicense;

  @IsOptional()
  @IsString()
  bankName;

  @IsOptional()
  @IsString()
  accountNumber;

  @IsOptional()
  @IsString()
  accountHolderName;

  @IsOptional()
  @IsString()
  iban;

  @IsOptional()
  @IsString()
  swiftCode;

  @IsOptional()
  propertyDocs;

  @IsOptional()
  @IsBoolean()
  agreeToTerms;
}