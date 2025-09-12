import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  title;

  @IsString()
  description;

  @IsEnum(['apartment', 'villa', 'studio', 'townhouse', 'penthouse', 'compound_villa', 'room', 'duplex', 'chalet', 'farm_house', 'shared_room'])
  propertyType;

  @IsString()
  city;

  @IsOptional()
  @IsString()
  area;

  @IsOptional()
  @IsString()
  district;

  @IsNumber()
  @Min(1)
  bedrooms;

  @IsNumber()
  @Min(1)
  bathrooms;

  @IsNumber()
  @Min(1)
  beds;

  @IsNumber()
  @Min(1)
  maxGuests;

  @IsNumber()
  @Min(0)
  monthlyPrice;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cleaningFee;

  @IsOptional()
  @IsNumber()
  @Min(0)
  securityDeposit;

  @IsOptional()
  @IsNumber()
  @Min(28)
  minNights;

  @IsOptional()
  @IsNumber()
  @Max(365)
  maxNights;

  @IsOptional()
  @IsBoolean()
  instantBook;

  @IsOptional()
  @IsString()
  checkInTime;

  @IsOptional()
  @IsString()
  checkOutTime;

  @IsOptional()
  @IsArray()
  photos;

  @IsOptional()
  @IsString()
  houseRules;

  @IsOptional()
  @IsString()
  checkInInstructions;

  @IsOptional()
  coordinates;

  @IsOptional()
  inUnitFeatures;

  @IsOptional()
  buildingFacilities;

  @IsOptional()
  compoundAmenities;

  @IsOptional()
  safetyFeatures;
}